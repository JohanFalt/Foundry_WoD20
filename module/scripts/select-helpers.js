export default class SelectHelper {
    static SetupItem(data, isCharacter = false) {
        let listData = [];

        // Items
        if ((data.type == "Melee Weapon") || (data.type == "Ranged Weapon")) {
            listData.AttackAttributes = [{
                value: "", 
                label: "- " + game.i18n.localize("wod.labels.none") + " -"
            }];
            listData.AttackAbilities = [{
                value: "", 
                label: "- " + game.i18n.localize("wod.labels.select") + " -"
            },{
                value: "custom", 
                label: "- " + game.i18n.localize("wod.labels.custom") + " -"
            }];
                
            for (const attribute in CONFIG.worldofdarkness.attackAttributes) {
                const data = {
                    value: attribute,
                    label: game.i18n.localize(CONFIG.worldofdarkness.attackAttributes[attribute])
                };

                listData.AttackAttributes.push(data);
            }

            if (data.type == "Melee Weapon") {
                for (const ability in CONFIG.worldofdarkness.attackMeleeAbilities) {
                    const data = {
                        value: ability,
                        label: game.i18n.localize(CONFIG.worldofdarkness.attackMeleeAbilities[ability])
                    };

                    listData.AttackAbilities.push(data);
                }
            }
            if (data.type == "Ranged Weapon") {
                for (const ability in CONFIG.worldofdarkness.attackRangedAbilities) {
                    const data = {
                        value: ability,
                        label: game.i18n.localize(CONFIG.worldofdarkness.attackRangedAbilities[ability])
                    };
    
                    listData.AttackAbilities.push(data);
                }
            }
        }

        if (data.type == "Feature") {
            listData.TypeList = [
            {
                value: "", 
                label: "- " + game.i18n.localize("wod.labels.select") + " -"
            },
            {
                value: "wod.types.background", 
                label: game.i18n.localize("wod.types.background"), 
                group: game.i18n.localize("wod.labels.other")
            },
            {
                value: "wod.types.merit", 
                label: game.i18n.localize("wod.types.merit"), 
                group: game.i18n.localize("wod.labels.other")
            },
            {
                value: "wod.types.flaw", 
                label: game.i18n.localize("wod.types.flaw"), 
                group: game.i18n.localize("wod.labels.other")
            },
            {
                value: "wod.types.bloodbound", 
                label: game.i18n.localize("wod.types.bloodbound"), 
                group: game.i18n.localize("wod.games.vampire")
            },
            {
                value: "wod.types.boon", 
                label: game.i18n.localize("wod.types.boon"), 
                group: game.i18n.localize("wod.games.vampire")
            },
            {
                value: "wod.types.oath", 
                label: game.i18n.localize("wod.types.oath"), 
                group: game.i18n.localize("wod.games.changeling")
            }];
        }

        if (data.type == "Fetish") {
            listData.TypeList = [{
                value: "wod.types.fetish", 
                label: game.i18n.localize("wod.types.fetish")
            },
            {
                value: "wod.types.talen", 
                label: game.i18n.localize("wod.types.talen")
            }];
        }    
        
        if (data.type == "Item") {
            listData.TypeList = [
            {
                value: "", 
                label: "- " + game.i18n.localize("wod.labels.select") + " -"
            },
            {
                value: "wod.types.treasure", 
                label: game.i18n.localize("wod.types.treasure"), 
                group: game.i18n.localize("wod.games.changeling")
            },
            {
                value: "wod.types.device", 
                label: game.i18n.localize("wod.gear.device"), 
                group: game.i18n.localize("wod.games.mage")
            },
            {
                value: "wod.types.talisman", 
                label: game.i18n.localize("wod.gear.talisman"), 
                group: game.i18n.localize("wod.games.mage")
            },
            {
                value: "wod.types.periapt", 
                label: game.i18n.localize("wod.gear.periapt"), 
                group: game.i18n.localize("wod.games.mage")
            },
            {
                value: "wod.types.matrix", 
                label: game.i18n.localize("wod.gear.matrix"), 
                group: game.i18n.localize("wod.games.mage")
            },
            {
                value: "wod.types.trinket", 
                label: game.i18n.localize("wod.gear.trinket"), 
                group: game.i18n.localize("wod.games.mage")
            }];
        }

        if (data.type == "Trait") {
            listData.TypeList = [
            {
                value: "", 
                label: "- " + game.i18n.localize("wod.labels.select") + " -"
            },
            {
                value: "wod.types.realms", 
                label: game.i18n.localize("wod.realms.headline"), 
                group: game.i18n.localize("wod.games.changeling")
            },
            {
                value: "wod.types.resonance", 
                label: game.i18n.localize("wod.types.resonance"), 
                group: game.i18n.localize("wod.games.mage")
            },
            {
                value: "wod.types.passion", 
                label: game.i18n.localize("wod.types.passion"), 
                group: game.i18n.localize("wod.games.wraith")
            },
            {
                value: "wod.types.fetter", 
                label: game.i18n.localize("wod.types.fetter"), 
                group: game.i18n.localize("wod.games.wraith")
            },
            {
                value: "wod.types.apocalypticform", 
                label: game.i18n.localize("wod.types.apocalypticform"), 
                group: game.i18n.localize("wod.games.demon")
            },
            {
                value: "wod.types.shapeform", 
                label: game.i18n.localize("wod.types.shapeform"), 
                group: game.i18n.localize("wod.games.exalted")
            },
            {
                value: "wod.types.aspect", 
                label: game.i18n.localize("wod.types.aspect"), 
                group: game.i18n.localize("wod.games.exalted")
            },
            {
                value: "wod.types.talentsecondability", 
                label: game.i18n.localize("wod.types.talentsecondability"), 
                group: game.i18n.localize("wod.labels.custom")
            },
            {
                value: "wod.types.skillsecondability", 
                label: game.i18n.localize("wod.types.skillsecondability"), 
                group: game.i18n.localize("wod.labels.custom")
            },
            {
                value: "wod.types.knowledgesecondability", 
                label: game.i18n.localize("wod.types.knowledgesecondability"), 
                group: game.i18n.localize("wod.labels.custom")
            },
            {
                value: "wod.types.othertraits", 
                label: game.i18n.localize("wod.types.othertraits"), 
                group: game.i18n.localize("wod.labels.other")
            }];
        }

        if (data.type == "Power") {
            let type = {};

            listData.Games = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -",
                "changeling": game.i18n.localize("wod.games.changeling"),
                "demon": game.i18n.localize("wod.games.demon"),
                "hunter": game.i18n.localize("wod.games.hunter"),
                "mummy": game.i18n.localize("wod.games.mummy"),
                "mage": game.i18n.localize("wod.games.mage"),
                "vampire": game.i18n.localize("wod.games.vampire"),
                "werewolf": game.i18n.localize("wod.games.werewolf"),
                "wraith": game.i18n.localize("wod.games.wraith"),
                "orpheus": game.i18n.localize("wod.games.orpheus"),
                "exalted": game.i18n.localize("wod.games.exalted")
            }

            if (data.system.game == "orpheus") {
                type = {
                    "wod.types.stain": game.i18n.localize("wod.types.stain"),
                    "wod.types.horror": game.i18n.localize("wod.types.horror"),
                }
            }            
            if (data.system.game == "changeling") {
                type = {
                    "wod.types.art": game.i18n.localize("wod.types.art"),
                    "wod.types.artpower": game.i18n.localize("wod.types.artpower")
                }
            }
            if (data.system.game == "demon") {
                type = {
                    "wod.types.lore": game.i18n.localize("wod.types.lore"),
                    "wod.types.lorepower": game.i18n.localize("wod.types.lorepower"),
                    "wod.types.ritual": game.i18n.localize("wod.types.ritual")
                }
            }
            if (data.system.game == "hunter") {
                type = {
                    "wod.types.edge": game.i18n.localize("wod.types.edge"),
                    "wod.types.edgepower": game.i18n.localize("wod.types.edgepower")
                }
            }
            if (data.system.game == "mage") {
                type = {
                    "wod.types.numina": game.i18n.localize("wod.types.numina"),
                    "wod.types.numinapower": game.i18n.localize("wod.types.numinapower")
                }
            }
            if (data.system.game == "vampire") {
                type = {
                    "wod.types.discipline": game.i18n.localize("wod.types.discipline"),
                    "wod.types.disciplinepower": game.i18n.localize("wod.types.disciplinepower"),
                    "wod.types.disciplinepath": game.i18n.localize("wod.types.disciplinepath"),
                    "wod.types.disciplinepathpower": game.i18n.localize("wod.types.disciplinepathpower"),
                    "wod.types.ritual": game.i18n.localize("wod.types.ritual"),
                    "wod.types.combination": game.i18n.localize("wod.types.combination")
                }
            }
            if (data.system.game == "werewolf") {
                type = {
                    "wod.types.gift": game.i18n.localize("wod.types.gift"),
                    "wod.types.rite": game.i18n.localize("wod.types.rite")
                }
            }
            if (data.system.game == "wraith") {
                type = {
                    "wod.types.arcanoi": game.i18n.localize("wod.types.arcanoi"),
                    "wod.types.arcanoipower": game.i18n.localize("wod.types.arcanoipower")
                }
            }
            if (data.system.game == "mummy") {
                type = {
                    "wod.types.hekau": game.i18n.localize("wod.types.hekau"),
                    "wod.types.hekaupower": game.i18n.localize("wod.types.hekaupower")
                }
            }

            if (data.system.game == "exalted") {
                type = {
                    "wod.types.exaltedcharm": game.i18n.localize("wod.types.exaltedcharm"),
                    "wod.types.exaltedsorcery": game.i18n.localize("wod.types.exaltedsorcery")
                }

                listData.ExaltedCharmTypes = [
                    {
                        value: "", 
                        label: "- " + game.i18n.localize("wod.labels.select") + " -"
                    },
                    {
                        value: "wod.types.solar.dawn", 
                        label: game.i18n.localize("wod.types.solar.dawn"), 
                        group: game.i18n.localize("wod.bio.exalted.solar")
                    },
                    {
                        value: "wod.types.solar.zenith", 
                        label: game.i18n.localize("wod.types.solar.zenith"),
                        group: game.i18n.localize("wod.bio.exalted.solar")
                    },
                    {
                        value: "wod.types.solar.twilight", 
                        label: game.i18n.localize("wod.types.solar.twilight"),
                        group: game.i18n.localize("wod.bio.exalted.solar")
                    },
                    {
                        value: "wod.types.solar.night", 
                        label: game.i18n.localize("wod.types.solar.night"),
                        group: game.i18n.localize("wod.bio.exalted.solar")
                    },
                    {
                        value: "wod.types.solar.eclipse", 
                        label: game.i18n.localize("wod.types.solar.eclipse"),
                        group: game.i18n.localize("wod.bio.exalted.solar")
                    },
                    {
                        value: "wod.types.solar.special", 
                        label: game.i18n.localize("wod.types.solar.special"),
                        group: game.i18n.localize("wod.bio.exalted.solar")
                    },
                    {
                        value: "wod.types.lunar.fullmoon", 
                        label: game.i18n.localize("wod.types.lunar.fullmoon"), 
                        group: game.i18n.localize("wod.bio.exalted.lunar")
                    },
                    {
                        value: "wod.types.lunar.changingmoon", 
                        label: game.i18n.localize("wod.types.lunar.changingmoon"), 
                        group: game.i18n.localize("wod.bio.exalted.lunar")
                    },
                    {
                        value: "wod.types.lunar.nomoon", 
                        label: game.i18n.localize("wod.types.lunar.nomoon"), 
                        group: game.i18n.localize("wod.bio.exalted.lunar")
                    },
                    {
                        value: "wod.types.lunar.shapeshifting", 
                        label: game.i18n.localize("wod.types.lunar.shapeshifting"), 
                        group: game.i18n.localize("wod.bio.exalted.lunar")
                    },
                    {
                        value: "wod.types.dragon.air", 
                        label: game.i18n.localize("wod.types.dragon.air"), 
                        group: game.i18n.localize("wod.bio.exalted.dragon")
                    },
                    {
                        value: "wod.types.dragon.earth", 
                        label: game.i18n.localize("wod.types.dragon.earth"), 
                        group: game.i18n.localize("wod.bio.exalted.dragon")
                    },
                    {
                        value: "wod.types.dragon.fire", 
                        label: game.i18n.localize("wod.types.dragon.fire"), 
                        group: game.i18n.localize("wod.bio.exalted.dragon")
                    },
                    {
                        value: "wod.types.dragon.water", 
                        label: game.i18n.localize("wod.types.dragon.water"),
                        group: game.i18n.localize("wod.bio.exalted.dragon")
                    },
                    {
                        value: "wod.types.dragon.wood", 
                        label: game.i18n.localize("wod.types.dragon.wood"),
                        group: game.i18n.localize("wod.bio.exalted.dragon")
                    },
                    {
                        value: "wod.types.sidereal.journey", 
                        label: game.i18n.localize("wod.types.sidereal.journey"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.serenity", 
                        label: game.i18n.localize("wod.types.sidereal.serenity"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.battle", 
                        label: game.i18n.localize("wod.types.sidereal.battle"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.secret", 
                        label: game.i18n.localize("wod.types.sidereal.secret"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.ending", 
                        label: game.i18n.localize("wod.types.sidereal.ending"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.border", 
                        label: game.i18n.localize("wod.types.sidereal.border"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.hand", 
                        label: game.i18n.localize("wod.types.sidereal.hand"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.march", 
                        label: game.i18n.localize("wod.types.sidereal.march"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.shard", 
                        label: game.i18n.localize("wod.types.sidereal.shard"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.prismatic", 
                        label: game.i18n.localize("wod.types.sidereal.prismatic"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.veil", 
                        label: game.i18n.localize("wod.types.sidereal.veil"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.sidereal.scarlet", 
                        label: game.i18n.localize("wod.types.sidereal.scarlet"),
                        group: game.i18n.localize("wod.bio.exalted.sidereal")
                    },
                    {
                        value: "wod.types.abyssal.dusk", 
                        label: game.i18n.localize("wod.types.abyssal.dusk"),
                        group: game.i18n.localize("wod.bio.exalted.abyssal")
                    },
                    {
                        value: "wod.types.abyssal.midnight", 
                        label: game.i18n.localize("wod.types.abyssal.midnight"),
                        group: game.i18n.localize("wod.bio.exalted.abyssal")
                    },
                    {
                        value: "wod.types.abyssal.daybreak", 
                        label: game.i18n.localize("wod.types.abyssal.daybreak"),
                        group: game.i18n.localize("wod.bio.exalted.abyssal")
                    },
                    {
                        value: "wod.types.abyssal.day", 
                        label: game.i18n.localize("wod.types.abyssal.day"),
                        group: game.i18n.localize("wod.bio.exalted.abyssal")
                    },
                    {
                        value: "wod.types.abyssal.moonshadow", 
                        label: game.i18n.localize("wod.types.abyssal.moonshadow"),
                        group: game.i18n.localize("wod.bio.exalted.abyssal")
                    },
                    {
                        value: "wod.types.infernal.general", 
                        label: game.i18n.localize("wod.types.infernal.general"),
                        group: game.i18n.localize("wod.bio.exalted.infernal")
                    },
                    {
                        value: "wod.types.infernal.realm", 
                        label: game.i18n.localize("wod.types.infernal.realm"), 
                        group: game.i18n.localize("wod.bio.exalted.infernal")
                    },
                    {
                        value: "wod.types.infernal.lanka", 
                        label: game.i18n.localize("wod.types.infernal.lanka"),
                        group: game.i18n.localize("wod.bio.exalted.infernal")
                    },
                    {
                        value: "wod.types.infernal.skinned", 
                        label: game.i18n.localize("wod.types.infernal.skinned"),
                        group: game.i18n.localize("wod.bio.exalted.infernal")
                    },
                    {
                        value: "wod.types.infernal.city", 
                        label: game.i18n.localize("wod.types.infernal.city"),
                        group: game.i18n.localize("wod.bio.exalted.infernal")
                    },
                    {
                        value: "wod.types.infernal.boiling", 
                        label: game.i18n.localize("wod.types.infernal.boiling"),
                        group: game.i18n.localize("wod.bio.exalted.infernal")
                    },
                    {
                        value: "wod.types.infernal.burrowing", 
                        label: game.i18n.localize("wod.types.infernal.burrowing"),
                        group: game.i18n.localize("wod.bio.exalted.infernal")
                    },
                    {
                        value: "wod.types.alchemical.general", 
                        label: game.i18n.localize("wod.types.alchemical.general"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.alchemical.combat", 
                        label: game.i18n.localize("wod.types.alchemical.combat"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.alchemical.physical", 
                        label: game.i18n.localize("wod.types.alchemical.physical"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.alchemical.social", 
                        label: game.i18n.localize("wod.types.alchemical.social"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.alchemical.stealth", 
                        label: game.i18n.localize("wod.types.alchemical.stealth"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.alchemical.analytic", 
                        label: game.i18n.localize("wod.types.alchemical.analytic"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.alchemical.utility", 
                        label: game.i18n.localize("wod.types.alchemical.utility"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.alchemical.spirit", 
                        label: game.i18n.localize("wod.types.alchemical.spirit"),
                        group: game.i18n.localize("wod.bio.exalted.alchemical")
                    },
                    {
                        value: "wod.types.liminal.blood", 
                        label: game.i18n.localize("wod.types.liminal.blood"),
                        group: game.i18n.localize("wod.bio.exalted.liminal")
                    },
                    {
                        value: "wod.types.liminal.breath", 
                        label: game.i18n.localize("wod.types.liminal.breath"),
                        group: game.i18n.localize("wod.bio.exalted.liminal")
                    },
                    {
                        value: "wod.types.liminal.fleash", 
                        label: game.i18n.localize("wod.types.liminal.fleash"),
                        group: game.i18n.localize("wod.bio.exalted.liminal")
                    },
                    {
                        value: "wod.types.liminal.marrow", 
                        label: game.i18n.localize("wod.types.liminal.marrow"),
                        group: game.i18n.localize("wod.bio.exalted.liminal")
                    },
                    {
                        value: "wod.types.liminal.soil", 
                        label: game.i18n.localize("wod.types.liminal.soil"),
                        group: game.i18n.localize("wod.bio.exalted.liminal")
                    }
                ];
            }
    
            let creature = {
                "wod.types.charm": game.i18n.localize("wod.types.charm") + " (Creature)",
                "wod.types.power": game.i18n.localize("wod.types.power") + " (Creature)"
            }
    
            listData.Types = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -",
                ...type,
                ...creature
            }

            listData.RitualCategories = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -",
                "wod.power.abyss" : game.i18n.localize("wod.power.abyss"),
				"wod.power.koldunic": game.i18n.localize("wod.power.koldunic"),
				"wod.power.necromancy": game.i18n.localize("wod.power.necromancy"),
				"wod.power.thaumaturgy": game.i18n.localize("wod.power.thaumaturgy")
            }

            listData.ArtTypes = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -",
                "wod.health.chimerical" : game.i18n.localize("wod.health.chimerical"),
				"wod.types.wyrd": game.i18n.localize("wod.types.wyrd"),
				"wod.labels.both": game.i18n.localize("wod.labels.both")
            }

            let artlist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }

            for (const arts of game.worldofdarkness.powers.arts) {
                let id = arts.name.toLowerCase();
                let name = arts.name;
    
                artlist = Object.assign(artlist, {[id]: name});
            }
    
            listData.Arts = artlist;
    
            let disciplinelist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
    
            for (const disciplines of game.worldofdarkness.powers.disciplines) {
                let id = disciplines.name.toLowerCase();
                let name = disciplines.name;
    
                disciplinelist = Object.assign(disciplinelist, {[id]: name});
            }
    
            listData.Disciplines = disciplinelist;

            let disciplinepathlist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
    
            for (const disciplines of game.worldofdarkness.powers.disciplinepaths) {
                let id = disciplines.name.toLowerCase();
                let name = disciplines.name;
    
                disciplinepathlist = Object.assign(disciplinepathlist, {[id]: name});
            }
    
            listData.DisciplinePaths = disciplinepathlist;

            let edgelist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
    
            for (const edge of game.worldofdarkness.powers.edges) {
                let id = edge.name.toLowerCase();
                let name = edge.name;
    
                edgelist = Object.assign(edgelist, {[id]: name});
            }
    
            listData.Edges = edgelist;

            let lorelist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
    
            for (const lore of game.worldofdarkness.powers.lores) {
                let id = lore.name.toLowerCase();
                let name = lore.name;
    
                lorelist = Object.assign(lorelist, {[id]: name});
            }
    
            listData.Lores = lorelist;

            let arcanoilist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
    
            for (const arcanoi of game.worldofdarkness.powers.arcanoi) {
                let id = arcanoi.name.toLowerCase();
                let name = arcanoi.name;
    
                arcanoilist = Object.assign(arcanoilist, {[id]: name});
            }
    
            listData.Arcanoi = arcanoilist;   
            
            let hekaulist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
            
            for (const hekau of game.worldofdarkness.powers.hekau) {
                let id = hekau.name.toLowerCase();
                let name = hekau.name;
    
                hekaulist = Object.assign(hekaulist, {[id]: name});
            }
    
            listData.Hekau = hekaulist;

            let numinalist = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
            
            for (const numina of game.worldofdarkness.powers.numina) {
                let id = numina.name.toLowerCase();
                let name = numina.name;
    
                numinalist = Object.assign(numinalist, {[id]: name});
            }

            listData.Numina = numinalist;
        }

        if (data.type == "Experience") {
            listData.Experience = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -",
                "wod.types.expspent": game.i18n.localize("wod.types.expspent"),
                "wod.types.expgained": game.i18n.localize("wod.types.expgained")
            }
        }
        
        // Actors
        if (isCharacter) {
            listData.Dice = {
                "": "- " + game.i18n.localize("wod.labels.sheetsetting") + " -",
                "none": game.i18n.localize("wod.labels.nosetting"),
                "mortal": game.i18n.localize("wod.games.mortal"),
                "changeling": game.i18n.localize("wod.games.changeling"),
                "demon": game.i18n.localize("wod.games.demon"),
                "hunter": game.i18n.localize("wod.games.hunter"),
                "mummy": game.i18n.localize("wod.games.mummy"),
                "mage": game.i18n.localize("wod.games.mage"),
                "vampire": game.i18n.localize("wod.games.vampire"),
                "werewolf": game.i18n.localize("wod.games.werewolf"),
                "wraith": game.i18n.localize("wod.games.wraith")
            }

            if ((data.type == CONFIG.worldofdarkness.sheettype.werewolf) || (data.type == CONFIG.worldofdarkness.sheettype.changingbreed)) {
                let breedlist = {};
                let auspicelist = {};
                let tribelist = {};
            }

            if (data.type == CONFIG.worldofdarkness.sheettype.mage) {
                let affiliationlist = {};
                let sectlist = {};
                let affinitylist = {};
            }

            if (data.type == CONFIG.worldofdarkness.sheettype.vampire) {
                let sectlist = {};
                let clanlist = {};
                let generationlist = {};

                // ******** PATHS 
                let pathlist = {
                    "": "- " + game.i18n.localize("wod.labels.select") + " -"
                }

                if (data.system.advantages.path.custom == "") {
                    let id = "custom";
                    let name = game.i18n.localize("wod.labels.custompath");
        
                    pathlist = Object.assign(pathlist, {[id]: name});
                }
                else {
                    let id = "custom";
                    let name = data.system.advantages.path.custom;
        
                    pathlist = Object.assign(pathlist, {[id]: name});
                }

                for (const path in game.worldofdarkness.bio.path) {
                    let id = game.worldofdarkness.bio.path[path];
                    let name = game.i18n.localize(game.worldofdarkness.bio.path[path]);
        
                    pathlist = Object.assign(pathlist, {[id]: name});
                }

                listData.PathList = pathlist;            

                listData.Conscience = {
                    "wod.advantages.virtue.conscience": game.i18n.localize("wod.advantages.virtue.conscience"),
                    "wod.advantages.virtue.conviction": game.i18n.localize("wod.advantages.virtue.conviction")
                }

                listData.Selfcontrol = {
                    "wod.advantages.virtue.selfcontrol": game.i18n.localize("wod.advantages.virtue.selfcontrol"),
                    "wod.advantages.virtue.instinct": game.i18n.localize("wod.advantages.virtue.instinct")
                }
            }

            if (data.type == CONFIG.worldofdarkness.sheettype.changeling) {
                let seeminglist = {};
                let kithlist = {};
                let courtlist = {};
                let affinityrealm = {};
            }

            if (data.type == CONFIG.worldofdarkness.sheettype.hunter) {
                let creedlist = {};
                let primaryvirtue = {};
            }

            if (data.type == CONFIG.worldofdarkness.sheettype.demon) {
                let houselist = {};
                let factionlist = {};
            }
        }   
        // Dialogs and Items
        else {
            let abilitylist = [{}];

            for (const ability in CONFIG.worldofdarkness.talents) {
                let id = CONFIG.worldofdarkness.talents[ability];
                let name = game.i18n.localize(CONFIG.worldofdarkness.talents[ability]);
                let group = game.i18n.localize('wod.abilities.talents');
    
                const data = {
                    value: id,
                    label: name,
                    group: group
                };
    
                abilitylist.push(data);
            }
            for (const ability in CONFIG.worldofdarkness.skills) {
                if (ability == "technology") continue;
    
                let id = CONFIG.worldofdarkness.skills[ability];
                let name = game.i18n.localize(CONFIG.worldofdarkness.skills[ability]);
                let group = game.i18n.localize('wod.abilities.skills');
    
                const data = {
                    value: id,
                    label: name,
                    group: group
                };
    
                abilitylist.push(data);
            }
            for (const ability in CONFIG.worldofdarkness.knowledges) {
                if (ability == "research") continue;
    
                let id = CONFIG.worldofdarkness.knowledges[ability];
                let name = game.i18n.localize(CONFIG.worldofdarkness.knowledges[ability]);
                let group = game.i18n.localize('wod.abilities.knowledges');
    
                const data = {
                    value: id,
                    label: name,
                    group: group
                };
    
                abilitylist.push(data);
            }
    
            listData.AbilityList = abilitylist;

                       
    
            // ******** BONUS
            listData.BonusLista = [
                {
                    value: "", 
                    label: "- " + game.i18n.localize("wod.labels.select") + " -"
                },
                {
                    value: "attribute_buff", 
                    label: game.i18n.localize("wod.labels.bonus.attributebonus"), 
                    //selected: true, 
                    group: game.i18n.localize("wod.attributes.attributes")
                },
                {
                    value: "attribute_dice_buff", 
                    label: game.i18n.localize("wod.labels.bonus.attributedicebonus"),
                    //disabled: true, 
                    group: game.i18n.localize("wod.attributes.attributes")
                },
                {
                    value: "attribute_diff", 
                    label: game.i18n.localize("wod.labels.bonus.attributediff"),
                    group: game.i18n.localize("wod.attributes.attributes")
                },
                {
                    value: "attribute_auto_buff", 
                    label: game.i18n.localize("wod.labels.bonus.attributesucc"),
                    group: game.i18n.localize("wod.attributes.attributes")
                },
                {
                    value: "ability_buff", 
                    label: game.i18n.localize("wod.labels.bonus.abilitybonus"),
                    group: game.i18n.localize("wod.abilities.abilities")
                },
                {
                    value: "ability_diff", 
                    label: game.i18n.localize("wod.labels.bonus.abilitydiff"),
                    group: game.i18n.localize("wod.abilities.abilities")
                },
                {
                    value: "soak_buff", 
                    label: game.i18n.localize("wod.labels.bonus.soakbonus"),
                    group: game.i18n.localize("wod.labels.other")
                },
                {
                    value: "soak_diff", 
                    label: game.i18n.localize("wod.labels.bonus.soakdiffbonus"),
                    group: game.i18n.localize("wod.labels.other")
                },
                {
                    value: "health_buff", 
                    label: game.i18n.localize("wod.labels.bonus.healthbuff"),
                    group: game.i18n.localize("wod.labels.other")
                },
                {
                    value: "initiative_buff", 
                    label: game.i18n.localize("wod.labels.bonus.initbonus"),
                    group: game.i18n.localize("wod.labels.other")
                },
                {
                    value: "movement_buff", 
                    label: game.i18n.localize("wod.labels.bonus.movebonus"),
                    group: game.i18n.localize("wod.labels.other")
                }
            ];
        }             

        // ******** VALUES 1-5, 1-9, and so on
        let values = [{
            value: "",
            label: "- " + game.i18n.localize("wod.labels.select") + " -"
        }];

        for (let i = 1; i < 6; i++) {
            const data = {
                value: i,
                label: i.toString()
            };

            values.push(data);
        }

        listData.Level5Value = values;

        values = [{
            value: "",
            label: "- " + game.i18n.localize("wod.labels.select") + " -"
        }];

        for (let i = 1; i < 7; i++) {
            const data = {
                value: i,
                label: i.toString()
            };

            values.push(data);
        }

        listData.Level6Value = values;

        values = [{
            value: "",
            label: "- " + game.i18n.localize("wod.labels.select") + " -"
        }];

        for (let i = 1; i < 10; i++) {
            const data = {
                value: i,
                label: i.toString()
            };

            values.push(data);
        }

        listData.Level9Value = values;

        for (let i = 1; i < 11; i++) {
            const data = {
                value: i,
                label: i.toString()
            };

            values.push(data);
        }

        listData.Level10Value = values;

        values = [{
            value: 0,
            label: "0"
        }];

        for (let i = 1; i < 10; i++) {
            const data = {
                value: i,
                label: i.toString()
            };

            values.push(data);
        }

        listData.ZeroToNine = values;

        values = [{
            value: "",
            label: "- " + game.i18n.localize("wod.labels.select") + " -"
        }];

        for (let i = 1; i < 11; i++) {
            const data = {
                value: i,
                label: i.toString()
            };

            values.push(data);
        }

        listData.Level10Value = values;
     

        let difficulty = [{
            value: -1,
            label: "- " + game.i18n.localize("wod.labels.varies") + " -"
        }];
            
        for (let i = CONFIG.worldofdarkness.lowestDifficulty; i < 10; i++) {
            const data = {
                value: i,
                label: i.toString()
            };

            difficulty.push(data);
        }

        listData.DifficultyList = difficulty;

        return listData;
    }    
}