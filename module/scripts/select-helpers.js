export default class SelectHelper {
    static SetupItem(data) {
        let listData = [];

        if (data.type == "Power") {
            listData.Games = {
                "": "- " + game.i18n.localize("wod.labels.select") + " -",
                "changeling": game.i18n.localize("wod.games.changeling"),
                "demon": game.i18n.localize("wod.games.demon"),
                "hunter": game.i18n.localize("wod.games.hunter"),
                "vampire": game.i18n.localize("wod.games.vampire"),
                "werewolf": game.i18n.localize("wod.games.werewolf"),
                "wraith": game.i18n.localize("wod.games.wraith")
            }
            
            let type = {}
    
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
        
        // listData.Level5Value = {
        //     "": "- " + game.i18n.localize("wod.labels.select") + " -",
        //     "1": "1",
        //     "2": "2",
        //     "3": "3",
        //     "4": "4",
        //     "5": "5"
        // }

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

        // listData.Level6Value = {
        //     "": "- " + game.i18n.localize("wod.labels.select") + " -",
        //     "1": "1",
        //     "2": "2",
        //     "3": "3",
        //     "4": "4",
        //     "5": "5",
        //     "6": "6"
        // }

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

        // listData.Level9Value = {
        //     "": "- " + game.i18n.localize("wod.labels.select") + " -",
        //     "1": "1",
        //     "2": "2",
        //     "3": "3",
        //     "4": "4",
        //     "5": "5",
        //     "6": "6",
        //     "7": "7",
        //     "8": "8",
        //     "9": "9"
        // }

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

        // listData.Level10Value = {
        //     "": "- " + game.i18n.localize("wod.labels.select") + " -",
        //     "1": "1",
        //     "2": "2",
        //     "3": "3",
        //     "4": "4",
        //     "5": "5",
        //     "6": "6",
        //     "7": "7",
        //     "8": "8",
        //     "9": "9",
        //     "10": "10"
        // }       

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