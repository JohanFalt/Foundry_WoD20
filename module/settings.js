export const systemSettings = function() {

    // type: Number,
    //     range: {
    //         min: 1,
    //         max: 2,
    //         step: 1
    //     }

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

    game.settings.register("worldofdarkness", "specialityLevel", {
		name: game.i18n.localize('wod.settings.specialitylevel'),
		hint: game.i18n.localize('wod.settings.specialitylevelhint'),
		scope: "world",
		config: false,
		default: 4,
		type: Number,
        choices: {
			1 : "1",
			2 : "2",
            3 : "3",
            4 : "4",
            5 : "5"
		}
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

    game.settings.register("worldofdarkness", "fifthEditionWillpowerSetting", {
		name: game.i18n.localize('wod.settings.fifthedwillpowersetting'),
		hint: game.i18n.localize('wod.settings.fifthedwillpowersettinghint'),
		scope: "world",
		config: false,
		default: "5th",
		type: String,
        choices: {
			"5th": "5th edition",
			"20th": "20th edition"
		}
	});

	game.settings.register("worldofdarkness", "willpowerBonusDice", {
		name: game.i18n.localize('wod.settings.willpowerBonusDice'),
		hint: game.i18n.localize('wod.settings.willpowerBonusDicehint'),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});	

    // DICE RULES

    game.settings.register("worldofdarkness", "theRollofOne", {
		name: game.i18n.localize('wod.settings.therollofone'),
		hint: game.i18n.localize('wod.settings.therollofonehint'),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "useOnesDamage", {
		name: game.i18n.localize('wod.settings.useOnesDamage'),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "usePenaltyDamage", {
		name: game.i18n.localize('wod.settings.usepenaltydamage'),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "useOnesSoak", {
		name: game.i18n.localize('wod.settings.useOnesSoak'),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "lowestDifficulty", {
		name: game.i18n.localize('wod.settings.lowestdifficulty'),
		hint: game.i18n.localize('wod.settings.lowestdifficultyhint'),
		scope: "world",
		config: false,
		default: 2,
		type: Number,
        choices: {
			"2": "2",
			"3": "3",
            "4": "4",
            "5": "5",
            "6": "6"
		}
	});

    game.settings.register("worldofdarkness", "specialityAddSuccess", {
		name: game.i18n.localize('wod.settings.specialityaddsuccess'),
		hint: game.i18n.localize('wod.settings.specialityaddsuccesshint'),
		scope: "world",
		config: false,
		default: 2,
		type: Number,
        choices: {
            "0": game.i18n.localize('wod.settings.nonotuse'),
            "1": "1",
			"2": "2",
			"3": "3"
		}
	});

    game.settings.register("worldofdarkness", "specialityAllowBotch", {
		name: game.i18n.localize('wod.settings.specialityallowbotch'),
		hint: game.i18n.localize('wod.settings.specialityallowbotchhint'),    
		scope: "world",
		config: false,
		default: true,
		type: Boolean
	});

    game.settings.register("worldofdarkness", "specialityReduceDiff", {
		name: game.i18n.localize('wod.settings.specialityreducediff'),
		hint: game.i18n.localize('wod.settings.specialityreducediffhint'),
		scope: "world",
		config: false,
		default: 0,
		type: Number,
        choices: {
            "0": game.i18n.localize('wod.settings.nonotuse'),
            "1": "-1",
			"2": "-2",
			"3": "-3"
		}
	});

    game.settings.register("worldofdarkness", "tenAddSuccess", {
		name: game.i18n.localize('wod.settings.tenaddsuccess'),
		hint: game.i18n.localize('wod.settings.tenaddsuccesshint'),
		scope: "world",
		config: false,
		default: 0,
		type: Number,
        choices: {
            "0": game.i18n.localize('wod.settings.nonotuse'),
            "1": "1",
			"2": "2",
			"3": "3"
		}
	});

    game.settings.register("worldofdarkness", "explodingDice", {
		name: game.i18n.localize('wod.settings.explodingdice'),
		hint: game.i18n.localize('wod.settings.explodingdicehint'),
		scope: "world",
		config: false,
		default: false,
		type: String,
        choices: {
			"never": game.i18n.localize('wod.settings.nonotuse'),
			"speciality": game.i18n.localize('wod.settings.usewithspeciality'),
            "always": game.i18n.localize('wod.settings.alwaysuse'),
		}
	});

    // END DICE RULES

    // ERA SETTINGS

    game.settings.register("worldofdarkness", "eraMortal", {
		name: game.i18n.localize('wod.era.mortaleratext'),
		scope: "world",
		config: false,
		default: "modern",
		type: String,
        choices: {
			"modern": game.i18n.localize('wod.era.modern'),
			"victorian": game.i18n.localize('wod.era.victorian'),
            "darkages": game.i18n.localize('wod.era.darkages'),
            "classical": game.i18n.localize('wod.era.classical'),
            "livinggods": game.i18n.localize('wod.era.livinggods')
		}
	});

    game.settings.register("worldofdarkness", "eraMage", {
		name: game.i18n.localize('wod.era.mageeratext'),
		scope: "world",
		config: false,
		default: "modern",
		type: String,
        choices: {
			"modern": game.i18n.localize('wod.era.modern'),
			"victorian": game.i18n.localize('wod.era.victorian')
		}
	});

    game.settings.register("worldofdarkness", "eraVampire", {
		name: game.i18n.localize('wod.era.vampireeratext'),
		scope: "world",
		config: false,
		default: "modern",
		type: String,
        choices: {
			"modern": game.i18n.localize('wod.era.modern'),
			"victorian": game.i18n.localize('wod.era.victorian'),
            "darkages": game.i18n.localize('wod.era.darkages'),
            "classical": game.i18n.localize('wod.era.classical'),
            "livinggods": game.i18n.localize('wod.era.livinggods')
		}
	});

    game.settings.register("worldofdarkness", "eraWerewolf", {
		name: game.i18n.localize('wod.era.werewolferatext'),
		scope: "world",
		config: false,
		default: "modern",
		type: String,
        choices: {
			"modern": game.i18n.localize('wod.era.modern'),
			"victorian": game.i18n.localize('wod.era.wildwest'),
            "darkages": game.i18n.localize('wod.era.darkages'),
		}
	});

    // END ERA SETTINGS

    // DEMON SETTINGS

    game.settings.register("worldofdarkness", "demonCreateForms", {
		name: game.i18n.localize('wod.settings.demoncreateforms'),
        hint: game.i18n.localize('wod.settings.demoncreateformshint'),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "demonSystemSettings", {
		name: game.i18n.localize('wod.settings.demonsystemsettings'),
		hint: game.i18n.localize('wod.settings.demonsystemsettingshint'),
		scope: "world",
		config: false,
		default: "revised",
		type: String,
		choices: {
			"revised": game.i18n.localize('wod.settings.demonsettingasbook'),
			"20th": game.i18n.localize('wod.settings.demonsettingas20th')
		}
	});

    // END DEMON SETTINGS

    // HUNTER SETTINGS

    game.settings.register("worldofdarkness", "hunteredgeSettings", {
		name: game.i18n.localize('wod.settings.edgesettings'),
		hint: game.i18n.localize('wod.settings.edgesettingshints'),
		scope: "world",
		config: false,
		default: "virtues",
		type: String,
		choices: {
			"virtues": game.i18n.localize('wod.settings.choicevirtue'),
			"experience": game.i18n.localize('wod.settings.choiceexperience')
		}
	});

    // END HUNTER SETTINGS

    // WEREWOLF SETTINGS

    game.settings.register("worldofdarkness", "wererwolfrageSettings", {
		name: game.i18n.localize('wod.settings.ragesettings'),
		hint: game.i18n.localize('wod.settings.ragesettingshints'),
		scope: "world",
		config: false,
		default: true,
		type: Boolean
	});

    // END WEREWOLF SETTINGS

    // PERMISSION SETTINGS

    game.settings.register("worldofdarkness", "observersFullActorViewPermission", {
		name: game.i18n.localize('wod.settings.observersactorpermission'),
		hint: game.i18n.localize('wod.settings.observersactorpermissionhint'),
		scope: "world",
		config: false,
		default: "full",
		type: String,
		choices: {
			"full": game.i18n.localize('wod.settings.observersfullsheet'),
			"limited": game.i18n.localize('wod.settings.observerspartialsheet')
		}
	});

    game.settings.register("worldofdarkness", "limitedFullActorViewPermission", {
		name: game.i18n.localize('wod.settings.limitedactorpermission'),
		hint: game.i18n.localize('wod.settings.limitedactorpermissionhint'),
		scope: "world",
		config: false,
		default: "limited",
		type: String,
		choices: {
			"full": game.i18n.localize('wod.settings.limitedfullsheet'),
			"limited": game.i18n.localize('wod.settings.limitedpartialsheet'),
            "mini": game.i18n.localize('wod.settings.minipartialsheet')
		}
	});

	game.settings.register("worldofdarkness", "changeActorImagePermission", {
		name: game.i18n.localize('wod.settings.changeactorimage'),
		hint: game.i18n.localize('wod.settings.changeactorimagehint'),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "changeItemImagePermission", {
		name: game.i18n.localize('wod.settings.changeitemimage'),
		hint: game.i18n.localize('wod.settings.changeitemimagehint'),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

	game.settings.register("worldofdarkness", "itemAdministratorLevel", {
		name: game.i18n.localize('wod.settings.itemadministrator'),
		hint: game.i18n.localize('wod.settings.itemadministratorhint'),
		scope: "world",
		config: false,
		default: "gm",
		type: String,
		choices: {
            "player": game.i18n.localize('wod.settings.player'),
			"trusted": game.i18n.localize('wod.settings.trustedplayer'),
			"assistant": game.i18n.localize('wod.settings.assistantgm'),
			"gm": "GM"
		}
	});

    // END PERMISSION SETTINGS

    // GRAPHIC SETTINGS

    game.settings.register("worldofdarkness", "useSplatFonts", {
		name: game.i18n.localize('wod.settings.usesplatfont'),
		hint: game.i18n.localize('wod.settings.usesplatfonthint'),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "useLinkPlatform", {
		name: game.i18n.localize('wod.settings.usesworldanvil'),
		hint: game.i18n.localize('wod.settings.usesworldanvilhint'),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    /**
    * dark mode. Css adjustements are located in the dark-theme.less file.
    */
    // game.settings.register( "worldofdarkness", "darkMode", {
    //     name: game.i18n.localize('wod.settings.darkmodesetting'),
    //     hint: game.i18n.localize('wod.settings.darkmodesettinghint'),
    //     scope: "client",
    //     config: true,
    //     default: false,
    //     type: Boolean,        
    // });

    // PATCH SETTINGS
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

    game.settings.register("worldofdarkness", "patch160", {
		name: "patch160",
		hint: "patch160",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch210", {
		name: "patch210",
		hint: "patch210",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch220", {
		name: "patch220",
		hint: "patch220",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch230", {
		name: "patch230",
		hint: "patch230",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch300", {
		name: "patch300",
		hint: "patch300",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch310", {
		name: "patch310",
		hint: "patch310",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch320", {
		name: "patch320",
		hint: "patch320",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch330", {
		name: "patch330",
		hint: "patch330",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch400", {
		name: "patch400",
		hint: "patch400",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch410", {
		name: "patch410",
		hint: "patch410",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch420", {
		name: "patch420",
		hint: "patch420",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    game.settings.register("worldofdarkness", "patch500", {
		name: "patch500",
		hint: "patch500",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});

    /* Groups of settings */
    game.settings.registerMenu("worldofdarkness", "ruleSettings", {
        name: game.i18n.localize('wod.settings.rulesettings'),
        hint: game.i18n.localize('wod.settings.rulesettingshint'),
        label: game.i18n.localize('wod.settings.rulesettings'),
        icon: "icon fa-solid fa-gear",
        type: Rules,
        restricted: true,
    });

    game.settings.registerMenu("worldofdarkness", "diceSettings", {
        name: game.i18n.localize('wod.settings.dicerules'),
        hint: game.i18n.localize('wod.settings.diceruleshint'),
        label: game.i18n.localize('wod.settings.dicerules'),
        icon: "icon fa-solid fa-gear",
        type: Dices,
        restricted: true,
    });

    game.settings.registerMenu("worldofdarkness", "eraSettings", {
        name: game.i18n.localize('wod.settings.erasettings'),
        hint: game.i18n.localize('wod.settings.erasettingshint'),
        label: game.i18n.localize('wod.settings.erasettings'),
        icon: "icon fa-solid fa-gear",
        type: Era,
        restricted: true,
    });    

    game.settings.registerMenu("worldofdarkness", "demonSettings", {
        name: game.i18n.localize('wod.settings.demonsettings'),
        hint: game.i18n.localize('wod.settings.demonsettingshint'),
        label: game.i18n.localize('wod.settings.demonsettings'),
        icon: "icon fa-solid fa-gear",
        type: Demon,
        restricted: true,
    });

    game.settings.registerMenu("worldofdarkness", "hunterSettings", {
        name: game.i18n.localize('wod.settings.huntersettings'),
        hint: game.i18n.localize('wod.settings.huntersettingshint'),
        label: game.i18n.localize('wod.settings.huntersettings'),
        icon: "icon fa-solid fa-gear",
        type: Hunter,
        restricted: true,
    });

    game.settings.registerMenu("worldofdarkness", "werewolfSettings", {
        name: game.i18n.localize('wod.settings.werewolfsettings'),
        hint: game.i18n.localize('wod.settings.werewolfsettingshint'),
        label: game.i18n.localize('wod.settings.werewolfsettings'),
        icon: "icon fa-solid fa-gear",
        type: Werewolf,
        restricted: true,
    });

	game.settings.registerMenu("worldofdarkness", "permissionSettings", {
        name: game.i18n.localize('wod.settings.permissionsettings'),
        hint: game.i18n.localize('wod.settings.permissionsettingshint'),
        label: game.i18n.localize('wod.settings.permissionsettings'),
        icon: "icon fa-solid fa-gear",
        type: Permissions,
        restricted: true,
    });

    game.settings.registerMenu("worldofdarkness", "graphicSettings", {
        name: game.i18n.localize('wod.settings.graphicsettings'),
        hint: game.i18n.localize('wod.settings.graphicsettingshint'),
        label: game.i18n.localize('wod.settings.graphicsettings'),
        icon: "icon fa-solid fa-gear",
        type: Graphics,
        restricted: true,
    });
};

export class Rules extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "rules",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize('wod.settings.rulesettings'),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-rule.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "advantageRolls") || (s.key == "specialityLevel") || (s.key == "attributeSettings") || (s.key == "fifthEditionWillpowerSetting") || (s.key == "willpowerBonusDice")) {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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

export class Dices extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "dices",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize("wod.settings.rollsettings"),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-dice.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "theRollofOne") || 
                        (s.key == "useOnesDamage") || 
                        (s.key == "usePenaltyDamage") || 
                        (s.key == "useOnesSoak") || 
                        (s.key == "lowestDifficulty") || 
                        (s.key == "specialityAddSuccess") || 
                        (s.key == "specialityReduceDiff") || 
                        (s.key == "specialityAllowBotch") ||                         
                        (s.key == "tenAddSuccess") || 
                        (s.key == "explodingDice"))  {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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

export class Era extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "dices",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize("wod.settings.erasettings"),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-era.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "eraMortal") || (s.key == "eraMage") || (s.key == "eraVampire") || (s.key == "eraWerewolf"))  {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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

export class Demon extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "demon",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize("wod.settings.demonsettings"),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-rule.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "demonSystemSettings") || (s.key == "demonCreateForms")) {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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


export class Hunter extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "hunter",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize("wod.settings.huntersettings"),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-rule.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "hunteredgeSettings")) {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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

export class Werewolf extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "werewolf",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize("wod.settings.werewolfsettings"),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-rule.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "wererwolfrageSettings")) {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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

export class Permissions extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "permission",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize('wod.settings.permissionsettings'),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-rule.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "changeActorImagePermission") || (s.key == "changeItemImagePermission") || (s.key == "itemAdministratorLevel") || (s.key == "observersFullActorViewPermission") || (s.key == "limitedFullActorViewPermission")) {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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

export class Graphics extends FormApplication {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "graphics",
            classes: ["wod20rule-dialog"],
            title: game.i18n.localize('wod.settings.graphicsettings'),
            template: "systems/worldofdarkness/templates/dialogs/dialog-settings-rule.hbs",
        });
    }
  
    getData(options) {
        const hasPermission = game.user.can("SETTINGS_MODIFY");  
        const data = {
            system: { 
                title: game.system.title, 
                menus: [], 
                settings: [] 
            }
        };

        // Classify all settings
        if (hasPermission) {
            for (let s of game.settings.settings.values()) {
                // Exclude settings the user cannot change
                if ((s.key == "useSplatFonts") || (s.key == "useLinkPlatform")) {
                    // Update setting data
                    const setting = foundry.utils.duplicate(s);

                    setting.name = game.i18n.localize(setting.name);
                    setting.hint = game.i18n.localize(setting.hint);
                    setting.value = game.settings.get("worldofdarkness", setting.key);
                    setting.type = s.type instanceof Function ? s.type.name : "String";
                    setting.scope = "worldofdarkness";
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
            systemTitle: game.system.title,
            data: data
        };
    }
  
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".submenu button").click(this._onClickSubmenu.bind(this));
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
