/**
 * Hunter bio-tab option lists (used by `templates/actor/parts/hunter/bio_hunter_background.html`).
 *
 * Exposes:
 * - `getHunterCreedList()` -> `listData.CreedList`
 * - `getHunterPrimaryVirtueList()` -> `listData.PrimaryVirtueList`
 */

import { makeLocalizedOptionMap } from "./utils.js";

export function getHunterCreedList() {
  return makeLocalizedOptionMap([
    "wod.bio.hunter.avenger",
    "wod.bio.hunter.defender",
    "wod.bio.hunter.hermit",
    "wod.bio.hunter.innocent",
    "wod.bio.hunter.judge",
    "wod.bio.hunter.martyr",
    "wod.bio.hunter.redeemer",
    "wod.bio.hunter.visionary",
    "wod.bio.hunter.wayword"
  ]);
}

export function getHunterPrimaryVirtueList() {
  // No empty option here (matches previous template behavior).
  return makeLocalizedOptionMap(
    [
      "wod.advantages.virtue.mercy",
      "wod.advantages.virtue.vision",
      "wod.advantages.virtue.zeal"
    ],
    { includeEmpty: false }
  );
}
























