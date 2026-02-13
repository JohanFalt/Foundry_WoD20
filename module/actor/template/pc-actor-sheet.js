import ActionHelper from "../../scripts/action-helpers.js";
import BonusHelper from "../../scripts/bonus-helpers.js";
import DropHelper from "../../scripts/drop-helpers.js";
import ItemHelper from "../../scripts/item-helpers.js";
import SelectHelper from "../../scripts/select-helpers.js";

import { OnSquareCounterChange } from "../../scripts/action-helpers.js";
import { OnSquareCounterClear } from "../../scripts/action-helpers.js";
import { OnDotCounterChange } from "../../scripts/action-helpers.js";
import { OnActorSwitch } from "../../scripts/action-helpers.js";
import { OnUseMacro } from "../../scripts/action-helpers.js";

import { OnItemCreate, OnItemEdit, OnItemActive, OnItemSwitch, OnItemDelete, OnRemoveSplat, OnQuintessenceHandling, OnQuintessenceWheelClick, OnParadoxWheelClick, OnFormActivate, OnPowerSort, OnPowerClear, OnGenerationChange, SendChat, RollDice, OnEditImage } from "../../scripts/action-helpers.js";

import { calculateHealth } from "../../scripts/health.js";

const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the base ActorSheetV2 document
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export default class PCActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
	
	constructor(actor, options) {
		super(actor, options);

		this.isGM = game.user.isGM;	
		this.isLimited = actor.limited;
		this.locked = true;
		this.isOwner = actor.isOwner;
		this.isCharacter = true;
		this.variantOpen = false;		
		this.era = actor.document.system.settings.era;
		this._settingsTab = "statsadv";

		this.#dragDrop = this.#createDragDropHandlers();
	}

	get title() {
		return this.actor.isToken ? `[Token] ${this.actor.name}` : this.actor.name;
	}	

	static DEFAULT_OPTIONS = {
		form: {
			submitOnChange: true,
			handler: PCActorSheet.onSubmitActorForm
		},
		classes: ["wod20", "wod-sheet", "pc-actor"],
		window: {
			icon: 'fa-solid fa-dice-d10',
			resizable: true
		},
		position: {
			width: 1000,
			height: 800
		},
		actions: {
			actorLock: function(event, form, formData) {
				if (this && typeof this._handlingLock === 'function') {
					this._handlingLock();
				}
			},
			settingsTab: function(event, form, formData) {
				if (this && typeof this._onSettingsTab === "function") {
					this._onSettingsTab(event);
				}
			},

			editAttribute: null,
			actorSwitch: OnActorSwitch,
			editHealth: OnSquareCounterChange,				// Health
			editDot: OnDotCounterChange, 					// Permanent / temporary dots
			useMacro: OnUseMacro,
			editImage: OnEditImage,							// Actor image editing

			itemCreate: OnItemCreate,
			itemEdit: OnItemEdit,
			itemActive: OnItemActive,
			itemSwitch: OnItemSwitch,
			itemDelete: OnItemDelete,
			removeSplat: OnRemoveSplat,

			formActive: OnFormActivate,

			powerSort: OnPowerSort,
			powerClear: OnPowerClear,

			sendChat: SendChat,

			rollDice: RollDice,

			// vampire
			generationChange: OnGenerationChange,			// Generation reduce/clear

			// mage
			quintessenceHandling: OnQuintessenceHandling,
			quintessenceWheelClick: OnQuintessenceWheelClick			
		},
		dragDrop: [
            {
                dragSelector: '[data-drag]',
				dropSelector: null
            }
        ]
	}

	static PARTS = {	
		tabs: {
			template: "systems/worldofdarkness/templates/actor/parts/navigation.hbs"
		},
		bio: {
			template: "systems/worldofdarkness/templates/actor/parts/bio.hbs"
		},
		stats: {
			template: "systems/worldofdarkness/templates/actor/parts/stats.hbs"
		},
		powers: {
			template: "systems/worldofdarkness/templates/actor/parts/powers.hbs"
		},
		combat: {
			template: "systems/worldofdarkness/templates/actor/parts/combat.hbs"
		},
		gear: {
			template: "systems/worldofdarkness/templates/actor/parts/gear.hbs"
		},
		feature: {
			template: "systems/worldofdarkness/templates/actor/parts/feature.hbs"
		},
		effects: {
			template: "systems/worldofdarkness/templates/actor/parts/effects.hbs"
		},
		settings: {
			template: "systems/worldofdarkness/templates/actor/parts/settings.hbs"
		}
	}

	splat = "";

	tabGroups = {
		primary: 'stats'
	}

	// id can't be an icon type that exists - see powers. If it does then it will pick that icon and not the icon value set.
	tabs = {
		bio: {
			id: 'bio',
			group: 'primary',
			title: game.i18n.localize('wod.tab.bio'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)].bio
		},
		stats: {
			id: 'stats',
			group: 'primary',
			title: game.i18n.localize('wod.tab.core'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)].stats
		},
		powers: {
			id: 'powers',
			group: 'primary',
			title: game.i18n.localize('wod.tab.power'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)][getPowertype(this.actor)]
		},
		combat: {
			id: 'combat',
			group: 'primary',
			title: game.i18n.localize('wod.tab.combat'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)].combat
		},
		gear: {
			id: 'gear',
			group: 'primary',
			title: game.i18n.localize('wod.tab.gear'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)].gear
		},
		feature: {
			id: 'feature',
			group: 'primary',
			title: game.i18n.localize('wod.tab.features'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)].note
		},
		effects: {
			id: 'effects',
			group: 'primary',
			title: game.i18n.localize('wod.tab.effect'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)].effect
		},
		settings: {
			id: 'settings',
			group: 'primary',
			title: game.i18n.localize('wod.tab.settings'),
			icon: game.worldofdarkness.icons[getSplat(this.actor)].settings
		}
	}

	/* Read the tabs with data */
	getTabs () {
		const tabs = this.tabs

		// Check viewBiotabPermission
		let viewBiotabPermission = "full";
		if (!game.user.isGM && !this.actor.isOwner) {
			if (this.actor.limited) {
				viewBiotabPermission = CONFIG.worldofdarkness.limitedSeeFullActor;
			} else {
				viewBiotabPermission = CONFIG.worldofdarkness.observersSeeFullActor;
			}
		}

		// Filter tabs based on permission
		const filteredTabs = {};
		if (viewBiotabPermission === "full") {
			// User has full access, include all tabs
			for (const [key, tab] of Object.entries(tabs)) {
				filteredTabs[key] = tab;
			}
		} else {
			// User has limited access, only show bio tab
			if (tabs.bio) {
				filteredTabs.bio = tabs.bio;
			}
			// Set bio as default active tab when user has limited access
			if (!this.tabGroups.primary || this.tabGroups.primary !== 'bio') {
				this.tabGroups.primary = 'bio';
			}
		}

		// Process the filtered tabs (use filteredTabs instead of tabs)
		for (const tab of Object.values(filteredTabs)) {
			tab.active = this.tabGroups[tab.group] === tab.id;

			// Set icon dynamically - especially important for powers tab which depends on actor splat
			if (tab.id === "powers") {
				// Power icon depends on actor's splat type (discipline for vampire, gift for werewolf, etc.)
				tab.icon = game.worldofdarkness.icons[this.splat][getPowertype(this.actor)];
			} else {
				// For other tabs, use the icon from tabs definition or fallback to default
				if (tab.id === "feature") {
					tab.icon = game.worldofdarkness.icons[this.splat].note;
				}
				else if (tab.id === "effects") {
					tab.icon = game.worldofdarkness.icons[this.splat].effect;
				}
				else {
					tab.icon = game.worldofdarkness.icons[this.splat][tab.id];
				}				
			}
			tab.cssClass = tab.active ? 'actorv2 active ' : 'actorv2 ';
			tab.cssClass += this.locked ? 'locked ' : '';
			tab.cssClass += this.era !== '' ? this.era + ' ' : '';
		}

		return filteredTabs
	}

	/** @override */
	async _prepareContext(options) {
		const data = await super._prepareContext();
		const actor = this.actor;		

		this.splat = getSplat(this.actor);

		// Add the tabs
		data.tabs = this.getTabs();		

		data.config = CONFIG.worldofdarkness;	

		data.worldofdarkness = game.worldofdarkness;	

		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();

		data.isOwner = actor.isOwner;
		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		data.actor = actor;

		console.log(`${data.actor.name} - (${data.actor.type} / ${this.splat})`);
		console.log(data.actor);

		return {
			...data
		}
	}	

	async _preparePartContext (partId, context, options) {
		context = { ...(await super._preparePartContext(partId, context, options)) }

		// Top-level variables
		const actor = this.actor

		// Only load what is neccessary
		switch (partId) {
			case 'bio':
				return prepareBioContext(context, actor);
			case 'stats':
				return prepareStatContext(context, actor);
			case 'powers':
				return preparePowersContext(context, actor);
			case 'combat':
				return prepareCombatContext(context, actor);
			case 'gear':
				return prepareGearContext(context, actor);
			case 'feature':
				return prepareFeatureContext(context, actor);
			case 'effects':
				return prepareEffectContext(context, actor);
			case 'settings':
				return prepareSettingsContext(context, actor);
		}

		return context
	}	

	static async onSubmitActorForm (event, form, formData) {
		const target = event.target;

		// Allow a small whitelist of "tracking" toggles even while the sheet is locked
		const allowWhileLocked = new Set([
			"system.conditions.isignoringpain",
			"system.conditions.isfrenzy"
		]);

		const isAllowedWhileLocked =
			target?.tagName === "INPUT" &&
			target.type === "checkbox" &&
			allowWhileLocked.has(target.name);

		if (this.locked && !isAllowedWhileLocked) {
			ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
			return;
		}

		// is an item
		if (target.dataset.itemid !== undefined) {
			let value;

			// Handle numbers and strings properly
			if (target.type === 'number') {
				value = parseInt(target.value)
			} 
			else if (target.type === 'checkbox') {
				value = target.checked
			} 
			else {
				value = target.value
			}

			let item = await this.actor.getEmbeddedDocument("Item", target.dataset.itemid);
            await item.update({
			 	[`${target.name}`]: value
			});			

			return;
		}		
		else {
			if (target.tagName === 'INPUT') {
				let value = "";

				// Handle numbers and strings properly
				if (target.type === 'number') {
					value = parseInt(target.value)
				} 
				else if (target.type === 'checkbox') {
					value = target.checked
				} 
				else {
					value = target.value
				}

				const actorData = foundry.utils.duplicate(this.actor.toObject());
				foundry.utils.setProperty(actorData, target.name, value);
				await this.actor.update(actorData);
			} 
			else {
				// Process submit data
				const submitData = this._prepareSubmitData(event, form, formData);

				// Overrides
				const overrides = foundry.utils.flattenObject(this.actor.overrides);
				for (const k of Object.keys(overrides)) delete submitData[k]

				const submitDataFlat = foundry.utils.flattenObject(submitData);
				const updatedData = {
					[target.name]: submitDataFlat[target.name],
					'system.settings.isupdated': false
				}
				const expandedData = foundry.utils.expandObject(updatedData);

				// Update the actor data
				await this.actor.update(expandedData);
			}
		} 
	}

	async _onRender () {
		const element = this.element;
		
		// Highlight dot/box UI based on current values
		ActionHelper.SetupDotCounters_v2(element);

		// right-click health boxes - use event delegation
		this._bindHealthContextMenu(element);
		
		// Attach show/hide handlers for power description toggles
		this._bindCollapsibleButtons(element);
		
		// Attach expand/collapse handlers for grouped tables (experience, etc.)
		this._bindUnfoldButtons(element);
		
		// Restore saved collapsed/expanded state from user flags
		this._restoreUnfoldState(element);
		
		// Make draggable rows functional inside the sheet
		this._setupDragAndDrop(element);

		// Quintessence wheel right-click (contextmenu) for paradox
		this._bindQuintessenceContextMenu(element);

		// Settings sub-tabs
		this._bindSettingsTabs(element);

		// Secondary settings tabs (Bio/Stats&Advantages/Power/Combat/Features/Sheet)
		this._applySettingsTabState(element);
	}

	async render(force = false, options = {}) {
		await super.render(force, options);
	}

	/**
	 * Attach show/hide handlers for power description toggles.
	 * Binds click event listeners to collapsible buttons that toggle visibility of power descriptions.
	 * @param {HTMLElement} root - The root element to search for collapsible buttons
	 */
	_bindCollapsibleButtons(root) {
		const icons = root.querySelectorAll?.(".collapsible.button[data-itemid]");
		if (!icons?.length) return;
		icons.forEach(icon => {
			if (icon.dataset.collapseBound) return;
			icon.dataset.collapseBound = "true";
			icon.addEventListener("click", (event) => this._handleCollapsibleClick(event));
		});
	}

	/**
	 * Attach expand/collapse handlers for grouped tables (experience, etc.).
	 * Binds click event listeners to unfold buttons that toggle visibility of grouped content sections.
	 * @param {HTMLElement} root - The root element to search for unfold buttons
	 */
	_bindUnfoldButtons(root) {
		const buttons = root.querySelectorAll?.(".unfold.button");
		if (!buttons?.length) return;
		buttons.forEach(button => {
			if (button.dataset.unfoldBound) return;
			button.dataset.unfoldBound = "true";
			button.addEventListener("click", (event) => this._handleUnfoldClick(event));
		});
	}

	/**
	 * Restore saved collapsed/expanded state from user flags.
	 * Reads user preferences from game flags and restores the visual state of unfoldable sections.
	 * @param {HTMLElement} root - The root element to search for unfold buttons
	 */
	_restoreUnfoldState(root) {
		const unfoldButtons = Array.from(root.querySelectorAll('.unfold.button'));
		unfoldButtons.forEach(ele => {
			if (ele.dataset.sheet == CONFIG.worldofdarkness.sheettype.mortal){
				if (this.actor && this.actor.id && game.user.flags.wod && game.user.flags.wod[this.actor.id] && game.user.flags.wod[this.actor.id][ele.dataset.type] && !game.user.flags.wod[this.actor.id][ele.dataset.type].collapsed) {
					ele.classList.remove("fa-angles-right");
					ele.classList.add("fa-angles-down");

					// Get parent's parent's parent, then find siblings
					const parent = ele.parentElement?.parentElement?.parentElement;
					if (parent) {
						const siblings = Array.from(parent.parentElement?.children || []);
						const targetSiblings = siblings.filter(sib => sib !== parent && sib.classList.contains(ele.dataset.type));
						targetSiblings.forEach(sib => {
							sib.classList.remove("hide");
							sib.classList.add("show");
						});
					}
				}
				else {
					ele.classList.remove("fa-angles-down");
					ele.classList.add("fa-angles-right");

					// Get parent's parent's parent, then find siblings
					const parent = ele.parentElement?.parentElement?.parentElement;
					if (parent) {
						const siblings = Array.from(parent.parentElement?.children || []);
						const targetSiblings = siblings.filter(sib => sib !== parent && sib.classList.contains(ele.dataset.type));
						targetSiblings.forEach(sib => {
							sib.classList.remove("show");
							sib.classList.add("hide");
						});
					}
				}
			}
		});
	}

	async _handlingLock() {
		this.locked = !this.locked;
		await this.render(false);
	}

	/**
	 * Make draggable rows functional inside the sheet.
	 * Sets up drag-and-drop handlers for draggable elements and binds Foundry V14 DragDrop API for internal sorting.
	 * @param {HTMLElement} root - The root element to search for draggable elements
	 */
	_setupDragAndDrop(root) {
		const draggables = Array.from(root.querySelectorAll('.draggable'));
		draggables.forEach((draggableElement) => {
			DropHelper.HandleDragDrop(this, this.actor, $(root), draggableElement);
		});

		// Foundry V14 DragDrop API for internal sorting (advantages, etc.)
		this.#dragDrop.forEach((d) => d.bind(this.element));
	}



	_handleCollapsibleClick(event) {
		const icon = event.currentTarget;
		if (!icon?.dataset?.itemid) return;
		const itemId = icon.dataset.itemid;
		const container = this.element || icon.closest(".app");
		const targetRoot = container instanceof HTMLElement ? container : document;
		const bonusDiv = targetRoot.querySelector(`.description[data-itemid="${itemId}"]`);

		if (!bonusDiv) {
			console.warn(`PC Actor: Could not find .description[data-itemid="${itemId}"]`);
			return;
		}

		//const isOpen = bonusDiv.style.maxHeight && bonusDiv.style.maxHeight !== "0px";
		const isOpen = bonusDiv.classList.contains("collapsible-open");

		if (isOpen) {
			bonusDiv.style.maxHeight = "0";
			icon.classList.remove("fa-compress");
			icon.classList.add("fa-expand");
			bonusDiv.classList.remove("collapsible-open");
		} else {
			bonusDiv.style.maxHeight = bonusDiv.scrollHeight + "px";
			bonusDiv.classList.add("collapsible-open");
			icon.classList.remove("fa-expand");
			icon.classList.add("fa-compress");
		}
	}	

	_handleUnfoldClick(event) {
		const button = event.currentTarget;
		if (!button) return;
		ItemHelper._onTableCollapse({ currentTarget: button }, this.actor._id);
	}	

	/**
	 * Settings sub-tabs.
	 * Binds click event listeners to settings tab buttons for navigating between settings sub-sections.
	 * @param {HTMLElement} root - The root element to search for settings tab buttons
	 */
	_bindSettingsTabs(root) {
		const buttons = root?.querySelectorAll?.('.sheet-setting-tabs [data-tab]');
		if (!buttons?.length) return;

		buttons.forEach(btn => {
			if (btn.dataset.settingsTabBound) return;
			btn.dataset.settingsTabBound = "true";
			btn.addEventListener("click", (event) => this._onSettingsTab(event));
		});
	}

	_onSettingsTab(event) {
		event?.preventDefault?.();

		const target = event?.currentTarget;
		const tabId = target?.dataset?.tab;
		if (!tabId) return;

		this._settingsTab = tabId;
		this._applySettingsTabState(this.element);
	}

	/**
	 * Secondary settings tabs (Bio/Stats&Advantages/Power/Combat/Features/Sheet).
	 * Applies the active state to the current settings tab and shows/hides corresponding content sections.
	 * @param {HTMLElement} root - The root element containing settings tab navigation and content
	 */
	_applySettingsTabState(root) {
		if (!root?.querySelectorAll) return;

		const activeTab = this._settingsTab || "statsadv";

		// Nav buttons
		const navButtons = root.querySelectorAll('.sheet-setting-tabs [data-action="settingsTab"][data-tab]');
		navButtons.forEach(btn => {
			btn.classList.toggle("active", btn.dataset.tab === activeTab);
		});

		// Content tabs
		const tabs = root.querySelectorAll('.sheet-setting-body .tab[data-group="settings"][data-tab]');
		tabs.forEach(t => {
			const isActive = t.dataset.tab === activeTab;
			t.classList.toggle("active", isActive);
			t.style.display = isActive ? "" : "none";
		});
	}

	/**
	 * Allow right-click clearing of individual health boxes.
	 * Binds contextmenu event listeners to health resource steps for clearing individual health levels.
	 * @param {HTMLElement} root - The root element to search for health resource steps
	 */
	_bindHealthContextMenu(root) {
		const steps = root.querySelectorAll(".health .resource-value-step");
		if (!steps?.length) return;
		steps.forEach(step => {
			if (step.dataset.healthContextBound) return;
			step.dataset.healthContextBound = "true";
			step.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				OnSquareCounterClear.call(this, event);
			});
		});
	}



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
			return new foundry.applications.ux.DragDrop(d);
        })
    }

	#dragDrop;

    _canDragStart() {
        return this.isEditable;
    }

    _canDragDrop() {
		return this.isEditable;
    }

    /**
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

		// For all other drag operations, use parent implementation
		super._onDragStart(event);
	}

    /**
	 * Override _onDragOver to provide visual feedback for drag-and-drop operations.
	 * Handles advantage reordering with visual indicators.
	 * @param {DragEvent} event - The dragover event
	 */
	_onDragOver(event) {
		// Remove previous hover classes from all draggable items
		this.element.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over').forEach(el => {
			el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over');
		});

		// Item classes that support drag-over feedback
		const itemClasses = ['.advantage-item', '.feature-item', '.power-item'];
		
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

    async _onDrop(event) {
		const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)

		// Handle different data types
		switch (data.type) {
			// Item position reordering - handled locally
			case 'SortOrder':                
				return this._onReorderItem(event, data);
			// Dropped Item from compendium/sidebar
			case 'Item':                
				return this._onDropItem(event, data);
		}
	}

	async _onDropItem(event, data) {
		const droppedItem = await Item.implementation.fromDropData(data);

		if (droppedItem.type === "Splat") {
			// Check if actor already has a splat item
			const hasSplatItem = this.actor.items.some(i => i.type === "Splat");
			
			// Only require unlock if there's already a splat item (changing splat)
			if (this.locked && hasSplatItem) {
				ui.notifications.warn(game.i18n.localize("wod.system.sheetlocked"));
				return;
			}

			await DropHelper.OnDropItem(event, droppedItem, this.actor);

			// Unlock the sheet after splat item is installed
			if (this.locked) {
				this.locked = false;
				await this.render(false);
			}
			
			return;
		}	
		if ((droppedItem.type === "Power") || (droppedItem.type === "Sphere")) {
			await DropHelper.OnDropItem(event, droppedItem, this.actor);
			return;
		}
		if (droppedItem.type === "Advantage") {
			await DropHelper.OnDropItem(event, droppedItem, this.actor);
		 	return;
		}

		const itemData = droppedItem.toObject();
		
		if (itemData.type === "Ability") {
			if (itemData.system.type === "wod.abilities.ability") {
				itemData.system.type = "wod.abilities.talent";
			}
		}		

		if (itemData.system?.isremovable !== undefined) {
			itemData.system.isremovable = true;
		}
		if (itemData.system?.settings?.isremovable !== undefined) {
			itemData.system.settings.isremovable = true;
		}

		return await this.actor.createEmbeddedDocuments('Item', [itemData]);
    }

	async _onReorderItem(event, data) {
		// Validate this is the correct document
		if (data.documentid !== this.actor._id) {
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
		const result = await DropHelper.ReorderActorItems(
			this.actor,
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
	 * Quintessence wheel right-click (contextmenu) for paradox.
	 * Binds contextmenu event listeners to quintessence wheel elements for handling paradox wheel interactions.
	 * @param {HTMLElement} root - The root element to search for quintessence wheel elements
	 */
	_bindQuintessenceContextMenu(root) {
		const wheelElements = root.querySelectorAll?.(".quintessence > .resource-counter > .resource-value-step");
		if (!wheelElements?.length) return;
		
		wheelElements.forEach(el => {
			if (el.dataset.contextBound) return;
			el.dataset.contextBound = "true";
			el.addEventListener("contextmenu", (event) => {
				OnParadoxWheelClick.call(this, event, event.currentTarget);
			});
		});
	}
}

export const getSplat = function (actor) {
	// Use variantsheet first, then splat, then actor type as fallback
	let splatname = "";
	if (actor.system?.settings?.variantsheet && actor.system.settings.variantsheet !== "") {
		splatname = actor.system.settings.variantsheet.toLowerCase();
	} else if (actor.system?.settings?.splat && actor.system.settings.splat !== "") {
		splatname = actor.system.settings.splat.toLowerCase();
	} else if (actor.system?.settings?.game && actor.system.settings.game !== "") {
		splatname = actor.system.settings.game.toLowerCase();
	}
	else {
		splatname = actor.type.toLowerCase();
	}
	return ( splatname === "pc" ? "mortal" : splatname);
}

export const getPowertype = function (actor) {
	if (!actor || !actor.system || !actor.system.settings) {
		return "power";
	}

	// Use variantsheet first, then splat, then actor type as fallback
	let splatname = "";
	if (actor.system.settings.variantsheet && actor.system.settings.variantsheet !== "") {
		splatname = actor.system.settings.variantsheet.toLowerCase();
	} else if (actor.system.settings.splat && actor.system.settings.splat !== "") {
		splatname = actor.system.settings.splat.toLowerCase();
	} else {
		splatname = actor.type ? actor.type.toLowerCase() : "pc";
	}
	
	let powertype = "power";

	if (splatname === CONFIG.worldofdarkness.splat.vampire) {
		powertype = "discipline";
	} else if (splatname === CONFIG.worldofdarkness.splat.werewolf) {
		powertype = "gift";
	} else if (splatname === CONFIG.worldofdarkness.splat.mage) {
		powertype = "magic";
	}

	return powertype;
}

export const prepareBioContext = async function (context, actor) {
  	context.tab = context.tabs.bio;

	context.appearance = actor.system.bio.appearance;
	context.background = actor.system.bio.background;
	context.roleplaytip = actor.system.bio.roleplaytip;
	context.enrichedAppearance = await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.bio.appearance, {async: true});
	context.enrichedBackground = await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.bio.background, {async: true});
	context.enrichedRoleplaytip = await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.bio.roleplaytip, {async: true});

	//context.splatfields = actor.system.bio.splatfields.filter(([_, field]) => field?.isvisible !== false);
	const allSplatfields = actor.system.bio.splatfields ?? {};
	context.splatfields = Object.fromEntries(
	Object.entries(allSplatfields).filter(([_, field]) => field?.isvisible === true)
	);

	// Enrich textbox splatfields for bio_splatboxes.hbs
	if (context.splatfields) {
		for (const [key, field] of Object.entries(context.splatfields)) {
			if (field.type === "textbox") {
				field.enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(field.value, {async: true});
			}
		}
	}

	// Get listData for bio select fields - same pattern as legacy templates (bio_mage_background.html)
	// Pass actor directly to SetupItem so functions that need actor data (custom handling) work correctly
	const splat = getSplat(actor);
	const actorData = { type: CONFIG.worldofdarkness.sheettype[splat] || splat, system: actor.system };
	context.listData = SelectHelper.SetupItem(actorData, true);

  	return context;
}

