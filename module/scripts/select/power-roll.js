/**
 * Power roll selector lists used by `templates/sheets/parts/power_rollable.html`.
 *
 * Exposes:
 * - `getPowerDice1List(itemData)` -> `listData.Dice1List`
 * - `getPowerDice2List(itemData)` -> `listData.Dice2List`
 *
 * Returns arrays with optional `group` for optgroup support.
 */

import { selectPlaceholder } from "./utils.js";

export function getPowerDice1List(itemData) {
  const list = [
    {
      value: "",
      label: selectPlaceholder("wod.labels.power.noattribute")
    }
  ];

  const type = itemData?.system?.type;
  const actor = itemData?.actor;
  const attrSetting = CONFIG.worldofdarkness.attributeSettings;

  // Charms
  if (type === "wod.types.charm") {
    list.push({ value: "rage", label: game.i18n.localize("wod.advantages.rage") });
    list.push({ value: "gnosis", label: game.i18n.localize("wod.advantages.gnosis") });
    list.push({ value: "willpower", label: game.i18n.localize("wod.advantages.willpower") });
    return list;
  }

  // Attributes
  if (attrSetting === "5th") {
    for (const attribute in CONFIG.worldofdarkness.attributes) {
      list.push({
        value: attribute,
        label: game.i18n.localize(CONFIG.worldofdarkness.attributes[attribute])
      });
    }
  }
  if (attrSetting === "20th") {
    for (const attribute in CONFIG.worldofdarkness.attributes20) {
      list.push({
        value: attribute,
        label: game.i18n.localize(CONFIG.worldofdarkness.attributes20[attribute])
      });
    }
  }

  // Hekau Powers: allow abilities
  if (type === "wod.types.hekaupower") {
    list.push({
      value: "custom",
      label: selectPlaceholder("wod.labels.custom")
    });

    for (const ability in CONFIG.worldofdarkness.talents) {
      if (ability === "technology") continue;
      list.push({
        value: ability,
        label: game.i18n.localize(CONFIG.worldofdarkness.talents[ability]),
        group: game.i18n.localize("wod.abilities.talents")
      });
    }
    for (const ability in CONFIG.worldofdarkness.skills) {
      if (ability === "technology") continue;
      list.push({
        value: ability,
        label: game.i18n.localize(CONFIG.worldofdarkness.skills[ability]),
        group: game.i18n.localize("wod.abilities.skills")
      });
    }
    for (const ability in CONFIG.worldofdarkness.knowledges) {
      if (ability === "research") continue;
      list.push({
        value: ability,
        label: game.i18n.localize(CONFIG.worldofdarkness.knowledges[ability]),
        group: game.i18n.localize("wod.abilities.knowledges")
      });
    }
  }

  // Advantages
  const advGroup = game.i18n.localize("wod.advantages.advantages");
  list.push({
    value: "willpower",
    label: game.i18n.localize("wod.advantages.willpower"),
    group: advGroup
  });

  if (actor && type === "wod.types.othertraits") {
    if (actor.system?.settings?.hasrage)
      list.push({ value: "rage", label: game.i18n.localize("wod.advantages.rage"), group: advGroup });
    if (actor.system?.settings?.hasgnosis)
      list.push({ value: "gnosis", label: game.i18n.localize("wod.advantages.gnosis"), group: advGroup });
    if (actor.system?.settings?.hasglamour)
      list.push({ value: "glamour", label: game.i18n.localize("wod.advantages.glamour"), group: advGroup });
    if (actor.system?.settings?.hasglamour)
      list.push({ value: "glamour", label: game.i18n.localize("wod.advantages.mana"), group: advGroup });
    if (actor.system?.settings?.hasbanality)
      list.push({ value: "banality", label: game.i18n.localize("wod.advantages.banality"), group: advGroup });
    if (actor.system?.settings?.hasnightmare)
      list.push({ value: "nightmare", label: game.i18n.localize("wod.advantages.nightmare"), group: advGroup });
    if (actor.system?.settings?.hasfaith)
      list.push({ value: "faith", label: game.i18n.localize("wod.advantages.faith"), group: advGroup });
    if (actor.system?.settings?.hastorment)
      list.push({ value: "torment", label: game.i18n.localize("wod.advantages.torment"), group: advGroup });
    if (actor.type === CONFIG.worldofdarkness.sheettype.mage)
      list.push({ value: "arete", label: game.i18n.localize("wod.advantages.arete"), group: advGroup });

    if (actor.system?.settings?.haspath)
      list.push({ value: "path", label: game.i18n.localize("wod.advantages.path.headline"), group: advGroup });

    if (actor.system?.settings?.hasvirtue) {
      const virtueGroup = game.i18n.localize("wod.advantages.virtue.headline");
      list.push({ value: "conscience", label: game.i18n.localize("wod.advantages.virtue.conscience"), group: virtueGroup });
      list.push({ value: "conscience", label: game.i18n.localize("wod.advantages.virtue.conviction"), group: virtueGroup });
      list.push({ value: "selfcontrol", label: game.i18n.localize("wod.advantages.virtue.selfcontrol"), group: virtueGroup });
      list.push({ value: "selfcontrol", label: game.i18n.localize("wod.advantages.virtue.instinct"), group: virtueGroup });
      list.push({ value: "courage", label: game.i18n.localize("wod.advantages.virtue.courage"), group: virtueGroup });
    }
  }

  if (type === "wod.types.artpower" || type === "wod.types.power" || type === "wod.types.treasure") {
    list.push({ value: "glamour", label: game.i18n.localize("wod.advantages.glamour"), group: advGroup });
    list.push({ value: "glamour", label: game.i18n.localize("wod.advantages.mana"), group: advGroup });
    list.push({ value: "nightmare", label: game.i18n.localize("wod.advantages.nightmare"), group: advGroup });
    list.push({ value: "banality", label: game.i18n.localize("wod.advantages.banality"), group: advGroup });
  }

  if (type === "wod.types.device" || type === "wod.types.talisman" || type === "wod.types.trinket") {
    list.push({ value: "arete", label: game.i18n.localize("wod.advantages.arete"), group: advGroup });
  }

  if (type === "wod.types.gift" || type === "wod.types.rite" || type === "wod.types.power") {
    list.push({ value: "rage", label: game.i18n.localize("wod.advantages.rage"), group: advGroup });
    list.push({ value: "gnosis", label: game.i18n.localize("wod.advantages.gnosis"), group: advGroup });
  }

  if (type === "wod.types.shapeform") {
    list.push({ value: "essence", label: game.i18n.localize("wod.advantages.essence"), group: advGroup });
  }

  if (type === "wod.types.disciplinepower" /*|| type === "disciplinepathpower"*/ || type === "wod.types.power") {
    list.push({ value: "path", label: game.i18n.localize("wod.advantages.path.headline"), group: advGroup });

    const virtueGroup = game.i18n.localize("wod.advantages.virtue.headline");
    list.push({ value: "conscience", label: game.i18n.localize("wod.advantages.virtue.conscience"), group: virtueGroup });
    list.push({ value: "conscience", label: game.i18n.localize("wod.advantages.virtue.conviction"), group: virtueGroup });
    list.push({ value: "selfcontrol", label: game.i18n.localize("wod.advantages.virtue.selfcontrol"), group: virtueGroup });
    list.push({ value: "selfcontrol", label: game.i18n.localize("wod.advantages.virtue.instinct"), group: virtueGroup });
    list.push({ value: "courage", label: game.i18n.localize("wod.advantages.virtue.courage"), group: virtueGroup });
  }

  return list;
}

