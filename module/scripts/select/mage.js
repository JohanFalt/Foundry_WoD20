/**
 * Mage bio-tab option lists.
 *
 * Exposes:
 * - `getMageAffiliations(actor, isCharacter)` -> `listData.AffiliationList`
 * - `getMageSects(actor, isCharacter)` -> `listData.MageSectList`
 */

export function getMageAffiliations(actor, isCharacter) {
  let affiliationlist = {
    "": `- ${game.i18n.localize("wod.labels.select")} -`
  };

  if (isCharacter) {
    if (actor.system.affiliation !== "custom") {
      affiliationlist = Object.assign(affiliationlist, { custom: game.i18n.localize("wod.labels.customaffiliation") });
    } else {
      affiliationlist = Object.assign(affiliationlist, { custom: actor.system.custom.affiliation });
    }
  } else {
    affiliationlist = Object.assign(affiliationlist, { custom: game.i18n.localize("wod.labels.customaffiliation") });
  }

  for (const a in game.worldofdarkness.bio.affiliation) {
    const id = game.worldofdarkness.bio.affiliation[a];
    affiliationlist = Object.assign(affiliationlist, { [id]: game.i18n.localize(id) });
  }

  return affiliationlist;
}

export function getMageSects(actor, isCharacter) {
  const sectlist = [];

  // Add empty option
  sectlist.push({
    value: "",
    label: `- ${game.i18n.localize("wod.labels.select")} -`
  });

  // Add custom option
  if (isCharacter) {
    if (actor.system.sect !== "custom") {
      sectlist.push({ value: "custom", label: game.i18n.localize("wod.labels.customsect") });
    } else {
      sectlist.push({ value: "custom", label: actor.system.custom.sect });
    }
  } else {
    sectlist.push({ value: "custom", label: game.i18n.localize("wod.labels.customsect") });
  }

  // Add grouped sects (tradition/technocracy/disparate/fallen/mad)
  const bio = game.worldofdarkness.bio.magesect;
  const pushGroup = (groupKey, groupLabelKey) => {
    const groupObj = bio?.[groupKey];
    if (!groupObj) return;
    for (const s in groupObj) {
      const id = groupObj[s];
      sectlist.push({
        value: id,
        label: game.i18n.localize(id),
        group: game.i18n.localize(groupLabelKey)
      });
    }
  };

  pushGroup("tradition", "wod.bio.mage.tradition");
  pushGroup("technocracy", "wod.bio.mage.technocracy");
  pushGroup("disparate", "wod.bio.mage.disparate");
  pushGroup("fallen", "wod.bio.mage.fallen");
  pushGroup("mad", "wod.bio.mage.mad");

  return sectlist;
}
























