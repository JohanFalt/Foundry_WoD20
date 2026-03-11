import WoDItemSheetV2 from "./item-sheet-v2.js";
import SelectHelper from "../../scripts/select-helpers.js";
import DropHelper from "../../scripts/drop-helpers.js";


const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the base ActorSheetV2 document
 * @extends {WoDItemSheetV2}
 */

export default class SplatItemSheet extends HandlebarsApplicationMixin(WoDItemSheetV2) {

    constructor(item, options) {
		super(item, options);      
        
        this.#dragDrop = this.#createDragDropHandlers();
	}

    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: true,
            handler:  SplatItemSheet.onSubmitItemForm
        },
        position: {
            width: 1000,
            height: 800
        }
    }

    static PARTS = {
        header: {
            template: 'systems/worldofdarkness/templates/items/parts/header-sheet.hbs'
        },
        tab: {
            template: 'systems/worldofdarkness/templates/items/parts/navigation.hbs'
        },
        stats: {
            template: 'systems/worldofdarkness/templates/items/splat-sheet.hbs'
        },
        abilities: {
            template: 'systems/worldofdarkness/templates/items/parts/splat-abilities-sheet.hbs'
        },
        features: {
            template: 'systems/worldofdarkness/templates/items/parts/splat-features-sheet.hbs'
        }
    }

    splat = "mortal";

    tabGroups = {
        primary: 'stats'
    }

    tabs = {
        stats: {
            id: 'stats',
            group: 'primary',
            title: 'wod.tab.settings'
        },
        abilities: {
            id: 'abilities',
            group: 'primary',
            title: 'wod.abilities.abilities'
        },
        features: {
            id: 'features',
            group: 'primary',
            title: 'wod.notes.features'
        }
    }

    getTabs() {
        const tabs = this.tabs

        for (const tab of Object.values(tabs)) {
            tab.active = this.tabGroups[tab.group] === tab.id;
            tab.cssClass = tab.active ? 'itemv2 item active' : 'itemv2 item';
        }

        return tabs;
    }

    getHealthLevels(item) {
        const health = {};

        for (const i in CONFIG.worldofdarkness.woundLevels) {
            health[i] = {
                label: item.system.health[i].label,
                value: item.system.health[i].value,
                penalty: item.system.health[i].penalty
            };
        }

        return health;
    }

    /** @override */
    async _prepareContext(options) {
        const data = await super._prepareContext();
        const item = this.item;
        const actor = this.item.actor;

        data.tabs = this.getTabs();
        data.healthlevels = this.getHealthLevels(this.item);
        data.listData = SelectHelper.SetupItem(item);
        //data.canEdit = this.item.isOwner || game.user.isGM;	

        if (item.actor != null) {
            data.hasActor = true;
            data.actor = item.actor;
        }
        else {
            data.hasActor = false;
        }

        data.item = item;

        console.log(`${data.item.name} - (${data.item.type})`);
        console.log(data.item);

        return {
            ...data
        }
    }

    async _preparePartContext (partId, context, options) {
        context = { ...(await super._preparePartContext(partId, context, options)) }

        // Top-level variables
        const item = this.item;

        // Only load what is neccessary
        switch (partId) {
            case 'stats':
                return prepareStatContext(context, item);
            case 'abilities':
                return prepareAbilitiesContext(context, item);
            case 'features':
                return prepareFeaturesContext(context, item);
        }

        return context
    }	  

    async render(force = false, options = {}) {
		await super.render(force, options);
	}
    
    async _onRender() {
        const html = $(this.element);

        // Drag and drop functionality
        this.#dragDrop.forEach((d) => d.bind(this.element));
    }

    static async onSubmitItemForm(event, form, formData) {
		await super.onSubmitItemForm(event, form, formData);

        this.render();
	}
    
    #dragDrop

    #createDragDropHandlers () {
        return this.options.dragDrop.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            }

            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            }
            return new foundry.applications.ux.DragDrop.implementation(d);
        })
    }

    /**
     * Override _onDragStart to handle advantage reordering separately from ability category changes.
     * Advantages use type "SortOrder" for position-based sorting within the same list.
     * Abilities continue to use type "Sort" for moving between Talent/Skill/Knowledge categories.
     * @param {DragEvent} event - The drag start event
     */
    _onDragStart(event) {
        const dataset = event.target.dataset;

        // Handle drag to order item lists (advantages, features, powers)
        if (dataset.list === "system.advantages" || dataset.list === "system.features" || dataset.list === "system.powers") {
            const data = {
                documentid: dataset.documentid,
                itemid: dataset.itemid,
                list: dataset.list,
                itemtype: dataset.type,
                type: "SortOrder"
            }
            event.dataTransfer.setData('text/plain', JSON.stringify(data));
            return;
        }

        // For all other drag operations (abilities), use parent implementation
        super._onDragStart(event);
    }

    async _onDrop(event) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

        // Handle different data types
        switch (data.type) {
            // Abilities category change - handled by parent class
            case 'Sort':                
                return super._onDrop(event);
            // Item position reordering - handled locally
            case 'SortOrder':                
                return this._onReorderItem(event, data);
            // Dropped Item from compendium/sidebar
            case 'Item':                
                return this._onDropItem(event, data);
        }
    }

    /**
     * Handle reordering of items within a list (advantages and features).
     * Uses the shared DropHelper.ReorderItemsInList() function.
     * @param {DragEvent} event - The drop event
     * @param {object} data - The drag data containing documentid, itemid, and list
     */
    async _onReorderItem(event, data) {
        // Validate this is the correct document
        if (data.documentid !== this.item._id) {
            // Clean up on early return
            this.element.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over');
            });
            return;
        }
        
        // Only handle items of correct type
        if (data.itemtype !== "Advantage" && data.itemtype !== "Trait" && data.itemtype !== "Sphere") {
            // Clean up on early return
            this.element.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over');
            });
            return;
        }

        let itemClass = "";

        if (data.itemtype === "Advantage") {
            itemClass = ".advantage-item";
        }
        else if ((data.itemtype === "Feature") || (data.itemtype === "Trait")) {
            itemClass = ".feature-item";
        }
        else if ((data.itemtype === "Sphere") || (data.itemtype === "Power")) {
            itemClass = ".power-item";
        }
        else {
            // Clean up on early return
            this.element.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over');
            });
            return;
        }

        let dropArea = data.itemtype.toLowerCase();
        dropArea = dropArea === "sphere" ? "powers" : dropArea;

        let orderProperty = "system.settings.order";
        orderProperty = data.itemtype === "Trait" ? 'system.order' : orderProperty;

        // Use the shared function from DropHelper
        await DropHelper.ReorderEmbeddedItemsInList(
            this.item,
            event,
            data,
            {
                itemClass: itemClass,
                dropArea: dropArea,
                orderProperty: orderProperty,
                sheet: this
            }
        );
        
        // Always clean up drag-over classes after reorder attempt
        this.element.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over');
        });
    } 

    /**
     * Override _onDragOver to provide visual feedback for drag-and-drop operations.
     * Handles advantage, feature, power reordering and ability category changes.
     * @param {DragEvent} event - The dragover event
     */
    _onDragOver(event) {
        // Remove previous hover classes from all draggable items
        this.element.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over');
        });

        // Item classes that support drag-over feedback
        const itemClasses = ['.advantage-item', '.feature-item', '.power-item', '.ability-item'];
        
        // Check for any item drop target
        for (const itemClass of itemClasses) {
            const target = event.target.closest(itemClass);
            if (target) {
                const rect = target.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                if (event.clientY < midpoint) {
                    target.classList.add('drag-over-top');
                } else {
                    target.classList.add('drag-over-bottom');
                }
                return;
            }
        }

        // Highlight ability category drop zone
        const abilityZone = event.target.closest('.ability-statArea[data-droparea]');
        if (abilityZone) {
            abilityZone.classList.add('drag-over');
        }
    }


    async _onDropItem(event, data) {
        await super._onDropItem(event, data);

        const droppedItem = await Item.implementation.fromDropData(data);  
        let update = false;      

        if (checkItemValues(droppedItem) === false) {
            return;
        }

        let itemCopy = droppedItem.toObject();
        itemCopy.uuid = droppedItem.uuid;
        const itemData = foundry.utils.duplicate(this.item);

        if (droppedItem.type === "Ability") {    
            if (droppedItem.system.type === "wod.abilities.ability") {
                droppedItem.system.type = "wod.abilities.talent";
            }

            itemData.system.abilities.push(itemCopy);
            update = true;
        }

        if (droppedItem.type === "Advantage") {
            itemCopy.system.settings.order = itemData.system.advantages.length;
            itemData.system.advantages.push(itemCopy);
            update = true;
        }

        if ((droppedItem.type === "Trait") && (droppedItem.system.type === "wod.types.shapeform")) {
            itemCopy.system.order = itemData.system.features.length;
            itemData.system.features.push(itemCopy);            
            update = true;
        }

        if ((droppedItem.type === "Sphere") || (droppedItem.type === "Power")) {
            itemCopy.system.order = itemData.system.powers.length;
            itemData.system.powers.push(itemCopy);            
            update = true;
        }

        if (update) {
            await this.item.update(itemData);
            this.render();
        }
    }
}

