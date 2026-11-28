import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";
import { createBonus, createPcActor } from "./helpers/fake-actor.mjs";

installFoundryEnv();
const { default: BonusHelper } = await import("../module/scripts/bonus-helpers.js");

/** An item that carries bonuses in its own bonuslist, for example a Power or Trait. */
function itemWithBonuses(bonuslist) {
    return { _id: "host", type: "Power", name: "Host", system: { bonuslist } };
}

function entry(type, value, { isactive = true, settingtype = "" } = {}) {
    return { type, value, isactive, settingtype };
}

function actorWith(...items) {
    return createPcActor({ items });
}

test("an active attribute buff is found for its attribute and not for others", async () => {
    const actor = actorWith(createBonus({ type: "attribute_buff", value: 1, settingtype: "strength" }));

    assert.equal(await BonusHelper.CheckAttributeBuff(actor, "strength"), true);
    assert.equal(await BonusHelper.CheckAttributeBuff(actor, "dexterity"), false);
});

test("attribute buffs nested in another item's bonuslist count only when active", async () => {
    const active = actorWith(itemWithBonuses([entry("attribute_buff", 2, { settingtype: "stamina" })]));
    const inactive = actorWith(itemWithBonuses([entry("attribute_buff", 2, { isactive: false, settingtype: "stamina" })]));

    assert.equal(await BonusHelper.CheckAttributeBuff(active, "stamina"), true);
    assert.equal(await BonusHelper.CheckAttributeBuff(inactive, "stamina"), false);
});

test("attribute buff totals sum active buffs from items and bonus lists", async () => {
    const actor = actorWith(
        createBonus({ type: "attribute_buff", value: 2, settingtype: "dexterity" }),
        createBonus({ type: "attribute_buff", value: 1, isactive: false, settingtype: "dexterity" }),
        createBonus({ type: "attribute_buff", value: 3, settingtype: "strength" }),
        itemWithBonuses([entry("attribute_buff", "2", { settingtype: "dexterity" })])
    );

    assert.equal(await BonusHelper.GetAttributeBuff(actor, "dexterity"), 4);
    assert.equal(await BonusHelper.GetAttributeBuff(actor, "strength"), 3);
    assert.equal(await BonusHelper.GetAttributeBuff(actor, "stamina"), 0);
});

test("an empty attribute name matches nothing", async () => {
    const actor = actorWith(createBonus({ type: "attribute_buff", value: 2, settingtype: "" }));

    assert.equal(await BonusHelper.CheckAttributeBuff(actor, ""), false);
    assert.equal(await BonusHelper.GetAttributeBuff(actor, ""), 0);
});

test("attribute difference bonuses are tracked separately from attribute buffs", async () => {
    const actor = actorWith(createBonus({ type: "attribute_diff", value: -1, settingtype: "wits" }));

    assert.equal(await BonusHelper.CheckAttributeBonus(actor, "wits"), true);
    assert.equal(await BonusHelper.GetAttributeBonus(actor, "wits"), -1);
    assert.equal(await BonusHelper.CheckAttributeBuff(actor, "wits"), false);
    assert.equal(await BonusHelper.GetAttributeBuff(actor, "wits"), 0);
});

test("a fixed attribute value is returned as stored", async () => {
    const actor = actorWith(createBonus({ type: "attribute_fixed_value", value: 5, settingtype: "stamina" }));

    assert.equal(await BonusHelper.CheckAttributeFixedValue(actor, "stamina"), true);
    assert.equal(await BonusHelper.GetFixedAttributeBuff(actor, "stamina"), 5);
    assert.equal(await BonusHelper.CheckAttributeFixedValue(actor, "dexterity"), false);
});

test("a soak buff for a damage type matches only that type, and an 'all' buff matches only 'all' queries", () => {
    assert.equal(BonusHelper.matchesSoakBuffSetting("lethal", "lethal"), true);
    assert.equal(BonusHelper.matchesSoakBuffSetting("lethal", "bashing"), false);
    assert.equal(BonusHelper.matchesSoakBuffSetting("all", "all"), true);
    assert.equal(BonusHelper.matchesSoakBuffSetting("all", "bashing"), false);
});

