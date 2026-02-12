/**
 * Era-related option lists.
 *
 * - `getEraList()`: used by `listData.Era` (and `listData.WeaponEra` alias) in item/splat templates.
 * - `getWeaponConcealList(itemData)`: used by `listData.Conceal` in weapon templates.
 */

export function getEraList() {
  const eralist = [
    {
      value: "",
      label: `- ${game.i18n.localize("wod.labels.select")} -`
    }
  ];

  for (const eraKey in CONFIG.worldofdarkness.era) {
    const eraValue = CONFIG.worldofdarkness.era[eraKey]; // e.g. "wod.era.modern"
    eralist.push({
      value: eraKey,
      label: game.i18n.localize(eraValue)
    });
  }

  return eralist;
}

export function getWeaponConcealList(itemData) {
  const era = itemData?.system?.era ?? CONFIG.worldofdarkness.era.modern;
  const isDarkEra =
    era === CONFIG.worldofdarkness.era.darkages ||
    era === CONFIG.worldofdarkness.era.classical ||
    era === CONFIG.worldofdarkness.era.livinggods;

  const labels = isDarkEra
    ? {
        P: "wod.combat.weapon.conceal.pouch",
        J: "wod.combat.weapon.conceal.loose",
        T: "wod.combat.weapon.conceal.cloak",
        NA: "wod.combat.weapon.conceal.notbeconcealed"
      }
    : {
        P: "wod.combat.weapon.conceal.pocket",
        J: "wod.combat.weapon.conceal.jacket",
        T: "wod.combat.weapon.conceal.trenchcoat",
        NA: "wod.combat.weapon.conceal.na"
      };

  return [
    { value: "", label: `- ${game.i18n.localize("wod.labels.select")} -` },
    { value: "P", label: game.i18n.localize(labels.P) },
    { value: "J", label: game.i18n.localize(labels.J) },
    { value: "T", label: game.i18n.localize(labels.T) },
    { value: "NA", label: game.i18n.localize(labels.NA) }
  ];
}
