export const prepareStatContext = async function (context, actor) {
  	context.tab = context.tabs.stats;

	context.talents = actor.items
								.filter(item => item.type === "Ability" && item.system.type === 'wod.abilities.talent' && item.system.settings.isvisible)
								.map(item => ({ _id: item._id, ...item }));

	context.talents = context.talents.sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));

	context.skills = actor.items
								.filter(item => item.type === "Ability" && item.system.type === 'wod.abilities.skill' && item.system.settings.isvisible)
								.map(item => ({ _id: item._id, ...item }));

	context.skills = context.skills.sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));

	context.knowledges = actor.items
								.filter(item => item.type === "Ability" && item.system.type === 'wod.abilities.knowledge' && item.system.settings.isvisible)
								.map(item => ({ _id: item._id, ...item }));

	context.knowledges = context.knowledges.sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));

	context.advantages 	= actor.items
								.filter(item => item.type === "Advantage" && item.system.group === '' && item.system.settings.isvisible)
								.map(item => ({ _id: item._id, ...item }));

	context.advantages = context.advantages.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));

	if (actor.system.settings.hasvirtue) {

		context.virtues = actor.items
								.filter(item => item.type === "Advantage" && item.system.group === 'virtue' && item.system.settings.isvisible)
								.map(item => ({ _id: item._id, ...item }));
						
		context.virtues = context.virtues.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));		
	}
	if (actor.system.settings.hasrenown) {
		context.renowns = actor.items
								.filter(item => item.type === "Advantage" && item.system.group === 'renown' && item.system.settings.isvisible)
								.map(item => ({ _id: item._id, ...item }));
						
		context.renowns = context.renowns.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));
	}
	if (actor.system.settings.hasquintessence) {
		context.quintessences = actor.items
								.filter(item => item.type === "Advantage" && item.system.group === 'quintessence' && item.system.settings.isvisible)
								.map(item => ({ _id: item._id, ...item }));
	}

	// Find all grouped advantages beyond virtue, renown, and quintessence
	const knownGroups = ['', 'virtue', 'renown', 'quintessence'];
	const allGroupedAdvantages = actor.items
		.filter(item => 
			item.type === "Advantage" && 
			item.system.group !== '' && 
			!knownGroups.includes(item.system.group) && 
			item.system.settings.isvisible
		)
		.map(item => ({ _id: item._id, ...item }));

	// Group by system.group and sort
	const groupedMap = new Map();
	for (const advantage of allGroupedAdvantages) {
		const group = advantage.system.group;
		if (!groupedMap.has(group)) {
			groupedMap.set(group, []);
		}
		groupedMap.get(group).push(advantage);
	}

	// Sort items within each group by system.settings.order
	for (const [group, items] of groupedMap.entries()) {
		items.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));
	}

	// Convert to array and sort groups alphabetically
	context.groupedadvantages = Array.from(groupedMap.entries())
		.map(([group, items]) => ({ group, items }))
		.sort((a, b) => a.group.localeCompare(b.group));

	// Set hasGroupedAdvantages flag
	context.hasGroupedAdvantages = context.groupedadvantages.length > 0;

	context.health = await calculateHealth(actor, CONFIG.worldofdarkness.sheettype.mortal);

  	return context
}

