/**
 * Demon bio-tab option lists (used by `templates/actor/parts/demon/bio_demon_background.html`).
 *
 * Exposes:
 * - `getDemonHouseList()` -> `listData.HouseList`
 * - `getDemonFactionList()` -> `listData.FactionList`
 */

import { makeLocalizedOptionMap } from "./utils.js";

export function getDemonHouseList() {
  return makeLocalizedOptionMap([
    "wod.bio.demon.defiler",
    "wod.bio.demon.devil",
    "wod.bio.demon.devourer",
    "wod.bio.demon.fiend",
    "wod.bio.demon.malefactor",
    "wod.bio.demon.scourge",
    "wod.bio.demon.slayer"
  ]);
}

export function getDemonFactionList() {
  return makeLocalizedOptionMap([
    "wod.bio.demon.faustian",
    "wod.bio.demon.cryptic",
    "wod.bio.demon.luciferan",
    "wod.bio.demon.ravener",
    "wod.bio.demon.reconciler"
  ]);
}
























