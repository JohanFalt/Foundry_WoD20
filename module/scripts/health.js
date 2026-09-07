let bashing = 0;
let lethal = 0;
let aggravated = 0;

/**
 * Returns the Corpus Advantage item on an actor, if any.
 * @param {Actor} actor
 * @returns {Item|undefined}
 */
export function getCorpusAdvantage(actor) {
	if (!actor) return undefined;
	return (actor.items || []).find(item => item.type === "Advantage" && item.system?.id === "corpus");
}

/**
 * True when the actor should use Corpus as its health track.
 * @param {Actor} actor
 * @returns {boolean}
 */
export function actorHasCorpus(actor) {
	if (!actor) return false;
	if (getCorpusAdvantage(actor)) return true;
	// Legacy Wraith: corpus lives on actor.system.advantages
	if (actor.type === CONFIG.worldofdarkness.sheettype.wraith) {
		return actor.system?.advantages?.corpus !== undefined;
	}
	return false;
}

/**
 * Permanent Corpus rating (PC Advantage item or legacy actor field).
 * @param {Actor} actor
 * @returns {number}
 */
export function getCorpusPermanent(actor) {
	const corpusItem = getCorpusAdvantage(actor);
	if (corpusItem) {
		return parseInt(corpusItem.system.permanent) || 0;
	}
	const legacy = actor.system?.advantages?.corpus;
	if (legacy?.system?.permanent !== undefined) {
		return parseInt(legacy.system.permanent) || 0;
	}
	return parseInt(legacy?.permanent) || 0;
}

/**
 * Build Corpus damage-box states synchronously (/, x, *).
 * @param {Actor} actor
 * @returns {string[]}
 */
export function getCorpusDamageStates(actor) {
	const damage = actor.system?.health?.damage?.corpus || { bashing: 0, lethal: 0, aggravated: 0 };
	let remainingBashing = parseInt(damage.bashing) || 0;
	let remainingLethal = parseInt(damage.lethal) || 0;
	let remainingAggravated = parseInt(damage.aggravated) || 0;
	const permanent = getCorpusPermanent(actor);
	const states = [];

	for (let i = 0; i < permanent; i++) {
		if (remainingAggravated > 0) {
			remainingAggravated -= 1;
			states.push("*");
		}
		else if (remainingLethal > 0) {
			remainingLethal -= 1;
			states.push("x");
		}
		else if (remainingBashing > 0) {
			remainingBashing -= 1;
			states.push("/");
		}
		else {
			states.push("");
		}
	}

	return states;
}

export async function calculateHealth(actor, type) {

    const healthLevels = [];
    let woundPenalty = 0;
    
    if (type == CONFIG.worldofdarkness.sheettype.mortal) {
        bashing = actor.system.health.damage.bashing;
        lethal = actor.system.health.damage.lethal;
        aggravated = actor.system.health.damage.aggravated;
    }
    if (type == CONFIG.worldofdarkness.sheettype.changeling) {
        bashing = actor.system.health.damage.chimerical.bashing;
        lethal = actor.system.health.damage.chimerical.lethal;
        aggravated = actor.system.health.damage.chimerical.aggravated;
    }
    if (type == CONFIG.worldofdarkness.sheettype.wraith) {
		if (!actor.system.health.damage.corpus) {
			actor.system.health.damage.corpus = { bashing: 0, lethal: 0, aggravated: 0 };
		}

        bashing = actor.system.health.damage.corpus.bashing;
        lethal = actor.system.health.damage.corpus.lethal;
        aggravated = actor.system.health.damage.corpus.aggravated;

		const corpusPermanent = getCorpusPermanent(actor);

        for (let i=0; i < corpusPermanent; i++) {
            let status = await calculateStatus();

            const healthLevel = {
                label: "", 
                status: status
            };

            healthLevels.push(healthLevel);
        }

        healthLevels.woundPenalty = 0;

        return healthLevels;
    }

    if (actor.system.health.bruised.total > 0) {
        for (let i=0; i < actor.system.health.bruised.total; i++) {
            let status = await calculateStatus();

            if (status != "") {
                woundPenalty = parseInt(actor.system.health.bruised.penalty);
            }

            const healthLevel = {
                label: actor.system.health.bruised.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.hurt.total > 0) {
        for (let i=0; i < actor.system.health.hurt.total; i++) {
            let status = await calculateStatus();

            if (status != "") {
                woundPenalty = parseInt(actor.system.health.hurt.penalty);
            }

            const healthLevel = {
                label: actor.system.health.hurt.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.injured.total > 0) {
        for (let i=0; i < actor.system.health.injured.total; i++) {
            let status = await calculateStatus();

            if (status != "") {
                woundPenalty = parseInt(actor.system.health.injured.penalty);
            }

            const healthLevel = {
                label: actor.system.health.injured.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.wounded.total > 0) {
        for (let i=0; i < actor.system.health.wounded.total; i++) {
            let status = await calculateStatus();

            if (status != "") {
                woundPenalty = parseInt(actor.system.health.wounded.penalty);
            }

            const healthLevel = {
                label: actor.system.health.wounded.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.mauled.total > 0) {
        for (let i=0; i < actor.system.health.mauled.total; i++) {
            let status = await calculateStatus();

            if (status != "") {
                woundPenalty = parseInt(actor.system.health.mauled.penalty);
            }

            const healthLevel = {
                label: actor.system.health.mauled.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.crippled.total > 0) {
        for (let i=0; i < actor.system.health.crippled.total; i++) {
            let status = await calculateStatus();

            if (status != "") {
                woundPenalty = parseInt(actor.system.health.crippled.penalty);
            }

            const healthLevel = {
                label: actor.system.health.crippled.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.incapacitated.total > 0) {
        for (let i=0; i < actor.system.health.incapacitated.total; i++) {
            let status = await calculateStatus();

            if (status != "") {
                woundPenalty = parseInt(actor.system.health.incapacitated.penalty);
            }

            const healthLevel = {
                label: actor.system.health.incapacitated.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }   
    
    healthLevels.woundPenalty = woundPenalty;

    return healthLevels;
}

async function calculateStatus() {
    if (aggravated > 0) {
        aggravated -= 1;

        return "*";
    }
    if (lethal > 0) {
        lethal -= 1;

        return "x";
    }
    if (bashing > 0) {
        bashing -= 1;

        return "/";
    }

    return "";
}
