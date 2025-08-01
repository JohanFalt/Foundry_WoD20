let bashing = 0;
let lethal = 0;
let aggravated = 0;

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
        bashing = actor.system.health.damage.corpus.bashing;
        lethal = actor.system.health.damage.corpus.lethal;
        aggravated = actor.system.health.damage.corpus.aggravated;

        for (let i=0; i < actor.system.advantages.corpus.permanent; i++) {
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