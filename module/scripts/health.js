let bashing = 0;
let lethal = 0;
let aggravated = 0;

export function calculateHealth(actor) {

    const healthLevels = [];
    let woundPenalty = 0;
    
    bashing = actor.system.health.damage.bashing;
    lethal = actor.system.health.damage.lethal;
    aggravated = actor.system.health.damage.aggravated;

    if (actor.system.health.bruised.value > 0) {
        for (let i=0; i < actor.system.health.bruised.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.system.health.bruised.penalty;
            }

            const healthLevel = {
                label: actor.system.health.bruised.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.hurt.value > 0) {
        for (let i=0; i < actor.system.health.hurt.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.system.health.hurt.penalty;
            }

            const healthLevel = {
                label: actor.system.health.hurt.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.injured.value > 0) {
        for (let i=0; i < actor.system.health.injured.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.system.health.injured.penalty;
            }

            const healthLevel = {
                label: actor.system.health.injured.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.wounded.value > 0) {
        for (let i=0; i < actor.system.health.wounded.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.system.health.wounded.penalty;
            }

            const healthLevel = {
                label: actor.system.health.wounded.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.mauled.value > 0) {
        for (let i=0; i < actor.system.health.mauled.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.system.health.mauled.penalty;
            }

            const healthLevel = {
                label: actor.system.health.mauled.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.crippled.value > 0) {
        for (let i=0; i < actor.system.health.crippled.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.system.health.crippled.penalty;
            }

            const healthLevel = {
                label: actor.system.health.crippled.label, 
                status: status
            };

            healthLevels.push(healthLevel);
        }
    }

    if (actor.system.health.incapacitated.value > 0) {
        for (let i=0; i < actor.system.health.incapacitated.value; i++) {
            let status = calculateStatus();

            if (status != "") {
                woundPenalty = actor.system.health.incapacitated.penalty;
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