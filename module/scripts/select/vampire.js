/**
 * Vampire bio-tab option lists.
 *
 * Exposes:
 * - `getVampireSects(actor, isCharacter)` -> `listData.SectList`
 * - `getVampireClans(actor, isCharacter)` -> `listData.ClanList`
 * - `getVampirePaths(actor, isCharacter)` -> `listData.PathList`
 *
 * Returned values are localized strings (templates use `localize=false`).
 */

export function getVampireSects(actor, isCharacter) {
  let sectlist = {
    "": `- ${game.i18n.localize("wod.labels.select")} -`
  };

  // Null-safe access for actor.system.sect and actor.system.custom
  const sect = actor?.system?.sect;
  const customSect = actor?.system?.custom?.sect;

  if (isCharacter) {
    if (!sect || sect !== "custom") {
      sectlist = Object.assign(sectlist, { custom: game.i18n.localize("wod.labels.customsect") });
    } else {
      sectlist = Object.assign(sectlist, {
        custom: customSect || game.i18n.localize("wod.labels.customsect")
      });
    }
  } else {
    sectlist = Object.assign(sectlist, { custom: game.i18n.localize("wod.labels.customsect") });
  }

  for (const s in game.worldofdarkness.bio.sect) {
    const id = game.worldofdarkness.bio.sect[s];
    sectlist = Object.assign(sectlist, { [id]: game.i18n.localize(id) });
  }

  return sectlist;
}

export function getVampireClans(actor, isCharacter) {
  let clanlist = {
    "": `- ${game.i18n.localize("wod.labels.select")} -`
  };

  // Null-safe access for actor.system.clan and actor.system.custom
  const clan = actor?.system?.clan;
  const customClan = actor?.system?.custom?.clan;

  if (isCharacter) {
    if (!clan || clan !== "custom") {
      clanlist = Object.assign(clanlist, { custom: game.i18n.localize("wod.labels.customclan") });
    } else {
      clanlist = Object.assign(clanlist, {
        custom: customClan || game.i18n.localize("wod.labels.customclan")
      });
    }
  } else {
    clanlist = Object.assign(clanlist, { custom: game.i18n.localize("wod.labels.customclan") });
  }

  for (const c in game.worldofdarkness.bio.clan) {
    const id = game.worldofdarkness.bio.clan[c];
    clanlist = Object.assign(clanlist, { [id]: game.i18n.localize(id) });
  }

  return clanlist;
}

export function getVampirePaths(actor, isCharacter) {
  let pathlist = {
    "": `- ${game.i18n.localize("wod.labels.select")} -`
  };

  // Null-safe access for actor.system.advantages.path
  const pathData = actor?.system?.advantages?.path;
  const customPath = pathData?.custom;

  if (isCharacter) {
    if (!customPath || customPath === "") {
      pathlist = Object.assign(pathlist, { custom: game.i18n.localize("wod.labels.custompath") });
    } else {
      pathlist = Object.assign(pathlist, { custom: customPath });
    }
  } else {
    pathlist = Object.assign(pathlist, {
      custom: customPath || game.i18n.localize("wod.labels.custompath")
    });
  }

  for (const p in game.worldofdarkness.bio.path) {
    const id = game.worldofdarkness.bio.path[p];
    pathlist = Object.assign(pathlist, { [id]: game.i18n.localize(id) });
  }

  return pathlist;
}
























