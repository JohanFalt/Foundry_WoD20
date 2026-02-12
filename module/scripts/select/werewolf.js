/**
 * Werewolf bio-tab option lists (also used as defaults for Changing Breeds/Fera).
 *
 * Exposes:
 * - `getWerewolfBreeds()` / `getWerewolfBreedsv2()`
 * - `getWerewolfAuspices()` / `getWerewolfAuspicesv2()`
 * - `getWerewolfTribes(actor, isCharacter)`
 *
 * Notes:
 * - v1 lists are **option maps** (object) for `selectOptions` with `localize=false`.
 * - v2 lists are **option arrays** with `value/label` (and optional groups).
 */

export function getWerewolfBreeds() {
  let breedlist = {
    "": `- ${game.i18n.localize("wod.labels.select")} -`
  };

  breedlist = Object.assign(breedlist, {
    "wod.bio.breedname.homid": game.i18n.localize("wod.bio.breedname.homid"),
    "wod.bio.breedname.metis": game.i18n.localize("wod.bio.breedname.metis"),
    "wod.bio.breedname.lupus": game.i18n.localize("wod.bio.breedname.lupus")
  });

  return breedlist;
}

export function getWerewolfBreedsv2() {
  const breedlist = [];
  breedlist.push({
    value: "",
    label: `- ${game.i18n.localize("wod.labels.select")} -`
  });
  breedlist.push({ value: "wod.bio.breedname.homid", label: game.i18n.localize("wod.bio.breedname.homid") });
  breedlist.push({ value: "wod.bio.breedname.metis", label: game.i18n.localize("wod.bio.breedname.metis") });
  breedlist.push({ value: "wod.bio.breedname.lupus", label: game.i18n.localize("wod.bio.breedname.lupus") });
  return breedlist;
}

export function getWerewolfAuspices() {
  let auspicelist = {
    "": `- ${game.i18n.localize("wod.labels.select")} -`
  };

  auspicelist = Object.assign(auspicelist, {
    "wod.bio.auspicename.ragabash": game.i18n.localize("wod.bio.auspicename.ragabash"),
    "wod.bio.auspicename.theurge": game.i18n.localize("wod.bio.auspicename.theurge"),
    "wod.bio.auspicename.philodox": game.i18n.localize("wod.bio.auspicename.philodox"),
    "wod.bio.auspicename.galliard": game.i18n.localize("wod.bio.auspicename.galliard"),
    "wod.bio.auspicename.ahroun": game.i18n.localize("wod.bio.auspicename.ahroun")
  });

  return auspicelist;
}

export function getWerewolfAuspicesv2() {
  const auspicelist = [];
  auspicelist.push({
    value: "",
    label: `- ${game.i18n.localize("wod.labels.select")} -`
  });
  auspicelist.push({ value: "wod.bio.auspicename.ragabash", label: game.i18n.localize("wod.bio.auspicename.ragabash") });
  auspicelist.push({ value: "wod.bio.auspicename.theurge", label: game.i18n.localize("wod.bio.auspicename.theurge") });
  // Keep labels as in original implementation (note: philodox label historically referenced galliard in legacy code)
  auspicelist.push({ value: "wod.bio.auspicename.philodox", label: game.i18n.localize("wod.bio.auspicename.galliard") });
  auspicelist.push({ value: "wod.bio.auspicename.galliard", label: game.i18n.localize("wod.bio.auspicename.galliard") });
  auspicelist.push({ value: "wod.bio.auspicename.ahroun", label: game.i18n.localize("wod.bio.auspicename.ahroun") });
  return auspicelist;
}

export function getWerewolfTribes(actor, isCharacter) {
  let tribelist = {
    "": `- ${game.i18n.localize("wod.labels.select")} -`
  };

  if (isCharacter) {
    if (actor.system.tribe !== "custom") {
      tribelist = Object.assign(tribelist, { custom: game.i18n.localize("wod.labels.customtribe") });
    } else {
      tribelist = Object.assign(tribelist, { custom: actor.system.custom.tribe });
    }
  } else {
    tribelist = Object.assign(tribelist, { custom: game.i18n.localize("wod.labels.customtribe") });
  }

  for (const t in game.worldofdarkness.bio.tribe) {
    const id = game.worldofdarkness.bio.tribe[t];
    tribelist = Object.assign(tribelist, { [id]: game.i18n.localize(id) });
  }

  return tribelist;
}
























