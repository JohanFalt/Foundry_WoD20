let worldVersion
let characterChanged = false;

export const migrations = async () => {
  const currentVersion = game.data.system.data.version;

  try {
    worldVersion = game.settings.get('worldofdarkness', 'worldVersion');
  } 
  catch (e) {
    worldVersion = '1';
  }

  console.log('WoD | Current world version: ' + worldVersion);
  console.log('WoD | Getting version: ' + currentVersion);

  if ((worldVersion !== currentVersion || worldVersion === '1') && game.user.isGM) {
    ui.notifications.info('New version detected; Updating World, please wait.');
    
    for (const actor of game.actors) {
      for (const item of actor.items) {
        if (item.data.data.version == undefined) {
          item.update({"data.version" : currentVersion});

          if (currentVersion == "1.0.7") {
            if (item.data.type == "Experience") {
              if (item.data.data.type == "wod.types.expgained") {
                item.update({"data.description" : item.name});
                characterChanged = true;
              }
            }          
          }
        }        
      }

      if (actor.data.data.attributes != undefined) {
        if (currentVersion == "1.0.9") {
          if (actor.data.data.attributes.strength.bonus == undefined) {
            actor.update({"data.attributes.strength.bonus" : 0});
            characterChanged = true;
          }   

          if (actor.data.data.attributes.dexterity.bonus == undefined) {
            actor.update({"data.attributes.dexterity.bonus" : 0});
            characterChanged = true;
          }  

          if (actor.data.data.attributes.stamina.bonus == undefined) {
            actor.update({"data.attributes.stamina.bonus" : 0});
            characterChanged = true;
          }

          if (actor.data.data.attributes.charisma.bonus == undefined) {
            actor.update({"data.attributes.charisma.bonus" : 0});
            characterChanged = true;
          }

          if (actor.data.data.attributes.manipulation.bonus == undefined) {
            actor.update({"data.attributes.manipulation.bonus" : 0});
            characterChanged = true;
          }

          if (actor.data.data.attributes.composure.bonus == undefined) {
            actor.update({"data.attributes.composure.bonus" : 0});
            characterChanged = true;
          }

          if (actor.data.data.attributes.intelligence.bonus == undefined) {
            actor.update({"data.attributes.intelligence.bonus" : 0});
            characterChanged = true;
          }

          if (actor.data.data.attributes.wits.bonus == undefined) {
            actor.update({"data.attributes.wits.bonus" : 0});
            characterChanged = true;
          }

          if (actor.data.data.attributes.resolve.bonus == undefined) {
            actor.update({"data.attributes.resolve.bonus" : 0});
            characterChanged = true;
          }
        }
      }
    }

    game.settings.set('worldofdarkness', 'worldVersion', currentVersion);

    if (characterChanged) {
      ui.notifications.info('Characters updated!');    
    }
    
    ui.notifications.info('World updated!');
  }
}
