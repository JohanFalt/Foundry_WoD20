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

    // static patch1_0_9(actor, hasRun) {
    //     let characterChanged = false;

    //     if (!hasRun) {
    //         if (actor.data.data.attributes.strength.bonus == undefined) {
    //           actor.update({"data.attributes.strength.bonus" : 0});
    //           characterChanged = true;
    //         }   
  
    //         if (actor.data.data.attributes.dexterity.bonus == undefined) {
    //           actor.update({"data.attributes.dexterity.bonus" : 0});
    //           characterChanged = true;
    //         }  
  
    //         if (actor.data.data.attributes.stamina.bonus == undefined) {
    //           actor.update({"data.attributes.stamina.bonus" : 0});
    //           characterChanged = true;
    //         }
  
    //         if (actor.data.data.attributes.charisma.bonus == undefined) {
    //           actor.update({"data.attributes.charisma.bonus" : 0});
    //           characterChanged = true;
    //         }
  
    //         if (actor.data.data.attributes.manipulation.bonus == undefined) {
    //           actor.update({"data.attributes.manipulation.bonus" : 0});
    //           characterChanged = true;
    //         }
  
    //         if (actor.data.data.attributes.composure.bonus == undefined) {
    //           actor.update({"data.attributes.composure.bonus" : 0});
    //           characterChanged = true;
    //         }
  
    //         if (actor.data.data.attributes.intelligence.bonus == undefined) {
    //           actor.update({"data.attributes.intelligence.bonus" : 0});
    //           characterChanged = true;
    //         }
  
    //         if (actor.data.data.attributes.wits.bonus == undefined) {
    //           actor.update({"data.attributes.wits.bonus" : 0});
    //           characterChanged = true;
    //         }
  
    //         if (actor.data.data.attributes.resolve.bonus == undefined) {
    //           actor.update({"data.attributes.resolve.bonus" : 0});
    //           characterChanged = true;
    //         }
    //     }

    //     return characterChanged;
    // }

    static patch1_1_0(actor, hasRun) {
        let characterChanged = false;

        if (!hasRun) {
            // if (actor.data.data.attributes.strength.visible == undefined) {
            //   actor.update({"data.attributes.strength.visible" : true});
            //   characterChanged = true;
            // }   
  
            // if (actor.data.data.attributes.dexterity.visible == undefined) {
            //   actor.update({"data.attributes.dexterity.visible" : true});
            //   characterChanged = true;
            // }  
  
            // if (actor.data.data.attributes.stamina.visible == undefined) {
            //   actor.update({"data.attributes.stamina.visible" : true});
            //   characterChanged = true;
            // }
  
            // if (actor.data.data.attributes.charisma.visible == undefined) {
            //   actor.update({"data.attributes.charisma.visible" : true});
            //   characterChanged = true;
            // }
  
            // if (actor.data.data.attributes.manipulation.visible == undefined) {
            //   actor.update({"data.attributes.manipulation.visible" : true});
            //   characterChanged = true;
            // }
  
            // if (actor.data.data.attributes.composure.visible == undefined) {
            //   actor.update({"data.attributes.composure.visible" : false});
            //   characterChanged = true;
            // }
  
            // if (actor.data.data.attributes.intelligence.visible == undefined) {
            //   actor.update({"data.attributes.intelligence.visible" : true});
            //   characterChanged = true;
            // }
  
            // if (actor.data.data.attributes.wits.visible == undefined) {
            //   actor.update({"data.attributes.wits.visible" : true});
            //   characterChanged = true;
            // }
  
            // if (actor.data.data.attributes.resolve.visible == undefined) {
            //   actor.update({"data.attributes.resolve.visible" : false});
            //   characterChanged = true;
            // }
  
            // // add appearance on existing sheets.
            // if (actor.data.data.attributes.appearance == undefined) {
            //   actor.update({"data.attributes.appearance.value" : 1,
            //         "data.attributes.appearance.bonus" : 0,
            //         "data.attributes.appearance.total" : 0,
            //         "data.attributes.appearance.max" : 5,
            //         "data.attributes.appearance.type" : "social",
            //         "data.attributes.appearance.label" : "wod.attributes.appearance",
            //         "data.attributes.appearance.speciality" : "",
            //         "data.attributes.appearance.visible" : true});
            //   characterChanged = true;
            // }
  
            // // add perception on existing sheets.
            // if (actor.data.data.attributes.perception == undefined) {
            //   actor.update({"data.attributes.perception.value" : 1,
            //         "data.attributes.perception.bonus" : 0,
            //         "data.attributes.perception.total" : 0,
            //         "data.attributes.perception.max" : 5,
            //         "data.attributes.perception.type" : "mental",
            //         "data.attributes.perception.label" : "wod.attributes.perception",
            //         "data.attributes.perception.speciality" : "",
            //         "data.attributes.perception.visible" : true});
            //   characterChanged = true;
            // }

            // set the default soak rules on existing sheets.
            // if (actor.data.data.settings.soak == undefined) {
            //   actor.update({"data.settings.soak.bashing.roll" : true,
            //         "data.settings.soak.lethal.roll" : false,
            //         "data.settings.soak.aggravated.roll" : false});
              
            //   characterChanged = true;
            // }

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