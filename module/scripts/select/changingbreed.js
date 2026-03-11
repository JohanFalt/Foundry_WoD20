/**
 * Changing Breed / Fera bio-tab option lists.
 *
 * Used when `data.type === CONFIG.worldofdarkness.sheettype.changingbreed` to override:
 * - `listData.BreedList`
 * - `listData.AuspiceList`
 * - `listData.TribeList`
 *
 * NOTE: Returned objects are intended for `{{selectOptions ... localize=false}}`.
 */

import { makeLocalizedOptionMap, selectPlaceholder } from "./utils.js";

export function getChangingBreedLists(changingbreed) {
  switch (changingbreed) {
    case "Ajaba":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.homid",
          "wod.bio.breedname.metis",
          "wod.bio.breedname.hyaenid"
        ]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.aspectname.dawn",
          "wod.bio.aspectname.midnight",
          "wod.bio.aspectname.dusk"
        ])
      };
    case "Ananasi":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.homid",
          "wod.bio.breedname.arachnid"
        ]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.aspectname.tenere",
          "wod.bio.aspectname.hatar",
          "wod.bio.aspectname.kumoti"
        ]),
        TribeList: makeLocalizedOptionMap([
          "wod.bio.factionname.myrmidon",
          "wod.bio.factionname.viskir",
          "wod.bio.factionname.wyrsta"
        ])
      };
    case "Apis":
      return {
        BreedList: makeLocalizedOptionMap(["wod.bio.breedname.homid", "wod.bio.breedname.bos"]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.auspicename.twilight",
          "wod.bio.auspicename.solar",
          "wod.bio.auspicename.lunar"
        ])
      };
    case "Bastet":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.homid",
          "wod.bio.breedname.metis",
          "wod.bio.breedname.feline"
        ]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.pryioname.daylight",
          "wod.bio.pryioname.twilight",
          "wod.bio.pryioname.night"
        ]),
        TribeList: makeLocalizedOptionMap([
          "wod.bio.tribename.bagheera",
          "wod.bio.tribename.balam",
          "wod.bio.tribename.bubasti",
          "wod.bio.tribename.ceilican",
          "wod.bio.tribename.khan",
          "wod.bio.tribename.pumonca",
          "wod.bio.tribename.qualmi",
          "wod.bio.tribename.simba",
          "wod.bio.tribename.swara"
        ])
      };
    case "Corax":
      return {
        BreedList: makeLocalizedOptionMap(["wod.bio.breedname.homid", "wod.bio.breedname.corvid"]),
        TribeList: makeLocalizedOptionMap([
          "wod.bio.tribename.chasers",
          "wod.bio.tribename.leshy",
          "wod.bio.tribename.swiftlight",
          "wod.bio.tribename.gulls",
          "wod.bio.tribename.morrigan",
          "wod.bio.tribename.gaughters",
          "wod.bio.tribename.sunlost",
          "wod.bio.tribename.tulugaq"
        ])
      };
    case "Grondr":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.homid",
          "wod.bio.breedname.metis",
          "wod.bio.breedname.scrofa"
        ])
      };
    case "Gurahl":
      return {
        BreedList: makeLocalizedOptionMap(["wod.bio.breedname.homid", "wod.bio.breedname.ursine"]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.auspicename.arcas",
          "wod.bio.auspicename.uzmati",
          "wod.bio.auspicename.kojubat",
          "wod.bio.auspicename.kieh",
          "wod.bio.auspicename.rishi"
        ]),
        TribeList: makeLocalizedOptionMap([
          "wod.bio.tribename.forestwalkers",
          "wod.bio.tribename.icestalkers",
          "wod.bio.tribename.mountainguardians",
          "wod.bio.tribename.riverkeepers"
        ])
      };
    case "Kitsune":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.kojin",
          "wod.bio.breedname.shinju",
          "wod.bio.breedname.roko"
        ]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.pathname.kataribe",
          "wod.bio.pathname.gukutsushi",
          "wod.bio.pathname.doshi",
          "wod.bio.pathname.eji"
        ])
      };
    case "Mokole":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.homid",
          "wod.bio.breedname.archid",
          "wod.bio.breedname.suchid"
        ]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.auspicename.risingsun",
          "wod.bio.auspicename.noondaysun",
          "wod.bio.auspicename.settingsun",
          "wod.bio.auspicename.shroudedsun",
          "wod.bio.auspicename.midnightsun",
          "wod.bio.auspicename.decoratedsun",
          "wod.bio.auspicename.eclipsedsun"
        ]),
        TribeList: makeLocalizedOptionMap([
          "wod.bio.varnaname.champsa",
          "wod.bio.varnaname.gharial",
          "wod.bio.varnaname.halpatee",
          "wod.bio.varnaname.karna",
          "wod.bio.varnaname.makara",
          "wod.bio.varnaname.ora",
          "wod.bio.varnaname.paisa",
          "wod.bio.varnaname.syrta",
          "wod.bio.varnaname.unktehi"
        ])
      };
    case "Nagah":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.balaram",
          "wod.bio.breedname.ahi",
          "wod.bio.breedname.vasuki"
        ]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.auspicename.kamakshi",
          "wod.bio.auspicename.kartikeya",
          "wod.bio.auspicename.kamsa",
          "wod.bio.auspicename.kali"
        ])
      };
    case "Nuwisha":
      return {
        BreedList: makeLocalizedOptionMap(["wod.bio.breedname.homid", "wod.bio.breedname.latrani"])
      };
    case "Ratkin":
      return {
        BreedList: makeLocalizedOptionMap([
          "wod.bio.breedname.homid",
          "wod.bio.breedname.metis",
          "wod.bio.breedname.rodens"
        ]),
        AuspiceList: makeLocalizedOptionMap([
          "wod.bio.aspectname.tunnelrunner",
          "wod.bio.aspectname.shadowseer",
          "wod.bio.aspectname.knifeskulker",
          "wod.bio.aspectname.warrior",
          "wod.bio.aspectname.engineers",
          "wod.bio.aspectname.plaguelords",
          "wod.bio.aspectname.munchmausen",
          "wod.bio.aspectname.twitchers"
        ])
      };
    case "Rokea":
      return {
        BreedList: makeLocalizedOptionMap(["wod.bio.breedname.homid", "wod.bio.breedname.squamus"]),
        AuspiceList: {
          "": selectPlaceholder("wod.labels.select"),
          Brightwaters: game.i18n.localize("wod.bio.auspicename.brightwaters"),
          Dimwater: game.i18n.localize("wod.bio.auspicename.dimwater"),
          Darkwater: game.i18n.localize("wod.bio.auspicename.darkwater")
        }
      };
    default:
      return {};
  }
}
























