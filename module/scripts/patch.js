export default class Patch {

	static patch1_0_7(item, hasRun) {
        let characterChanged = false;

        if (!hasRun) {
            if (item.data.type == "Experience") {
              if (item.data.data.type == "wod.types.expgained") {
                item.update({"data.description" : item.name});
                characterChanged = true;
              }
            }          
        }

        return characterChanged;
    }

    static patch1_1_0(actor, hasRun) {
        let characterChanged = false;

        if (!hasRun) {
            if (actor.type == "Werewolf") {
              actor.update({"data.settings.soak.bashing.roll" : true,
                  "data.settings.soak.lethal.roll" : true,
                  "data.settings.soak.aggravated.roll" : true});

              characterChanged = true;
            }
            else if (actor.type == "Spirit") {
              actor.update({"data.settings.soak.bashing.roll" : true,
                  "data.settings.soak.lethal.roll" : true,
                  "data.settings.soak.aggravated.roll" : true});

              characterChanged = true;
            }
            else {
              actor.update({"data.settings.soak.bashing.roll" : true,
                    "data.settings.soak.lethal.roll" : false,
                    "data.settings.soak.aggravated.roll" : false});
              
              characterChanged = true;
            }
        }

        return characterChanged;
    }
}