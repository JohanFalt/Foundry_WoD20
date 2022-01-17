let bashing = 0;
let lethal = 0;
let aggravated = 0;

export function calculateHealth(actor) {

    const healthLevels = [];
    let woundPenalty = 0;
    
    bashing = actor.data.data.health.damage.bashing;
    lethal = actor.data.data.health.damage.lethal;
    aggravated = actor.data.data.health.damage.aggravated;

    if (actor.data.data.health.bruised.value > 0) {
        for (let i=0; i < actor.data.data.health.bruised.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.data.data.health.bruised.penalty;
            }

            const healthLevel = {
                label: actor.data.data.health.bruised.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.data.data.health.hurt.value > 0) {
        for (let i=0; i < actor.data.data.health.hurt.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.data.data.health.hurt.penalty;
            }

            const healthLevel = {
                label: actor.data.data.health.hurt.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.data.data.health.injured.value > 0) {
        for (let i=0; i < actor.data.data.health.injured.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.data.data.health.injured.penalty;
            }

            const healthLevel = {
                label: actor.data.data.health.injured.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.data.data.health.wounded.value > 0) {
        for (let i=0; i < actor.data.data.health.wounded.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.data.data.health.wounded.penalty;
            }

            const healthLevel = {
                label: actor.data.data.health.wounded.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.data.data.health.mauled.value > 0) {
        for (let i=0; i < actor.data.data.health.mauled.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.data.data.health.mauled.penalty;
            }

            const healthLevel = {
                label: actor.data.data.health.mauled.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.data.data.health.crippled.value > 0) {
        for (let i=0; i < actor.data.data.health.crippled.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.data.data.health.crippled.penalty;
            }

            const healthLevel = {
                label: actor.data.data.health.crippled.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.data.data.health.incapacitated.value > 0) {
        for (let i=0; i < actor.data.data.health.incapacitated.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.data.data.health.incapacitated.penalty;
            }

            const healthLevel = {
                label: actor.data.data.health.incapacitated.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }   
    
    healthLevels.woundPenalty = woundPenalty;

    return healthLevels;
}

function calculateStatus() {
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