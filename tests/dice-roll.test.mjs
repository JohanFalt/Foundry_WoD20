import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";
import { installScriptedRoll } from "./helpers/scripted-roll.mjs";
import { createPcActor, createAdvantage, createAbility, actorDocument } from "./helpers/fake-actor.mjs";

installFoundryEnv();
const { DiceRoller, DiceRollContainer } = await import("../module/scripts/roll-dice.js");

const ROLL_TEMPLATE = "systems/worldofdarkness/templates/dialogs/roll-template.hbs";

/**
 * Rolls one pool with scripted die faces and returns what the chat card shows.
 * numDices defaults to the number of scripted faces.
 */
async function roll({ faces, actor = createPcActor(), config = {}, settings = {}, configure = () => {} }) {
    const env = installFoundryEnv({ config, settings, actors: [actor] });
    const scripted = installScriptedRoll(faces);

    const diceRoll = new DiceRollContainer(actor);
    diceRoll.numDices = faces.length;
    configure(diceRoll);

    const success = await DiceRoller(diceRoll);
    const card = env.renderedTemplates.at(-1)?.data.data;

    return { success, card, env, scripted, actor };
}

function willpower(temporary) {
    const item = createAdvantage({ id: "willpower", temporary });
    item.update = async changes => {
        item.system.temporary = changes["system.temporary"];
    };
    return item;
}

test("each die of 6 or more is a success, and a 10 counts once", async () => {
    const { success, card, scripted } = await roll({ faces: [6, 5, 10, 1] });

    assert.equal(success, 2);
    assert.equal(card.multipleresult[0].rollResult, "success");
    assert.equal(scripted.remaining(), 0);
});

test("the difficulty is never below the lowest difficulty setting", async () => {
    // Difficulty 1 would count the 1 as a success. The lowest setting (2) means it does not.
    const { success } = await roll({
        faces: [2, 1],
        configure: diceRoll => { diceRoll.difficulty = 1; }
    });

    assert.equal(success, 1);
});

test("a roll with ones and no successes is a botch when handle ones is off", async () => {
    const { success, card } = await roll({ faces: [1, 1] });

    assert.equal(success, 0);
    assert.equal(card.multipleresult[0].rollResult, "botch");
});

test("a roll with no successes and no ones is a plain failure", async () => {
    const { success, card } = await roll({ faces: [2, 3] });

    assert.equal(success, 0);
    assert.equal(card.multipleresult[0].rollResult, "fail");
});

test("with handle ones on, each one removes a success", async () => {
    const { success, card } = await roll({
        faces: [10, 1],
        config: { usehandleOnes: true, handleOnes: 1 }
    });

    assert.equal(success, 0);
    assert.equal(card.multipleresult[0].rollResult, "fail");
});

test("with handle ones on, ones with no successes are a botch", async () => {
    const { success, card } = await roll({
        faces: [1, 1],
        config: { usehandleOnes: true, handleOnes: 1 }
    });

    assert.equal(success, 0);
    assert.equal(card.multipleresult[0].rollResult, "botch");
});

test("a favored ability does not lose a success to a one", async () => {
    const actor = createPcActor();
    actor.system.attributes.strength.isfavorited = true;

    const { success, card } = await roll({
        faces: [6, 1],
        actor,
        config: { usehandleOnes: true, handleOnes: 1 },
        configure: diceRoll => { diceRoll.attribute = "strength"; }
    });

    assert.equal(success, 1);
    assert.ok(card.info.includes("wod.dice.favored"));
});

test("a favored attribute does not lose a success to a one when it is the attribute", async () => {
    const actor = createPcActor();
    actor.system.attributes.strength.isfavorited = true;

    const { success } = await roll({
        faces: [6, 1],
        actor,
        config: { usehandleOnes: true, handleOnes: 1 },
        configure: diceRoll => { diceRoll.attribute = "strength"; }
    });

    assert.equal(success, 1);
});

test("a favored ability is checked by its id even when the attribute is not favored", async () => {
    const brawl = createAbility({ id: "brawl", isfavorited: true });
    const actor = actorDocument(createPcActor({ items: [brawl] }));

    const { success } = await roll({
        faces: [6, 1],
        actor,
        config: { usehandleOnes: true, handleOnes: 1 },
        configure: diceRoll => {
            diceRoll.attribute = "strength";
            diceRoll.ability = "brawl";
        }
    });

    assert.equal(success, 1);
});

