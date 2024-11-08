export default class SelectHelper {
    static SetupItem(item) {
        let listData = [];

        if (item.type == "Power") {
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
    
            if (item.system.game == "changeling") {
                type = {
                    "wod.types.art": game.i18n.localize("wod.types.art"),
                    "wod.types.artpower": game.i18n.localize("wod.types.artpower")
                }
            }
            if (item.system.game == "demon") {
                type = {
                    "wod.types.lore": game.i18n.localize("wod.types.lore"),
                    "wod.types.lorepower": game.i18n.localize("wod.types.lorepower"),
                    "wod.types.ritual": game.i18n.localize("wod.types.ritual")
                }
            }
            if (item.system.game == "hunter") {
                type = {
                    "wod.types.edge": game.i18n.localize("wod.types.edge"),
                    "wod.types.edgepower": game.i18n.localize("wod.types.edgepower")
                }
            }
            if (item.system.game == "vampire") {
                type = {
                    "wod.types.discipline": game.i18n.localize("wod.types.discipline"),
                    "wod.types.disciplinepower": game.i18n.localize("wod.types.disciplinepower"),
                    "wod.types.disciplinepath": game.i18n.localize("wod.types.disciplinepath"),
                    "wod.types.disciplinepathpower": game.i18n.localize("wod.types.disciplinepathpower"),
                    "wod.types.ritual": game.i18n.localize("wod.types.ritual"),
                    "wod.types.combination": game.i18n.localize("wod.types.combination")
                }
            }
            if (item.system.game == "werewolf") {
                type = {
                    "wod.types.gift": game.i18n.localize("wod.types.gift"),
                    "wod.types.rite": game.i18n.localize("wod.types.rite")
                }
            }
            if (item.system.game == "wraith") {
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
    
            listData.Level5Value = {
                "0": "- " + game.i18n.localize("wod.labels.select") + " -",
                "1": "1",
                "2": "2",
                "3": "3",
                "4": "4",
                "5": "5"
            }
    
            listData.Level6Value = {
                "0": "- " + game.i18n.localize("wod.labels.select") + " -",
                "1": "1",
                "2": "2",
                "3": "3",
                "4": "4",
                "5": "5",
                "6": "6"
            }
    
            listData.Level9Value = {
                "0": "- " + game.i18n.localize("wod.labels.select") + " -",
                "1": "1",
                "2": "2",
                "3": "3",
                "4": "4",
                "5": "5",
                "6": "6",
                "7": "7",
                "8": "8",
                "9": "9"
            }
    
            let disciplinelist = {
                "0": "- " + game.i18n.localize("wod.labels.select") + " -"
            }
    
            for (const disciplines of game.worldofdarkness.powers.disciplines) {
                let id = disciplines.name.toLowerCase();
                let name = disciplines.name;
    
                disciplinelist = Object.assign(disciplinelist, {[id]: name});
            }
    
            listData.Disciplines = disciplinelist;
        }        

        return listData;
    }
}