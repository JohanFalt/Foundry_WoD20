const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import CreateHelper from "../scripts/create-helpers.js";

export class DialogPowerSelection extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, buttonData) {
        super();
        this.actor = actor;
        this.buttonData = buttonData;
        this.buttons = buttonData.flatButtons;
        
        // Set localized title
        this.options.window.title = game.i18n.localize("wod.labels.new.create");
    }

    static DEFAULT_OPTIONS = {
        id: 'wod-power-selection',
        tag: 'div',
        window: {
            title: "wod.labels.new.create", // Will be localized in constructor
            resizable: true
        },
        classes: ['wod20', 'wod-dialog', 'wod-create', 'power-selection-dialog'],
        position: {
            width: 600,
            height: 'auto'
        },
        actions: {
            createPower: async function(event, target) {
                const powerType = target.dataset.powerType;
                const buttonCallback = this.buttons[powerType]?.callback;
                
                if (buttonCallback) {
                    // Använd CreateHelper som context för callback
                    // Callback förväntar sig att actor är tillgänglig i closure
                    await buttonCallback.call(CreateHelper);
                    this.close();
                }
            },
            toggleCategory: function(event, target) {
                const category = target.closest('.power-category');
                if (!category) return;
                
                const isExpanded = category.classList.contains('expanded');
                
                category.classList.toggle('expanded');
                const buttonsDiv = category.querySelector('.power-category-buttons');
                if (buttonsDiv) {
                    if (isExpanded) {
                        buttonsDiv.style.display = 'none';
                    } else {
                        buttonsDiv.style.display = 'flex';
                    }
                }
                
                // Uppdatera chevron-ikon
                const icon = category.querySelector('.fa-chevron-right, .fa-chevron-down');
                if (icon) {
                    if (isExpanded) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-right');
                    } else {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            }
        }
    }

    static PARTS = {
        body: {
            template: 'systems/worldofdarkness/templates/dialogs/dialog-power-selection.hbs'
        }
    }

    async _prepareContext() {
        const data = await super._prepareContext();
        
        // Bestäm sheettype
        let splatname = (this.actor.system.settings.variantsheet === "" ? 
            this.actor.system.settings.splat.toLowerCase() : 
            this.actor.system.settings.variantsheet.toLowerCase());
        let sheettype = (splatname === "pc" ? "mortal" : splatname);
        
        if (sheettype == CONFIG.worldofdarkness.sheettype.changingbreed) {
            sheettype = CONFIG.worldofdarkness.sheettype.werewolf;
        }
        
        data.tab = "power";
        data.sheettype = sheettype;
        data.actor = this.actor;
        data.categories = this.buttonData.categories;
        data.config = CONFIG.worldofdarkness;
        
        return data;
    }
}