test("a one still removes a success when neither the attribute nor the ability is favored", async () => {
    const actor = actorDocument(createPcActor({ items: [createAbility({ id: "brawl" })] }));

    const { success, card } = await roll({
        faces: [6, 1],
        actor,
        config: { usehandleOnes: true, handleOnes: 1 },
        configure: diceRoll => {
            diceRoll.attribute = "strength";
            diceRoll.ability = "brawl";
        }
    });

    assert.equal(success, 0);
    assert.equal(card.multipleresult[0].rollResult, "fail");
});

test("a soak roll based on a favored Stamina does not lose a success to a one", async () => {
    const actor = createPcActor();
    actor.system.attributes.stamina.isfavorited = true;

    const { success, card } = await roll({
        faces: [6, 1],
        actor,
        config: { usehandleOnes: true, useOnesSoak: true, handleOnes: 1 },
        configure: diceRoll => {
            diceRoll.origin = "soak";
            diceRoll.attribute = "stamina";
        }
    });

    assert.equal(success, 1);
    assert.equal(card.multipleresult[0].rollResult, "success");
});

test("a damage roll based on a favored Strength does not lose a success to a one", async () => {
    const actor = createPcActor();
    actor.system.attributes.strength.isfavorited = true;

    const { success } = await roll({
        faces: [6, 1],
        actor,
        config: { usehandleOnes: true, useOnesDamage: true, handleOnes: 1 },
        configure: diceRoll => {
            diceRoll.origin = "damage";
            diceRoll.attribute = "strength";
        }
    });

    assert.equal(success, 1);
});

test("a favored roll with no successes still botches on a one", async () => {
    // Caste and Aspect Abilities can still botch. Only the subtraction is removed.
    const actor = createPcActor();
    actor.system.attributes.stamina.isfavorited = true;

    const soak = await roll({
        faces: [1, 1],
        actor,
        config: { usehandleOnes: true, useOnesSoak: true, handleOnes: 1 },
        configure: diceRoll => {
            diceRoll.origin = "soak";
            diceRoll.attribute = "stamina";
        }
    });

    assert.equal(soak.success, 0);
    assert.equal(soak.card.multipleresult[0].rollResult, "botch");
});

test("a Willpower point adds one automatic success and is spent", async () => {
    const actor = createPcActor({ items: [willpower(1)] });

    const { success, actor: rolled } = await roll({
        faces: [3],
        actor,
        configure: diceRoll => { diceRoll.usewillpower = true; }
    });

    assert.equal(success, 1);
    assert.equal(rolled.items[0].system.temporary, 0);
});

test("without a Willpower point, the roll goes ahead and the player is warned", async () => {
    const actor = createPcActor({ items: [willpower(0)] });

    const { success, card, env } = await roll({
        faces: [3],
        actor,
        configure: diceRoll => { diceRoll.usewillpower = true; }
    });

    assert.equal(success, 0);
    assert.equal(card.multipleresult[0].rollResult, "fail");
    assert.equal(env.warnings.length, 1);
});

test("Willpower with bonus dice adds three dice and removes the chance of a botch", async () => {
    const actor = createPcActor({ items: [willpower(1)] });

    const { success, card, scripted } = await roll({
        faces: [1, 1, 1, 6],
        actor,
        config: { willpowerBonusDice: true },
        configure: diceRoll => {
            diceRoll.numDices = 1;
            diceRoll.usewillpower = true;
        }
    });

    assert.equal(success, 1);
    assert.equal(card.multipleresult[0].rollResult, "success");
    assert.equal(scripted.remaining(), 0);
    assert.ok(card.info.includes("wod.dice.nobotchpossible"));
});

test("wound penalty removes dice, and never below zero", async () => {
    const hurt = await roll({
        faces: [10, 6, 6],
        configure: diceRoll => {
            diceRoll.numDices = 3;
            diceRoll.woundpenalty = -2;
        }
    });
    assert.equal(hurt.success, 1);
    assert.equal(hurt.scripted.remaining(), 2);

    const crippled = await roll({
        faces: [6],
        configure: diceRoll => {
            diceRoll.numDices = 3;
            diceRoll.woundpenalty = -5;
        }
    });
    assert.equal(crippled.success, 0);
    assert.equal(crippled.card.multipleresult[0].rollResult, "fail");
    assert.equal(crippled.scripted.remaining(), 1);
});