export const preparePowersContext = async function (context, actor) {
  	context.tab = context.tabs.powers;

	const splat = getSplat(actor);

	const lacksParent = (item, parents) => {
		const parentId = item.system.parentid;
		if (!parentId) return true;
		return !parents.some(parent => parent._id === parentId || parent.id === parentId);
	};

	// Core power categories
	context.disciplines = ItemHelper.GetPowersByType(actor, "wod.types.discipline", true);
	
	//context.paths = ItemHelper.GetPowersByType(actor, "wod.types.disciplinepath", true);
	context.combinations = ItemHelper.GetPowersByType(actor, "wod.types.combination", true);
	context.rituals = ItemHelper.GetPowersByType(actor, "wod.types.ritual", true);
	context.rites = ItemHelper.GetPowersByType(actor, "wod.types.rite", true);
	
	context.rotes = ItemHelper.GetItemType(actor, "Rote");	
	context.resonances = actor.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.resonance");
	context.numinas = ItemHelper.GetPowersByType(actor, "wod.types.numina", true);

	// Unsorted powers (no parent or missing parent reference)
	const disciplinePowers = ItemHelper.GetPowersByType(actor, "wod.types.disciplinepower");
	const numinaPowers = ItemHelper.GetPowersByType(actor, "wod.types.numinapower");
	//const pathPowers = ItemHelper.GetPowersByType(actor, "wod.types.disciplinepathpower");
	context.unsorteddisciplines = disciplinePowers.filter(power => lacksParent(power, context.disciplines));
	context.unsortednuminas = numinaPowers.filter(power => lacksParent(power, context.numinas));
	//context.unsortedpaths = pathPowers.filter(power => lacksParent(power, context.paths));

	// Gifts grouped by rank
	const giftItems = ItemHelper.GetPowersByType(actor, "wod.types.gift");
	const { giftsByRank, flatGifts } = ItemHelper.GroupGiftsByRank(giftItems);
	context.giftsByRank = giftsByRank;
	context.gifts = flatGifts;

	// Shapes remain Traits but follow the same ordering logic
	const allShapes = actor?.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.shapeform" && item.system.isvisible);
	context.shapes = allShapes.sort((a, b) => {
		const orderA = a.system.order !== undefined ? Number(a.system.order) : 999;
		const orderB = b.system.order !== undefined ? Number(b.system.order) : 999;
		if (orderA !== orderB) return orderA - orderB;
		return a.name.localeCompare(b.name);
	});

	// Spheres
	context.spheres = actor.items.filter(item => item.type === "Sphere" && item.system.settings.isvisible);
	context.spheres = context.spheres.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));

	context.powerSections = ItemHelper.BuildPowerSections(actor, context, splat, CONFIG.worldofdarkness.sheetv2.power || {});
	context.splat = splat;

  	return context;
}

