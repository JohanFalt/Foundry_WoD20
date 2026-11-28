import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";
import { createPcActor, createAdvantage, WOUND_LEVELS } from "./helpers/fake-actor.mjs";

installFoundryEnv();
const {
    calculateHealth,
    actorHasCorpus,
    getCorpusPermanent,
    getCorpusDamageStates
} = await import("../module/scripts/health.js");

const MORTAL = "Mortal";
const WRAITH = "Wraith";

/** Sets the number of boxes per wound level and zeroes every other level. */
function withTrack(actor, boxes) {
    for (const level of WOUND_LEVELS) {
        actor.system.health[level].total = boxes[level] ?? 0;
    }
    return actor;
}

test("an undamaged mortal track has empty boxes and no wound penalty", async () => {
    const actor = withTrack(createPcActor(), { bruised: 2, hurt: 1 });

    const health = await calculateHealth(actor, MORTAL);

    assert.deepEqual(health.map(level => level.status), ["", "", ""]);
    assert.equal(health.woundPenalty, 0);
});

test("damage fills boxes in severity order: aggravated, lethal, then bashing", async () => {
    const actor = withTrack(createPcActor(), { bruised: 2, hurt: 1 });
    actor.system.health.damage = { bashing: 2, lethal: 1, aggravated: 0, woundpenalty: 0, woundlevel: "" };

    const health = await calculateHealth(actor, MORTAL);

    assert.deepEqual(health.map(level => level.status), ["x", "/", "/"]);
});

test("the wound penalty comes from the most severe box that is marked", async () => {
    const actor = withTrack(createPcActor(), { bruised: 1, hurt: 1 });
    actor.system.health.bruised.penalty = 0;
    actor.system.health.hurt.penalty = -1;

    actor.system.health.damage = { bashing: 1, lethal: 0, aggravated: 0, woundpenalty: 0, woundlevel: "" };
    assert.equal((await calculateHealth(actor, MORTAL)).woundPenalty, 0);

    actor.system.health.damage = { bashing: 2, lethal: 0, aggravated: 0, woundpenalty: 0, woundlevel: "" };
    assert.equal((await calculateHealth(actor, MORTAL)).woundPenalty, -1);
});

test("a wraith's health track is its Corpus, not the mortal wound levels", async () => {
    const actor = withTrack(createPcActor({
        items: [createAdvantage({ id: "corpus", permanent: 3 })]
    }), { bruised: 5 });
    actor.system.health.damage.corpus = { bashing: 0, lethal: 1, aggravated: 1 };

    const health = await calculateHealth(actor, WRAITH);

    assert.deepEqual(health.map(level => level.status), ["*", "x", ""]);
    assert.equal(health.woundPenalty, 0);
});

test("Corpus permanent rating is read from the Corpus Advantage", () => {
    const actor = createPcActor({ items: [createAdvantage({ id: "corpus", permanent: "4" })] });
    assert.equal(getCorpusPermanent(actor), 4);

    const legacy = { type: WRAITH, system: { advantages: { corpus: { permanent: 2 } } } };
    assert.equal(getCorpusPermanent(legacy), 2);

    assert.equal(getCorpusPermanent(createPcActor()), 0);
});

test("Corpus states show aggravated, lethal, bashing, then empty boxes", () => {
    const actor = createPcActor({ items: [createAdvantage({ id: "corpus", permanent: 5 })] });
    actor.system.health.damage.corpus = { bashing: 1, lethal: 1, aggravated: 1 };

    assert.deepEqual(getCorpusDamageStates(actor), ["*", "x", "/", "", ""]);
});

test("a Corpus Advantage makes an actor use Corpus as its health track", () => {
    assert.equal(actorHasCorpus(createPcActor({ items: [createAdvantage({ id: "corpus" })] })), true);
    assert.equal(actorHasCorpus(createPcActor()), false);
    assert.equal(actorHasCorpus(null), false);
});

test("a legacy wraith uses Corpus when the actor has a corpus field", () => {
    assert.equal(actorHasCorpus({ type: WRAITH, system: { advantages: { corpus: {} } } }), true);
    assert.equal(actorHasCorpus({ type: WRAITH, system: { advantages: {} } }), false);
});
