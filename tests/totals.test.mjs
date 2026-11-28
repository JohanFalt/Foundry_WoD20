import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";
import { createPcActor, createBonus, WOUND_LEVELS } from "./helpers/fake-actor.mjs";

installFoundryEnv();
const { calculateTotals } = await import("../module/scripts/totals.js");

/**
 * Runs calculateTotals on a copy of the actor, the way the sheet does with
 * foundry.utils.duplicate(). The actor is also registered with game.actors so
 * the lookups that use the live document (for example equipped armor) resolve.
 */
async function totalsFor(actor) {
    installFoundryEnv({ actors: [actor] });
    return calculateTotals(structuredClone(actor));
}

function withItems(items, overrides = {}) {
    return createPcActor({ items, ...overrides });
}

function armor({ isequipped = true, bashing = 0, lethal = 0, aggravated = 0, dexpenalty = 0 }) {
    return {
        _id: "armor-1",
        type: "Armor",
        name: "Armor",
        system: {
            isequipped,
            dexpenalty,
            soak: { bashing, lethal, aggravated }
        }
    };
}

test("attribute totals add the base value and the attribute bonus", async () => {
    const actor = createPcActor({ system: { attributes: { strength: { value: 3, bonus: 1 } } } });

    const result = await totalsFor(actor);

    assert.equal(result.system.attributes.strength.total, 4);
    assert.equal(result.system.attributes.dexterity.total, 2);
});

test("an active attribute buff adds to its attribute only", async () => {
    const actor = withItems([createBonus({ type: "attribute_buff", value: 2, settingtype: "dexterity" })]);

    const result = await totalsFor(actor);

    assert.equal(result.system.attributes.dexterity.total, 4);
    assert.equal(result.system.attributes.strength.total, 2);
});

test("an inactive attribute buff has no effect", async () => {
    const actor = withItems([createBonus({ type: "attribute_buff", value: 2, isactive: false, settingtype: "dexterity" })]);

    const result = await totalsFor(actor);

    assert.equal(result.system.attributes.dexterity.total, 2);
});

test("a fixed attribute value replaces the calculated total", async () => {
    const actor = withItems(
        [createBonus({ type: "attribute_fixed_value", value: 5, settingtype: "stamina" })],
        { system: { attributes: { stamina: { value: 2, bonus: 1 } } } }
    );

    const result = await totalsFor(actor);

    assert.equal(result.system.attributes.stamina.total, 5);
});

test("health level buffs add to the boxes on that level", async () => {
    const actor = withItems([createBonus({ type: "health_buff", value: 1, settingtype: "bruised" })]);

    const result = await totalsFor(actor);

    assert.equal(result.system.health.bruised.total, 2);
    assert.equal(result.system.health.hurt.total, 1);
});

test("soak is the Stamina rating for rollable damage types, plus soak buffs", async () => {
    const actor = withItems(
        [createBonus({ type: "soak_buff", value: 1, settingtype: "all" })],
        { system: { attributes: { stamina: { value: 3 } } } }
    );

    const result = await totalsFor(actor);

    // Bashing is rollable (Stamina), lethal and aggravated are not. The "all" buff applies to every type.
    assert.equal(result.system.soak.bashing, 4);
    assert.equal(result.system.soak.lethal, 1);
    assert.equal(result.system.soak.aggravated, 1);
});

test("a soak buff for one damage type leaves the other types unchanged", async () => {
    const actor = withItems(
        [createBonus({ type: "soak_buff", value: 2, settingtype: "lethal" })],
        { system: { attributes: { stamina: { value: 3 } } } }
    );

    const result = await totalsFor(actor);

    assert.equal(result.system.soak.bashing, 3);
    assert.equal(result.system.soak.lethal, 2);
    assert.equal(result.system.soak.aggravated, 0);
});

test("equipped armor adds soak and its Dexterity penalty; unequipped armor is ignored", async () => {
    const equipped = withItems(
        [armor({ bashing: 1, lethal: 2, dexpenalty: -1 })],
        { system: { attributes: { stamina: { value: 3 } } } }
    );
    const worn = await totalsFor(equipped);

    assert.equal(worn.system.attributes.dexterity.total, 1);
    assert.equal(worn.system.soak.bashing, 4);
    assert.equal(worn.system.soak.lethal, 2);

    const stored = withItems(
        [armor({ isequipped: false, bashing: 1, lethal: 2, dexpenalty: -1 })],
        { system: { attributes: { stamina: { value: 3 } } } }
    );
    const notWorn = await totalsFor(stored);

    assert.equal(notWorn.system.attributes.dexterity.total, 2);
    assert.equal(notWorn.system.soak.bashing, 3);
    assert.equal(notWorn.system.soak.lethal, 0);
});

test("initiative is Dexterity plus Wits, the initiative bonus and the wound penalty", async () => {
    const actor = createPcActor({
        system: {
            attributes: { dexterity: { value: 3 }, wits: { value: 2 } },
            initiative: { bonus: 1 },
            health: { damage: { woundpenalty: -2 } }
        }
    });

    const result = await totalsFor(actor);

    assert.equal(result.system.initiative.base, 5);
    assert.equal(result.system.initiative.total, 4);
});

test("ignoring pain removes the wound penalty from initiative", async () => {
    const actor = createPcActor({
        system: {
            attributes: { dexterity: { value: 3 }, wits: { value: 2 } },
            initiative: { bonus: 1 },
            health: { damage: { woundpenalty: -2 } },
            conditions: { isignoringpain: true }
        }
    });

    const result = await totalsFor(actor);

    assert.equal(result.system.initiative.total, 6);
});

test("an initiative buff adds to the initiative total", async () => {
    const actor = withItems(
        [createBonus({ type: "initiative_buff", value: 2 })],
        { system: { attributes: { dexterity: { value: 3 }, wits: { value: 2 } } } }
    );

    const result = await totalsFor(actor);

    assert.equal(result.system.initiative.total, 7);
});

test("the spirit variant uses Willpower for initiative and for every soak type", async () => {
    const actor = createPcActor({
        system: {
            settings: { variant: "spirit" },
            advantages: { willpower: { permanent: 4 } },
            attributes: { stamina: { value: 9 } }
        }
    });

    const result = await totalsFor(actor);

    assert.equal(result.system.initiative.base, 4);
    assert.equal(result.system.initiative.total, 4);
    assert.deepEqual(
        [result.system.soak.bashing, result.system.soak.lethal, result.system.soak.aggravated],
        [4, 4, 4]
    );
});

test("calculating totals twice gives the same result and does not stack bonuses", async () => {
    const actor = withItems(
        [
            createBonus({ type: "attribute_buff", value: 2, settingtype: "dexterity" }),
            createBonus({ type: "soak_buff", value: 1, settingtype: "all" }),
            armor({ bashing: 1, dexpenalty: -1 })
        ],
        { system: { attributes: { stamina: { value: 3 } } } }
    );

    const first = await totalsFor(actor);
    installFoundryEnv({ actors: [actor] });
    const second = await calculateTotals(structuredClone(first));

    assert.deepEqual(second.system.attributes, first.system.attributes);
    assert.deepEqual(second.system.soak, first.system.soak);
    assert.deepEqual(second.system.initiative, first.system.initiative);
});

test("every wound level has a total after calculation", async () => {
    const result = await totalsFor(createPcActor());

    for (const level of WOUND_LEVELS) {
        assert.equal(typeof result.system.health[level].total, "number", `${level} has no numeric total`);
    }
});
