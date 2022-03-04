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

  if (worldVersion !== currentVersion && worldVersion === '1' && game.user.isGM) {
    ui.notifications.info('New version detected; Updating World, please wait.');

    const updates = [];

    for (const a of game.actors) {
      //if (a.data.type !== 'character') continue
      //updates.push({ _id: a.id, type: 'vampire' })
    }

    //await Actor.updateDocuments(updates);
    game.settings.set('worldofdarkness', 'worldVersion', currentVersion);

    ui.notifications.info('World updated!');
  }
}
