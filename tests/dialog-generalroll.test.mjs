import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";
import { createPcActor, createAbility, createAdvantage } from "./helpers/fake-actor.mjs";

installFoundryEnv({ config: { attributeSettings: "20th" } });

// Give the abilities readable names so sorting by label can be checked.
const NAMES = {
    "wod.abilities.alertness": "Alertness",
    "wod.abilities.brawl": "Brawl",
    "wod.abilities.academics": "Academics",
    "wod.abilities.occult": "Occult",
    "wod.attributes.strength": "Strength"
};
game.i18n.localize = key => NAMES[key] ?? key;

const { DialogGeneralRoll, GeneralRoll } = await import("../module/dialogs/dialog-generalroll.js");

/** Calls the grouping method with a minimal `this`, since the dialog itself needs a full FormApplication. */
function abilitiesOf(actor) {
    return DialogGeneralRoll.prototype._getAbilities.call({ actor });
}

const labels = list => list.map(entry => entry.label);

test("PC abilities are grouped as talents, skills and knowledges and sorted by label", () => {
    const actor = createPcActor({
        type: "PC",
        items: [
            createAbility({ _id: "b", id: "brawl", label: "wod.abilities.brawl", type: "wod.abilities.talent" }),
            createAbility({ _id: "a", id: "alertness", label: "wod.abilities.alertness", type: "wod.abilities.talent" }),
            createAbility({ _id: "h", id: "hidden", label: "Hidden", type: "wod.abilities.talent", isvisible: false }),
            createAbility({ _id: "s", id: "academics", label: "wod.abilities.academics", type: "wod.abilities.skill" }),
            createAbility({ _id: "k", id: "occult", label: "wod.abilities.occult", type: "wod.abilities.knowledge" }),
            createAdvantage({ id: "bloodpool", permanent: 10 })
        ]
    });

    const groups = abilitiesOf(actor);

    assert.deepEqual(labels(groups.talents), ["Alertness", "Brawl"]);
    assert.deepEqual(groups.talents.map(entry => entry.key), ["a", "b"]);
    assert.deepEqual(labels(groups.skills), ["Academics"]);
    assert.deepEqual(labels(groups.knowledges), ["Occult"]);
});

test("legacy abilities use the alternative label when one is set", () => {
    const actor = {
        type: "Vampire",
        items: [{
            _id: "sport", type: "Trait",
            system: { isvisible: true, type: "wod.types.talentsecondability", label: "Sport" }
        }],
        system: {
            abilities: {
                brawl: { isvisible: true, type: "talent", label: "wod.abilities.brawl", altlabel: "Fists" },
                alertness: { isvisible: true, type: "talent", label: "wod.abilities.alertness", altlabel: "" },
                occult: { isvisible: false, type: "knowledge", label: "wod.abilities.occult", altlabel: "" }
            }
        }
    };

    const groups = abilitiesOf(actor);

    assert.deepEqual(labels(groups.talents), ["Alertness", "Fists", "Sport"]);
    assert.deepEqual(groups.knowledges, []);
});

test("an actor with no visible abilities gives empty groups", () => {
    const groups = abilitiesOf(createPcActor({ type: "PC" }));

    assert.deepEqual(groups, { talents: [], skills: [], knowledges: [] });
});

test("an attribute roll starts on the talents tab and is named from the attribute", () => {
    const roll = new GeneralRoll("strength", "attribute", createPcActor());

    assert.equal(roll.attributeKey, "strength");
    assert.equal(roll.abilityTab, "talents");
    assert.equal(roll.name, game.i18n.localize(CONFIG.worldofdarkness.attributes20.strength));
    assert.equal(roll.difficulty, 6);
    assert.equal(roll.bonus, 0);
});

test("an ability roll stores the ability key", () => {
    const roll = new GeneralRoll("brawl", "ability", createPcActor());

    assert.equal(roll.abilityKey, "brawl");
    assert.equal(roll.abilityTab, undefined);
});

test("a no-ability roll (advantage) stores its key as the attribute key", () => {
    const roll = new GeneralRoll("willpower", "noability", createPcActor());

    assert.equal(roll.attributeKey, "willpower");
});

test("a dice roll has a dice pool of three and the key 'dice'", () => {
    const roll = new GeneralRoll("anything", "dice", undefined);

    assert.equal(roll.key, "dice");
    assert.equal(roll.attributeValue, 3);
});

test("ignoring pain is taken from the actor's conditions", () => {
    const actor = createPcActor();
    actor.system.conditions.isignoringpain = true;

    assert.equal(new GeneralRoll("ability", "ability", actor).ignorepain, true);
    assert.equal(new GeneralRoll("ability", "ability", createPcActor()).ignorepain, false);
    assert.equal(new GeneralRoll("ability", "ability", undefined).ignorepain, false);
});
