/**
 * Changeling bio-tab option lists (used by `templates/actor/parts/changeling/bio_changeling_background.html`).
 *
 * Exposes:
 * - `getChangelingSeemingList()`  -> `listData.SeemingList`
 * - `getChangelingCourtList()`    -> `listData.CourtList`
 * - `getChangelingKithList(actorData)` -> `listData.KithList`
 * - `getChangelingAffinityRealmList(actorData)` -> `listData.AffinityRealmList`
 */

import { makeLocalizedOptionMap, selectPlaceholder } from "./utils.js";

export function getChangelingSeemingList() {
  return makeLocalizedOptionMap([
    "wod.bio.changeling.childling",
    "wod.bio.changeling.wilder",
    "wod.bio.changeling.grump"
  ]);
}

export function getChangelingCourtList() {
  return makeLocalizedOptionMap([
    "wod.bio.changeling.seelie",
    "wod.bio.changeling.unseelie"
  ]);
}

export function getChangelingKithList(actorData) {
  const variant = actorData?.system?.settings?.variant;
  const customValue = actorData?.system?.custom?.kith ?? "";
  const allowCustom = variant !== "inanimae" && variant !== "darkkin";

  const map = { "": selectPlaceholder("wod.labels.select") };

  if (allowCustom) {
    map["custom"] =
      customValue === ""
        ? selectPlaceholder("wod.labels.customkith")
        : `${customValue} (${game.i18n.localize("wod.labels.customkith")})`;
  }

  const list = game?.worldofdarkness?.bio?.kith?.[variant];
  if (Array.isArray(list)) {
    for (const kith of list) map[kith] = game.i18n.localize(kith);
  } else if (list && typeof list === "object") {
    for (const kith of Object.values(list)) map[kith] = game.i18n.localize(kith);
  }

  return map;
}

export function getChangelingAffinityRealmList(actorData) {
  const map = { "": selectPlaceholder("wod.labels.select") };

  // Prefer deriving from actor Trait items (avoids ordering issues in legacy sheet getData).
  const items = actorData?.items;
  if (items && typeof items[Symbol.iterator] === "function") {
    for (const i of items) {
      if (i?.type === "Trait" && i?.system?.type === "wod.types.realms" && i?.system?.label) {
        map[i.system.label] = game.i18n.localize(i.system.label);
      }
    }
    return map;
  }

  // Fallback: use precomputed listdata if present.
  const realms = actorData?.system?.listdata?.powers?.arts?.realms;
  if (Array.isArray(realms)) {
    for (const realm of realms) {
      if (realm?.label) map[realm.label] = game.i18n.localize(realm.label);
    }
  }

  return map;
}
























