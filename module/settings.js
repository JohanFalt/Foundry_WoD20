export const systemSettings = function() {

    // "core" is core settings
	// "worldofdarkness" as system setting
	// "wod" or other then is module settings
	game.settings.register("worldofdarkness", "worldVersion", {
		name: game.i18n.localize('wod.settings.worldversion'),
		hint: game.i18n.localize('wod.settings.worldversionhint'),
		scope: "world",
		config: true,
		default: "1",
		type: String,
	});

	// Are you to use the permanent (check) values or temporary (not checked) of e.g. Willpower in rolls
	game.settings.register("worldofdarkness", "advantageRolls", {
		name: game.i18n.localize('wod.settings.advantagerolls'),
		hint: game.i18n.localize('wod.settings.advantagerollshint'),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "theRollofOne", {
		name: game.i18n.localize('wod.settings.therollofone'),
		hint: game.i18n.localize('wod.settings.therollofonehint'),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "attributeSettings", {
		name: game.i18n.localize('wod.settings.attributesettings'),
		hint: game.i18n.localize('wod.settings.attributesettingshint'),
		scope: "world",
		config: false,
		default: "20th",
		type: String,
		choices: {
			"20th": "20th edition",
			"5th": "5th edition"
		}
	});

	//patch settings
	game.settings.register("worldofdarkness", "patch107", {
		name: "patch107",
		hint: "patch107",
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "patch110", {
		name: "patch110",
		hint: "patch110",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "patch120", {
		name: "patch120",
		hint: "patch120",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch130", {
		name: "patch130",
		hint: "patch130",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch140", {
		name: "patch140",
		hint: "patch140",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch150", {
		name: "patch150",
		hint: "patch150",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});


    game.settings.registerMenu("worldofdarkness", "ruleSettings", {
        name: game.i18n.localize('wod.settings.rulesettings'),
        hint: game.i18n.localize('wod.settings.rulesettingshint'),
        label: "Rule Settings",
        icon: "fa fa-cog",
        type: Rules,
        restricted: true,
    });
};

export default class Rules extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "rules",
            classes: [],
            title: "Rule Settings",
            template: "systems/worldofdarkness/templates/dialogs/rule-settings-dialog.html",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.data.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "advantageRolls") || (s.key == "theRollofOne") || (s.key == "attributeSettings")) {
                    // Update setting data
                    const setting = duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.isBoolean = s.type === Boolean;
                    setting.isSelect = s.choices !== undefined;

                    data.system.settings.push(setting);
                } 
            }
        }
  
        // Return data
        return {
            user: game.user,
            canConfigure: hasPermission,
            systemTitle: game.system.data.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
        html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
    }
  
    /**
     * Handle activating the button to configure User Role permissions
     * @param event {Event} The initial button click event
     * @private
     */
    _onClickSubmenu(event) {
        event.preventDefault();
        const menu = game.settings.menus.get(event.currentTarget.dataset.key);
        if (!menu) return ui.notifications.error("No submenu found for the provided key");
        const app = new menu.type();
        return app.render(true);
    }
  
    /**
     * Handle button click to reset default settings
     * @param event {Event} The initial button click event
     * @private
     */
    _onResetDefaults(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const form = button.form;

        for (let [k, v] of game.settings.settings.entries()) {
            if (v.config) {
                let input = form[k];
                if (input.type === "checkbox") input.checked = v.default;
                else if (input) input.value = v.default;
            }
        }
    }
  
    /** @override */
    async _updateObject(event, formData) {
        for (let [k, v] of Object.entries(flattenObject(formData))) {
            let s = game.settings.settings.get(k);
            let current = game.settings.get("worldofdarkness", s.key);

            if (v !== current) {
                await game.settings.set("worldofdarkness", s.key, v);
            }
        }
    }
}