export const prepareCombatContext = async function (context, actor) {
  	context.tab = context.tabs.combat;

	context.weapon_natural 	= actor.items.filter(item => item.type === "Melee Weapon" && item.system.isnatural === true);
	context.weapon_melee 	= actor.items.filter(item => item.type === "Melee Weapon" && item.system.isnatural === false);
	context.weapon_ranged 	= actor.items.filter(item => item.type === "Ranged Weapon");
	context.armor 			= actor.items.filter(item => item.type === "Armor");

	context.powercombat		= actor.items.filter(item => item.type === "Power" && item.system.type === "wod.types.gift" && item.system.isactive);

	context.health = await calculateHealth(actor, CONFIG.worldofdarkness.sheettype.mortal);

  	return context;
}

export const prepareGearContext = async function (context, actor) {
  	context.tab = context.tabs.gear;

	context.gear = actor.system.gear.notes;
	context.enrichedGear = await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.gear.notes, {async: true});

  	return context;
}

export const prepareFeatureContext = async function (context, actor) {
  	context.tab = context.tabs.feature;	

	context.backgrounds = ItemHelper.GetItemType(actor, "Feature", "wod.types.background");
	context.merits 		= ItemHelper.GetItemType(actor, "Feature", "wod.types.merit");
	context.flaws 		= ItemHelper.GetItemType(actor, "Feature", "wod.types.flaw");
	context.bloodbounds = ItemHelper.GetItemType(actor, "Feature", "wod.types.bloodbound");
	context.boons 		= ItemHelper.GetItemType(actor, "Feature", "wod.types.boon");
	context.oaths 		= ItemHelper.GetItemType(actor, "Feature", "wod.types.oath");
	context.othertraits = ItemHelper.GetItemType(actor, "Trait", "wod.types.othertraits");	

  	return context;
}

