export default class SelectHelper {
    static SetupItem(data, isCharacter = false) {
        let listData = [];

        // Items
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
                "vampire": game.i18n.localize("wod.games.vampire"),
                "werewolf": game.i18n.localize("wod.games.werewolf"),
                "wraith": game.i18n.localize("wod.games.wraith")
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
            let id = i;
            let name = i;

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
            let id = i;
            let name = i;

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
            let id = i;
            let name = i;

            const data = {
                value: i,
                label: i.toString()
            };

            values.push(data);
        }

        listData.Level9Value = values;

        values = [{
            value: "",
            label: "- " + game.i18n.localize("wod.labels.select") + " -"
        }];

        for (let i = 1; i < 11; i++) {
            let id = i;
            let name = i;

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
            let id = i;
            let name = i;

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