test("a speciality adds its own success value on a 10", async () => {
    const { success } = await roll({
        faces: [10],
        config: { usespecialityAddSuccess: true, specialityAddSuccess: 2 },
        configure: diceRoll => { diceRoll.speciality = true; }
    });

    assert.equal(success, 2);
});

test("the ten-adds-success setting applies to a 10 when there is no speciality", async () => {
    const { success } = await roll({
        faces: [10],
        config: { usetenAddSuccess: true, tenAddSuccess: 3 }
    });

    assert.equal(success, 3);
});

test("a 10 explodes into another die when exploding dice are set to always", async () => {
    const { success, scripted } = await roll({
        faces: [10, 3],
        config: { useexplodingDice: true, explodingDice: "always" },
        configure: diceRoll => { diceRoll.numDices = 1; }
    });

    assert.equal(success, 1);
    assert.equal(scripted.remaining(), 0);
});

test("a non-10 does not explode", async () => {
    const { scripted } = await roll({
        faces: [4, 6],
        config: { useexplodingDice: true, explodingDice: "always" },
        configure: diceRoll => { diceRoll.numDices = 1; }
    });

    assert.equal(scripted.remaining(), 1);
});

test("a speciality cannot botch unless the setting allows it", async () => {
    const withoutAllowance = await roll({
        faces: [1, 1],
        configure: diceRoll => { diceRoll.speciality = true; }
    });
    assert.equal(withoutAllowance.card.multipleresult[0].rollResult, "fail");

    const withAllowance = await roll({
        faces: [1, 1],
        config: { specialityAllowBotch: true },
        configure: diceRoll => { diceRoll.speciality = true; }
    });
    assert.equal(withAllowance.card.multipleresult[0].rollResult, "botch");
});

test("soak and damage rolls cannot botch unless the matching setting is on", async () => {
    const soak = await roll({ faces: [1], configure: diceRoll => { diceRoll.origin = "soak"; } });
    assert.equal(soak.card.multipleresult[0].rollResult, "fail");

    const soakWithOnes = await roll({
        faces: [1],
        config: { useOnesSoak: true },
        configure: diceRoll => { diceRoll.origin = "soak"; }
    });
    assert.equal(soakWithOnes.card.multipleresult[0].rollResult, "botch");

    const damage = await roll({ faces: [1], configure: diceRoll => { diceRoll.origin = "damage"; } });
    assert.equal(damage.card.multipleresult[0].rollResult, "fail");
});

test("a soak roll reports the unsoaked damage, capped by the applicable maximum", async () => {
    const plain = await roll({
        faces: [6, 6],
        configure: diceRoll => {
            diceRoll.origin = "soak";
            diceRoll.incomingDamage = 5;
        }
    });
    assert.ok(plain.card.info.some(text => text.includes('"unsoaked":3')));

    const capped = await roll({
        faces: [6, 6],
        configure: diceRoll => {
            diceRoll.origin = "soak";
            diceRoll.incomingDamage = 5;
            diceRoll.maxApplicableDamage = 2;
        }
    });
    assert.ok(capped.card.info.some(text => text.includes('"unsoaked":2')));
});

test("each target in the target list gets its own result", async () => {
    const { card } = await roll({
        faces: [6, 1, 6],
        configure: diceRoll => {
            diceRoll.targetlist = [{ numDices: 2 }, { numDices: 1 }];
        }
    });

    assert.equal(card.multipleresult.length, 2);
    assert.deepEqual(card.multipleresult.map(result => result.rollResult), ["success", "success"]);
});

test("the result is posted as a chat card with the roll template", async () => {
    const { env } = await roll({ faces: [6] });

    assert.equal(env.chatMessages.length, 1);
    assert.equal(env.renderedTemplates.at(-1).template, ROLL_TEMPLATE);
    assert.ok(env.chatMessages[0].content.includes(ROLL_TEMPLATE));
});