export const prepareEffectContext = async function (context, actor) {
  	context.tab = context.tabs.effects;

	let bonuslist = [];
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_diff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_dice_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_auto_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_fixed_value");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "ability_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "ability_diff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "soak_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "soak_diff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "health_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attack_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attack_diff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "frenzy_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "frenzy_diff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "initiative_buff");
	bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "movement_buff");

	// Sort by origin (empty strings first, then alphabetically)
	bonuslist.sort((a, b) => {
		const originA = a.origin || "";
		const originB = b.origin || "";
		return originA.localeCompare(originB);
	});

	context.effects = bonuslist;

  	return context;
}

export const prepareSettingsContext = async function (context, actor) {
  	context.tab = context.tabs.settings;

	// Bio
	context.splatfields = actor.system.bio.splatfields;
	context.hassplatfields = Object.keys(actor.system.bio.splatfields).length > 0;


	// Abilities
	context.talents = actor.items
								.filter(item => item.type === "Ability" && item.system.type === 'wod.abilities.talent')
								.map(item => ({ _id: item._id, ...item }));

	context.talents = context.talents.sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));

	context.skills = actor.items
								.filter(item => item.type === "Ability" && item.system.type === 'wod.abilities.skill')
								.map(item => ({ _id: item._id, ...item }));

	context.skills = context.skills.sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));

	context.knowledges = actor.items
								.filter(item => item.type === "Ability" && item.system.type === 'wod.abilities.knowledge')
								.map(item => ({ _id: item._id, ...item }));

	context.knowledges = context.knowledges.sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));

	// Advantages
	context.advantages 	= actor.items
								.filter(item => item.type === "Advantage" && item.system.group === '')
								.map(item => ({ _id: item._id, ...item }));

	context.advantages = context.advantages.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));

	// Shapes remain Traits but follow the same ordering logic
	const allShapes = actor?.items.filter(item => item.type === "Trait" && item.system.type === "wod.types.shapeform");
	context.shapes = allShapes.sort((a, b) => {
		const orderA = a.system.order !== undefined ? Number(a.system.order) : 999;
		const orderB = b.system.order !== undefined ? Number(b.system.order) : 999;
		if (orderA !== orderB) return orderA - orderB;
		return a.name.localeCompare(b.name);
	});

	// Grouped Advantages (including virtues, renown, quintessence, and other groups like "yinchi")
	// Find all grouped advantages - include all groups except empty string
	// Don't filter by isvisible here - we want to show all grouped advantages in settings so user can manage them
	const knownGroups = ['', 'virtue', 'renown', 'quintessence'];
	const allGroupedAdvantages = actor.items
		.filter(item => 
			item.type === "Advantage" && 
			item.system.group !== '' && 
			!knownGroups.includes(item.system.group)
		)
		.map(item => ({ _id: item._id, ...item }));
	
	// Also include virtues, renown, and quintessence if they exist (these are excluded from the filter above)
	if (actor.system.settings.hasvirtue) {
		const virtues = actor.items
			.filter(item => item.type === "Advantage" && item.system.group === 'virtue')
			.map(item => ({ _id: item._id, ...item }));
		allGroupedAdvantages.push(...virtues);
	}
	if (actor.system.settings.hasrenown) {
		const renowns = actor.items
			.filter(item => item.type === "Advantage" && item.system.group === 'renown')
			.map(item => ({ _id: item._id, ...item }));
		allGroupedAdvantages.push(...renowns);
	}
	if (actor.system.settings.hasquintessence) {
		const quintessences = actor.items
			.filter(item => item.type === "Advantage" && item.system.group === 'quintessence')
			.map(item => ({ _id: item._id, ...item }));
		allGroupedAdvantages.push(...quintessences);
	}

	// Group by system.group and sort
	const groupedMap = new Map();
	for (const advantage of allGroupedAdvantages) {
		const group = advantage.system.group;
		if (!groupedMap.has(group)) {
			groupedMap.set(group, []);
		}
		groupedMap.get(group).push(advantage);
	}

	// Sort items within each group by system.settings.order
	for (const [group, items] of groupedMap.entries()) {
		items.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));
	}

	// Convert to array and sort groups alphabetically
	context.groupedadvantages = Array.from(groupedMap.entries())
		.map(([group, items]) => ({ group, items }))
		.sort((a, b) => a.group.localeCompare(b.group));

	// Set hasGroupedAdvantages flag
	context.hasGroupedAdvantages = context.groupedadvantages.length > 0;

	// Spheres
	context.spheres = actor.items.filter(item => item.type === "Sphere");
	context.spheres = context.spheres.sort((a, b) => Number(a.system.settings.order) - Number(b.system.settings.order));

	// Get listData for bio select fields - same pattern as legacy templates (bio_mage_background.html)
	// Pass actor directly to SetupItem so functions that need actor data (custom handling) work correctly
	const splat = getSplat(actor);
	const actorData = { type: CONFIG.worldofdarkness.sheettype[splat] || splat, system: actor.system };
	context.listData = SelectHelper.SetupItem(actorData, true);

	return context;
}