test("a legacy empty soak setting counts as 'all'", () => {
    assert.equal(BonusHelper.matchesSoakBuffSetting("", "all"), true);
    assert.equal(BonusHelper.matchesSoakBuffSetting("", ""), true);
    assert.equal(BonusHelper.matchesSoakBuffSetting("", "lethal"), false);
});

test("soak buff totals include the matching damage type and exclude others", async () => {
    const actor = actorWith(
        createBonus({ type: "soak_buff", value: 1, settingtype: "all" }),
        createBonus({ type: "soak_buff", value: 2, settingtype: "lethal" }),
        itemWithBonuses([entry("soak_buff", 3, { settingtype: "lethal" })])
    );

    assert.equal(await BonusHelper.GetSoakBuff(actor, "lethal"), 5);
    assert.equal(await BonusHelper.GetSoakBuff(actor, "bashing"), 0);
    assert.equal(await BonusHelper.GetSoakBuff(actor, "all"), 1);
    assert.equal(await BonusHelper.GetSoakBuff(actor, ""), 1);
});

test("a soak buff is reported only while it is active", async () => {
    const active = actorWith(createBonus({ type: "soak_buff", value: 1, settingtype: "all" }));
    const inactive = actorWith(createBonus({ type: "soak_buff", value: 1, isactive: false, settingtype: "all" }));

    assert.equal(await BonusHelper.CheckSoakBuff(active), true);
    assert.equal(await BonusHelper.CheckSoakBuff(inactive), false);
});

test("initiative buffs sum active buffs, including those in a bonus list", async () => {
    const actor = actorWith(
        createBonus({ type: "initiative_buff", value: 2 }),
        itemWithBonuses([entry("initiative_buff", 1)]),
        createBonus({ type: "initiative_buff", value: 5, isactive: false })
    );

    assert.equal(await BonusHelper.CheckInitiativeBuff(actor), true);
    assert.equal(await BonusHelper.GetInitiativeBuff(actor), 3);
});

test("health level buffs apply to the named level only", async () => {
    const actor = actorWith(
        createBonus({ type: "health_buff", value: 1, settingtype: "injured" }),
        itemWithBonuses([entry("health_buff", 2, { settingtype: "injured" }), entry("health_buff", 4, { settingtype: "hurt" })])
    );

    assert.equal(await BonusHelper.GetHealthlevelsBuff(actor, "injured"), 3);
    assert.equal(await BonusHelper.GetHealthlevelsBuff(actor, "hurt"), 4);
    assert.equal(await BonusHelper.GetHealthlevelsBuff(actor, "bruised"), 0);
});

test("movement buffs are reported per movement type and sum active values", async () => {
    const actor = actorWith(
        createBonus({ type: "movement_buff", value: 2, settingtype: "run" }),
        itemWithBonuses([entry("movement_buff", 1, { settingtype: "walk" })])
    );

    assert.equal(await BonusHelper.CheckMovementBuff(actor, "run"), true);
    assert.equal(await BonusHelper.GetMovementBuff(actor, "run"), 2);
    assert.equal(await BonusHelper.CheckMovementBuff(actor, "walk"), true);
    assert.equal(await BonusHelper.CheckMovementBuff(actor, "jog"), false);
});

test("an item with a missing bonus list is skipped without error", async () => {
    const actor = actorWith({ _id: "plain", type: "Trait", name: "Plain", system: {} });

    assert.equal(await BonusHelper.CheckAttributeBuff(actor, "strength"), false);
    assert.equal(await BonusHelper.GetAttributeBuff(actor, "strength"), 0);
});

test("CreateAttributeBuff builds an attribute buff item with the given value and state", async () => {
    const item = await BonusHelper.CreateAttributeBuff("parent", "Strength bonus", "strength", 2, true, "7.4.0");

    assert.equal(item.type, "Bonus");
    assert.equal(item.name, "Strength bonus");
    assert.equal(item.system.type, "attribute_buff");
    assert.equal(item.system.settingtype, "strength");
    assert.equal(item.system.value, 2);
    assert.equal(item.system.isactive, true);
    assert.equal(item.system.parentid, "parent");
});
