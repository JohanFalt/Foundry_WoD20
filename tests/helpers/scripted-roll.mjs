/**
 * Replaces the global Roll with a class that returns predetermined die faces.
 *
 * The system creates one `new Roll("1d10")` per die and reads the result from
 * `roll.terms[0].results`. Faces are consumed in order, one per die.
 *
 * @param {number[]} faces - Die results, in the order the dice are rolled.
 * @returns {{ rolls: object[], remaining: () => number }}
 */
export function installScriptedRoll(faces) {
    const queue = [...faces];
    const rolls = [];

    globalThis.Roll = class ScriptedRoll {
        constructor(formula) {
            this.formula = formula;
            this.terms = [{ results: [] }];
        }

        async evaluate() {
            if (queue.length === 0) {
                throw new Error("ScriptedRoll: no more faces are scripted for this test");
            }
            this.terms[0].results.push({ result: queue.shift() });
            rolls.push(this);
            return this;
        }
    };

    return {
        rolls,
        remaining: () => queue.length
    };
}
