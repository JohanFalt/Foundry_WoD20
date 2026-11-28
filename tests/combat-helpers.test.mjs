import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";
import { createPcActor, createBonus, actorDocument, WOUND_LEVELS } from "./helpers/fake-actor.mjs";

installFoundryEnv();
const { default: CombatHelper } = await import("../module/scripts/combat-helpers.js");

function track(overrides = {}) {
    const health = createPcActor().system.health;
    for (const [level, total] of Object.entries(overrides)) {
        health[level].total = total;
    }
    return { health };
}

test("max health levels sum every wound level's total", () => {
    assert.equal(CombatHelper.GetMaxHealthLevels(createPcActor().system), WOUND_LEVELS.length);
    assert.equal(CombatHelper.GetMaxHealthLevels(track({ hurt: 3 })), WOUND_LEVELS.length + 2);
});

test("max health levels treat missing or non-numeric totals as zero", () => {
    const system = track({ bruised: "many" });
    delete system.health.hurt;
    assert.equal(CombatHelper.GetMaxHealthLevels(system), WOUND_LEVELS.length - 2);
    assert.equal(CombatHelper.GetMaxHealthLevels(undefined), 0);
});

test("applicable capacity: bashing can fill empty boxes and then upgrade every bashing box", () => {
    const empty = { bashing: 0, lethal: 0, aggravated: 0 };
    assert.equal(CombatHelper.GetApplicableDamageCapacity(empty, "bashing", 7), 14);
    assert.equal(CombatHelper.GetApplicableDamageCapacity({ bashing: 2, lethal: 3, aggravated: 0 }, "bashing", 7), 6);
});

test("applicable capacity: lethal only fills empty boxes", () => {
    assert.equal(CombatHelper.GetApplicableDamageCapacity({ bashing: 0, lethal: 0, aggravated: 0 }, "lethal", 7), 7);
    assert.equal(CombatHelper.GetApplicableDamageCapacity({ bashing: 4, lethal: 3, aggravated: 0 }, "lethal", 7), 0);
});

test("applicable capacity: aggravated fills empty boxes and converts lethal and bashing", () => {
    assert.equal(CombatHelper.GetApplicableDamageCapacity({ bashing: 3, lethal: 2, aggravated: 0 }, "aggravated", 7), 7);
    assert.equal(CombatHelper.GetApplicableDamageCapacity({ bashing: 0, lethal: 7, aggravated: 0 }, "aggravated", 7), 7);
});

test("applicable capacity treats missing or non-numeric input as empty", () => {
    assert.equal(CombatHelper.GetApplicableDamageCapacity(undefined, "bashing", 7), 14);
    assert.equal(CombatHelper.GetApplicableDamageCapacity({ bashing: "x" }, "lethal", "x"), 0);
    assert.equal(CombatHelper.GetApplicableDamageCapacity({ bashing: 7, lethal: 0, aggravated: 0 }, "lethal", 7), 0);
});

test("applying bashing fills empty boxes first, then upgrades bashing to lethal", () => {
    const damage = { bashing: 5, lethal: 0, aggravated: 0 };
    const applied = CombatHelper.ApplyDamageWithOverflow(damage, "bashing", 4, 7);

    assert.equal(applied, 4);
    assert.deepEqual(damage, { bashing: 5, lethal: 2, aggravated: 0 });
});

test("applying lethal only fills empty boxes and discards overflow", () => {
    const damage = { bashing: 0, lethal: 5, aggravated: 0 };
    assert.equal(CombatHelper.ApplyDamageWithOverflow(damage, "lethal", 3, 7), 2);
    assert.deepEqual(damage, { bashing: 0, lethal: 7, aggravated: 0 });

    const full = { bashing: 0, lethal: 7, aggravated: 0 };
    assert.equal(CombatHelper.ApplyDamageWithOverflow(full, "lethal", 2, 7), 0);
    assert.deepEqual(full, { bashing: 0, lethal: 7, aggravated: 0 });
});

test("applying aggravated fills empty boxes, then converts lethal before bashing", () => {
    const damage = { bashing: 2, lethal: 3, aggravated: 0 };
    assert.equal(CombatHelper.ApplyDamageWithOverflow(damage, "aggravated", 3, 7), 3);
    assert.deepEqual(damage, { bashing: 2, lethal: 2, aggravated: 3 });
});

test("applying aggravated to a full track converts lethal, then bashing", () => {
    const damage = { bashing: 4, lethal: 3, aggravated: 0 };
    assert.equal(CombatHelper.ApplyDamageWithOverflow(damage, "aggravated", 5, 7), 5);
    assert.deepEqual(damage, { bashing: 2, lethal: 0, aggravated: 5 });
});

test("applying zero damage, or to a track with no boxes, changes nothing", () => {
    const damage = { bashing: 1, lethal: 1, aggravated: 0 };
    assert.equal(CombatHelper.ApplyDamageWithOverflow(damage, "lethal", 0, 7), 0);
    assert.equal(CombatHelper.ApplyDamageWithOverflow(damage, "lethal", 3, 0), 0);
    assert.deepEqual(damage, { bashing: 1, lethal: 1, aggravated: 0 });
});

test("applied damage never exceeds the boxes that exist", () => {
    for (const type of ["bashing", "lethal", "aggravated"]) {
        const damage = { bashing: 3, lethal: 2, aggravated: 1 };
        const applied = CombatHelper.ApplyDamageWithOverflow(damage, type, 20, 7);
        const total = damage.bashing + damage.lethal + damage.aggravated;
        assert.ok(total <= 7, `${type} left ${total} boxes on a 7-box track`);
        assert.ok(applied >= 0);
    }
});

test("ignoring pain depends on the pain or frenzy condition", () => {
    const actor = createPcActor();
    assert.equal(CombatHelper.ignoresPain(actor), false);

    actor.system.conditions.isignoringpain = true;
    assert.equal(CombatHelper.ignoresPain(actor), true);

    actor.system.conditions = { isfrenzy: true };
    assert.equal(CombatHelper.ignoresPain(actor), true);
});

test("movement uses Dexterity for jog and run and the fixed walk speed", async () => {
    const actor = actorDocument(createPcActor());
    actor.system.attributes.dexterity.total = 3;

    const movement = await CombatHelper.CalculateMovement(actor);
    assert.deepEqual(movement, { walk: 7, jog: 15, run: 29, vjump: 2, hjump: 4, fly: 0 });
});

test("an active movement buff multiplies the matching movement type only", async () => {
    const actor = actorDocument(createPcActor({
        items: [createBonus({ type: "movement_buff", value: 2, settingtype: "run" })]
    }));
    actor.system.attributes.dexterity.total = 3;

    const movement = await CombatHelper.CalculateMovement(actor);
    assert.equal(movement.run, 58);
    assert.equal(movement.jog, 15);
    assert.equal(movement.walk, 7);
});

test("an inactive movement buff is ignored", async () => {
    const actor = actorDocument(createPcActor({
        items: [createBonus({ type: "movement_buff", value: 2, isactive: false, settingtype: "walk" })]
    }));

    const movement = await CombatHelper.CalculateMovement(actor);
    assert.equal(movement.walk, 7);
});
