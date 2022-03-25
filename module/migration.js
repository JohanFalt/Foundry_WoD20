let worldVersion

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
              }
            }          
          }
        }        
      }
    }

    game.settings.set('worldofdarkness', 'worldVersion', currentVersion);

    ui.notifications.info('World updated!');
  }
}