export const prepareStatContext = async function (context, item) {
    context.tab = context.tabs.stats;

    context.description = item.system.description;
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, {async: true});

    return context;
}

export const prepareBioContext = async function (context, item) {
    context.tab = context.tabs.bio;

    context.bio = translateItem(item.system.bio);

    return context;
}

export const prepareAbilitiesContext = async function (context, item) {
    context.tab = context.tabs.abilities;

    const filteredTalents = item.system.abilities.filter(ability => {
        return ability.system?.type === "wod.abilities.talent";
    });
    const filteredSkills = item.system.abilities.filter(ability => {
        return ability.system?.type === "wod.abilities.skill";
    });
    const filteredKnoweledges = item.system.abilities.filter(ability => {
        return ability.system?.type === "wod.abilities.knowledge";
    });

    context.talents = translateItem(filteredTalents);
    context.skills = translateItem(filteredSkills);
    context.knowledges = translateItem(filteredKnoweledges);

    return context;
}

export const prepareFeaturesContext = async function (context, item) {
    context.tab = context.tabs.features;

    context.advantages = translateItem(item.system.advantages);
    context.advantages.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));

    context.features = translateItemOrder(item.system.features);

    context.powers = translateItemOrder(item.system.powers);

    return context;
}

function translateItemOrder(featureList) {
    if (!featureList) return [];
    
    const list = [];

    for (const item of featureList) {
        // For Trait items, use name if label is not set
        if (!item.system.label || item.system.label === "") {
            item.system.label = item.name;
        } else {
            item.system.label = game.i18n.localize(item.system.label);
        }
        list.push(item);
    }

    // Sort by order - check if system.settings.order exists first, otherwise use system.order
    list.sort((a, b) => {
        // Check if system.settings.order exists
        const hasSettingsOrderA = a.system.settings?.order !== undefined;
        const hasSettingsOrderB = b.system.settings?.order !== undefined;
        
        if (hasSettingsOrderA && hasSettingsOrderB) {
            // Both have system.settings.order - sort by that
            return Number(a.system.settings.order) - Number(b.system.settings.order);
        } else if (hasSettingsOrderA || hasSettingsOrderB) {
            // One has system.settings.order, one doesn't - prioritize the one with settings.order
            return hasSettingsOrderA ? -1 : 1;
        } else {
            // Neither has system.settings.order - use system.order
            const orderA = a.system.order !== undefined ? Number(a.system.order) : 999;
            const orderB = b.system.order !== undefined ? Number(b.system.order) : 999;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
        }
        // Fallback to alphabetical
        return a.system.label.localeCompare(b.system.label);
    });

    return list;
}

function translateItem(itemList) {
    const list = [];

    for (const item of itemList) {
        item.system.label = game.i18n.localize(item.system.label);

        list.push(item);
    }

    list.sort((a, b) => a.system.label.localeCompare(b.system.label));

    return list;
}

function checkItemValues(item) {
    let message = "";

    if ((item.system.id === "") || (item.system.label === "")) {
        message = "Dropped Item missing required information.";
    }

    if (message !== "") {
        console.warn(message);
        return false;
    }

    return true;    
}