export function getPowerDice2List(itemData) {
  const list = [
    {
      value: "",
      label: selectPlaceholder("wod.labels.power.noability")
    }
  ];

  const type = itemData?.system?.type;
  const attrSetting = CONFIG.worldofdarkness.attributeSettings;

  // Charms do not use dice2
  if (type === "wod.types.charm") return list;

  list.push({ value: "custom", label: selectPlaceholder("wod.labels.custom") });

  for (const ability in CONFIG.worldofdarkness.talents) {
    list.push({
      value: ability,
      label: game.i18n.localize(CONFIG.worldofdarkness.talents[ability]),
      group: game.i18n.localize("wod.abilities.talents")
    });
  }
  for (const ability in CONFIG.worldofdarkness.skills) {
    if (ability === "technology") continue;
    list.push({
      value: ability,
      label: game.i18n.localize(CONFIG.worldofdarkness.skills[ability]),
      group: game.i18n.localize("wod.abilities.skills")
    });
  }
  for (const ability in CONFIG.worldofdarkness.knowledges) {
    if (ability === "research") continue;
    list.push({
      value: ability,
      label: game.i18n.localize(CONFIG.worldofdarkness.knowledges[ability]),
      group: game.i18n.localize("wod.abilities.knowledges")
    });
  }

  // Hunter virtues (for edges and some powers)
  if (type === "wod.types.edgepower" || type === "wod.types.power") {
    const virtueGroup = game.i18n.localize("wod.advantages.virtue.headline");
    list.push({ value: "mercy", label: game.i18n.localize("wod.advantages.virtue.mercy"), group: virtueGroup });
    list.push({ value: "vision", label: game.i18n.localize("wod.advantages.virtue.vision"), group: virtueGroup });
    list.push({ value: "zeal", label: game.i18n.localize("wod.advantages.virtue.zeal"), group: virtueGroup });
  }

  // Discipline powers can use attributes + path/virtues
  if (type === "wod.types.disciplinepower" /*|| type === "disciplinepathpower"*/ || type === "wod.types.power") {
    const attrGroup = game.i18n.localize("wod.attributes.attributes");

    if (attrSetting === "5th") {
      for (const attribute in CONFIG.worldofdarkness.attributes) {
        list.push({
          value: attribute,
          label: game.i18n.localize(CONFIG.worldofdarkness.attributes[attribute]),
          group: attrGroup
        });
      }
    }
    if (attrSetting === "20th") {
      for (const attribute in CONFIG.worldofdarkness.attributes20) {
        list.push({
          value: attribute,
          label: game.i18n.localize(CONFIG.worldofdarkness.attributes20[attribute]),
          group: attrGroup
        });
      }
    }

    list.push({ value: "path", label: game.i18n.localize("wod.advantages.path.headline") });

    const virtueGroup = game.i18n.localize("wod.advantages.virtue.headline");
    list.push({ value: "conscience", label: game.i18n.localize("wod.advantages.virtue.conscience"), group: virtueGroup });
    list.push({ value: "conscience", label: game.i18n.localize("wod.advantages.virtue.conviction"), group: virtueGroup });
    list.push({ value: "selfcontrol", label: game.i18n.localize("wod.advantages.virtue.selfcontrol"), group: virtueGroup });
    list.push({ value: "selfcontrol", label: game.i18n.localize("wod.advantages.virtue.instinct"), group: virtueGroup });
    list.push({ value: "courage", label: game.i18n.localize("wod.advantages.virtue.courage"), group: virtueGroup });
  }

  // keep `attrSetting` to preserve signature parity (even if not used beyond above)
  void attrSetting;
  return list;
}
























