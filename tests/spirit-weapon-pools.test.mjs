import assert from "node:assert/strict";
import test from "node:test";
import SelectHelper from "../module/scripts/select-helpers.js";

globalThis.FormApplication = class {};
globalThis.foundry = { applications: { api: {
    ApplicationV2: class {
        constructor() { this.options = { window: {} }; }
        async _prepareContext() { return {}; }
    },
    HandlebarsApplicationMixin: base => base
} } };
globalThis.game = { i18n: { localize: key => key } };
globalThis.CONFIG = { worldofdarkness: {
    attributeSettings: "20th", attributes20: { strength: "Strength" },
    advantages: { rage: "Rage", willpower: "Willpower" },
    era: { modern: "wod.era.modern" }, sheettype: {}, splat: {}, damageTypes: {}
} };
const { DialogWeaponV2 } = await import("../module/dialogs/dialog-weaponv2.js");

const spirit = { type: "Creature", items: [], system: {
    settings: { variant: "spirit" },
    attributes: { strength: { value: 4, total: 4, label: "Strength" } },
    advantages: {
        rage: { roll: 3, permanent: 5, label: "Rage" },
        willpower: { roll: 6, permanent: 8, label: "Willpower" }
    }
} };

function weapon(actor, type = "Melee Weapon", isnatural = false) {
    return { actor, type, system: {
        isnatural, attack: { attribute: "rage", isrollable: true },
        damage: { attribute: "strength", isrollable: true }
    } };
}

for (const natural of [true, false]) {
    test(natural ? "natural Spirit attack" : "melee Spirit attack", async () => {
        const item = weapon(spirit, "Melee Weapon", natural);
        const lists = SelectHelper.SetupItem(item);
        assert.deepEqual(lists.AttackAttributes.map(o => o.value), ["", "strength", "rage", "willpower"]);
        assert.deepEqual(lists.DamageAttribute.map(o => o.value), ["", "strength"]);
        for (const [key, expected, label] of [["rage", 3, "Rage"], ["willpower", 6, "Willpower"]]) {
            item.system.attack.attribute = key;
            const attack = await new DialogWeaponV2(spirit, item, "attack")._prepareContext();
            assert.equal(attack.object.attributeValue, expected);
            assert.equal(attack.object.attributeName, label);
            const damage = await new DialogWeaponV2(spirit, item, "damage")._prepareContext();
            assert.equal(damage.object.attributeValue, 4);
        }
    });
}

test("other owners, unowned weapons and Spirit ranged weapons keep the standard choices", () => {
    for (const item of [weapon(null), weapon({ ...spirit, type: "PC" }),
        weapon({ ...spirit, system: { ...spirit.system, settings: { variant: "general" } } }),
        weapon(spirit, "Ranged Weapon")]) {
        const lists = SelectHelper.SetupItem(item);
        assert.deepEqual(lists.AttackAttributes, lists.DamageAttribute);
        assert.deepEqual(lists.AttackAttributes.map(o => o.value), ["", "strength"]);
    }
});
