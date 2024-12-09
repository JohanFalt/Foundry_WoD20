//import ActionHelper from "./scripts/action-helpers.js";
import MessageHelper from "./scripts/message-helpers.js"
import { getImage } from "./items/item-sheet.js";

/**
 * Time to update the entire world and patch it correctly
 * @param installedVersion   The version that is installed
 * @param migrationVersion   The version that is being pushed at the world
 */
export const UpdateWorld = async function (installedVersion, migrationVersion) {
    let updateWorld = false;
    let isError = false;

    if (_compareVersion(installedVersion, migrationVersion)) {
        updateWorld = true;

        ui.notifications.warn(`Updating World from version ${installedVersion} to ${migrationVersion} do not close your game or shut down your server. Please wait this can take a while...`, {permanent: true});
        console.log(`Updating from ${installedVersion} to ${migrationVersion}`);

        MessageHelper.printMessage("Updating World", "As you update the world each entity within it will be updated to the newest version. Depending on how large your world is this can take some time.<br />First is all Actors, then all Items and last any Compendium that are installed.");
        MessageHelper.printMessage("Starting with Actors", "");

        //World Actors
        for (const actor of game.actors) {
            try {
                await updateActor(actor, migrationVersion);
            } catch(err) {
                err.message = `Failed migration for Actor ${actor.name}: ${err.message}`;
                console.error(err);
                isError = true;
            }
        }

        MessageHelper.printMessage("Starting with World Items", "");
        //World Items
        for (const item of game.items) {
            try {
                await updateItem(item);
            } catch(err) {
                err.message = `Failed migration for Actor Item ${item.name}: ${err.message}`;
                console.error(err);
                isError = true;
            }
        }

        MessageHelper.printMessage("Starting with World Compendiums", "");
        // World Compendiums
        for ( let pack of game.packs ) {
            try {
                if ( pack.metadata.packageType !== "world" ) continue;
                if ( !["Actor", "Item", "Scene"].includes(pack.documentName) ) continue;
                await updateCompendium(pack, migrationVersion);
            } catch(err) {
                console.error(err);
                isError = true;
            }
        }
        //MessageHelper.printMessage("Compendiums done", "");

        //console.log("Update completed!"); 
        
    }

    try {
        ui.notifications.warn("Checking character settings");
        await this.updates();
    }
    catch (e) {
    }

    if (updateWorld) {
        ui.notifications.info(`World updated to version ${game.system.version}!`, {permanent: true});
    }
    else {
        ui.notifications.info("Done!", {permanent: false});
    }

    if (isError) {
        ui.notifications.error(`An error occured during the system migration. Try restarting Foundry and try again. If this message appear again, please check the console (F12) for details and report the problem.`, {permanent: true});
    }
    else if (updateWorld) {
        _getVersionText(installedVersion, migrationVersion);  
    }
}


/**
 * Function to keep the world up-to-date with possible World settings that you might have altered since last time it opened.
 */
export  const updates = async () => {
    console.log('WoD | Start verifying settings');

    let attributeSettings = "20th";
    let rollSettings = true;

    try {
        attributeSettings = game.settings.get("worldofdarkness", "attributeSettings");
        rollSettings = game.settings.get('worldofdarkness', 'advantageRolls');
    } 
    catch (e) {
        console.log("Fel uppstod i migration.js");
    }    

    for (const actor of game.actors) {
        // handle Game settings  
        let totalinit = -1;

        const actorData = foundry.utils.duplicate(actor);

        if (actor.type != CONFIG.worldofdarkness.sheettype.spirit) {
            if (attributeSettings == "20th") {
                for (const attribute in CONFIG.worldofdarkness.attributes20) {
                    actorData.system.attributes[attribute].isvisible = true;
                }

                actorData.system.attributes.composure.isvisible = false;
                actorData.system.attributes.resolve.isvisible = false;
            }
            else if (attributeSettings == "5th") {
                for (const attribute in CONFIG.worldofdarkness.attributes) {
                    actorData.system.attributes[attribute].isvisible = true;
                }

                actorData.system.attributes.appearance.isvisible = false;
                actorData.system.attributes.perception.isvisible = false;
            }

            for (const advantage in actorData.system.advantages) {
                if (actorData.system.advantages[advantage] == undefined) {
                    continue;
                }
                if (actorData.system.advantages[advantage].temporary == undefined) {
                    continue;
                }
                if (actorData.system.advantages[advantage].roll == undefined) {
                    continue;
                }

                let permanentValue = 0;

                if (rollSettings) {
                    permanentValue = parseInt(actorData.system.advantages[advantage].permanent);
                }
                else {
                    permanentValue = parseInt(actorData.system.advantages[advantage].permanent) > parseInt(actorData.system.advantages[advantage].temporary) ? parseInt(actorData.system.advantages[advantage].temporary) : parseInt(actorData.system.advantages[advantage].permanent);
                }

                if (permanentValue > -1) {
                    actorData.system.advantages[advantage].roll = parseInt(permanentValue);
                }
            }

            actorData.system.settings.haswillpower = true;

            if (actorData.type == CONFIG.worldofdarkness.sheettype.werewolf) {
                actorData.system.settings.hasrage = true;
                actorData.system.settings.hasgnosis = true;
                actorData.system.settings.powers.hasgifts = true;
            }

            if (actorData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
                actorData.system.settings.hasrage = true;
                actorData.system.settings.hasgnosis = true;
                actorData.system.settings.powers.hasgifts = true;

                if ((actorData.system.changingbreed == "Ananasi") || (actorData.system.changingbreed == "Nuwisha")) {
                    actorData.system.settings.hasrage = false;
                }
                if (actorData.system.changingbreed == "Ananasi") {
                    actorData.system.settings.hasbloodpool = true;
                }
            }

            if (actorData.type == CONFIG.worldofdarkness.sheettype.vampire) {
                actorData.system.settings.haspath = true;
                actorData.system.settings.hasbloodpool = true;
                actorData.system.settings.hasvirtue = true;
                actorData.system.settings.powers.hasdisciplines = true;
            }

            if (actorData.type == CONFIG.worldofdarkness.sheettype.mage) {
            }

            if (actorData.type == CONFIG.worldofdarkness.sheettype.changeling) {
                actorData.system.settings.hasglamour = true;
                actorData.system.settings.hasbanality = true;
                actorData.system.settings.hasnightmare = true;
                actorData.system.settings.powers.hasarts = true;
            }

            if (actorData.type == CONFIG.worldofdarkness.sheettype.creatures) {
                actorData.system.settings.powers.haspowers = true;
            }

            // for (const item of actor.items) {

            //     let hasChanged = false;
            //     const itemData = foundry.utils.duplicate(item);
            //     const imgUrl = getImage(item);

            //     if (imgUrl != "") {                    
            //         hasChanged = itemData.img == imgUrl ? false : true;
            //         itemData.img = imgUrl;
            //     }

            //     if (hasChanged) {
            //         await item.update(itemData);
            //     }
            // }
        }

        totalinit = parseInt(actor.system.initiative.base) + parseInt(actor.system.initiative.bonus);
        actorData.system.initiative.total = parseInt(totalinit);

        await actor.update(actorData);

        if (actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            for (const effect of actor.effects) {
                if (effect.icon.includes("werewolf")) {
                    const effectid = effect.id;
                    await actor.deleteEmbeddedDocuments("ActiveEffect", [effectid]);
                }                
            }
        }
    }

    /* for (const actor of game.actors) {
        if (actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            for (const effect of actor.effects) {
                if (effect.icon.includes("werewolf")) {
                    const effectid = effect.id;
                    await actor.deleteEmbeddedDocuments("ActiveEffect", [effectid]);
                }                
            }
        }
    } */
    
    /* for (const item of game.items) {
        let hasChanged = false;
        const itemData = foundry.utils.duplicate(item);
        const imgUrl = getImage(item);

        if (imgUrl != "") {                    
            hasChanged = itemData.img == imgUrl ? false : true;
            itemData.img = imgUrl;
        }

        if (hasChanged) {
            await item.update(itemData);
        }
    } */
}

/* -------------------------------------------- */
/*  Entity Type Update Functions                */
/* -------------------------------------------- */

/**
 * patch an actor to the latest version
 * @param {Actor} actor   The actor to Update
 * @param migrationVersion   The version that is being pushed at the world * 
 */
 export const updateActor = async function(actor, migrationVersion) {
    let update = false;
    let found = false;

    // deprecated sheet
    if (actor.type == CONFIG.worldofdarkness.sheettype.spirit) {
        return;
    }

    if ((actor.system.settings.version == "") || (actor.system.settings.version == undefined)) {
        const updateData = foundry.utils.duplicate(actor);
        updateData.system.settings.version = "2.2.0";
        await actor.update(updateData);
    }

    if (_compareVersion(actor.system.settings.version, "1.5.0")) {
        
        const updateData = foundry.utils.duplicate(actor);

        updateData.system.settings.version = "1.5.0";

        if(updateData.system.settings.created != undefined) {
            updateData.system.settings.iscreated = updateData.system.settings.created;   
        }        

        if(updateData.system.settings.soak.bashing.roll != undefined) {
            updateData.system.settings.soak.bashing.isrollable = updateData.system.settings.soak.bashing.roll;            
        }

        if(updateData.system.settings.soak.lethal.roll != undefined) {
            updateData.system.settings.soak.lethal.isrollable = updateData.system.settings.soak.lethal.roll;            
        }        

        if(updateData.system.settings.soak.aggravated.roll != undefined) {
            updateData.system.settings.soak.aggravated.isrollable = updateData.system.settings.soak.aggravated.roll;            
        }        

        if(updateData.system.conditions.ignorepain != undefined) {
            updateData.system.conditions.isignoringpain = updateData.system.conditions.ignorepain;        
        }
        if(updateData.system.conditions.stunned != undefined) {
            updateData.system.conditions.isstunned = updateData.system.conditions.stunned;
        }
        

        if (updateData.type != CONFIG.worldofdarkness.sheettype.spirit) {
            for (const attribute in updateData.system.attributes) {
                if(updateData.system.attributes[attribute].visible != undefined) {
                    updateData.system.attributes[attribute].isvisible = updateData.system.attributes[attribute].visible;   
                }
            }

            for (const ability in updateData.system.abilities.talent) {
                if(updateData.system.abilities.talent[ability].visible != undefined) {
                    updateData.system.abilities.talent[ability].isvisible = updateData.system.abilities.talent[ability].visible;  
                }                  
            }

            for (const ability in updateData.system.abilities.skill) {
                if(updateData.system.abilities.skill[ability].visible != undefined) {
                    updateData.system.abilities.skill[ability].isvisible = updateData.system.abilities.skill[ability].visible; 
                }
            }

            for (const ability in updateData.system.abilities.knowledge) {
                if(updateData.system.abilities.knowledge[ability].visible != undefined) {
                    updateData.system.abilities.knowledge[ability].isvisible = updateData.system.abilities.knowledge[ability].visible; 
                }
            }
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            if(updateData.system.conditions.frenzy != undefined) {
                updateData.system.conditions.isfrenzy = updateData.system.conditions.frenzy;
            }

            if(updateData.system.shapes.homid.active != undefined) {
                updateData.system.shapes.homid.isactive = updateData.system.shapes.homid.active;
            }
            if(updateData.system.shapes.glabro.active != undefined) {
                updateData.system.shapes.glabro.isactive = updateData.system.shapes.glabro.active;
            }
            if(updateData.system.shapes.crinos.active != undefined) {
                updateData.system.shapes.crinos.isactive = updateData.system.shapes.crinos.active;
            }
            if(updateData.system.shapes.hispo.active != undefined) {
                updateData.system.shapes.hispo.isactive = updateData.system.shapes.hispo.active;
            }
            if(updateData.system.shapes.lupus.active != undefined) {
                updateData.system.shapes.lupus.isactive = updateData.system.shapes.lupus.active;
            }
        } 

        await actor.update(updateData);

        updateData.system.settings['-=created'] = null;
        updateData.system.settings.soak.bashing['-=roll'] = null;
        updateData.system.settings.soak.lethal['-=roll'] = null;
        updateData.system.settings.soak.aggravated['-=roll'] = null;

        updateData.system.conditions['-=ignorepain'] = null;
        updateData.system.conditions['-=stunned'] = null;

        if (updateData.type != CONFIG.worldofdarkness.sheettype.spirit) {
            for (const attribute in updateData.system.attributes) {
                updateData.system.attributes[attribute]['-=visible'] = null;
            }

            for (const ability in updateData.system.abilities.talent) {
                updateData.system.abilities.talent[ability]['-=visible'] = null;
            }

            for (const ability in updateData.system.abilities.skill) {
                updateData.system.abilities.skill[ability]['-=visible'] = null;                   
            }

            for (const ability in updateData.system.abilities.knowledge) {
                updateData.system.abilities.knowledge[ability]['-=visible'] = null;                   
            }
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            updateData.system.conditions['-=frenzy'] = null;

            updateData.system.shapes.homid['-=active'] = null;
            updateData.system.shapes.glabro['-=active'] = null;
            updateData.system.shapes.crinos['-=active'] = null;
            updateData.system.shapes.hispo['-=active'] = null;
            updateData.system.shapes.lupus['-=active'] = null;
        } 

        await actor.update(updateData);
    }

    if (_compareVersion(actor.system.settings.version, "1.6.0")) {
        const updateData = foundry.utils.duplicate(actor);
        
        updateData.system.settings.version = "1.6.0";

        if (updateData.type == CONFIG.worldofdarkness.sheettype.creature) {
            update = true;            

            updateData.system.settings.hasrage = true;
            updateData.system.settings.hasgnosis = true;
            updateData.system.settings.haswillpower = true;
            updateData.system.settings.hasessence = false;
            updateData.system.settings.hasbloodpool = false;                    
        }   
        if (updateData.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            update = true;  

            if (updateData.system.tribe == "Black Furies") {
                updateData.system.tribe = "wod.bio.werewolf.blackfuries";
            }
            if (updateData.system.tribe == "Bone Gnawers") {
                updateData.system.tribe = "wod.bio.werewolf.bonegnawer";
            }
            if (updateData.system.tribe == "Children of Gaia") {
                updateData.system.tribe = "wod.bio.werewolf.childrenofgaia";
            }
            if (updateData.system.tribe == "Fianna") {
                updateData.system.tribe = "wod.bio.werewolf.fianna";
            }
            if (updateData.system.tribe == "Get of Fenris") {
                updateData.system.tribe = "wod.bio.werewolf.getoffenris";
            }
            if (updateData.system.tribe == "Glass Walkers") {
                updateData.system.tribe = "wod.bio.werewolf.glasswalker";
            }
            if (updateData.system.tribe == "Red Talons") {
                updateData.system.tribe = "wod.bio.werewolf.redtalon";
            }
            if (updateData.system.tribe == "Shadow Lords") {
                updateData.system.tribe = "wod.bio.werewolf.shadowlord";
            }
            if (updateData.system.tribe == "Silent Striders") {
                updateData.system.tribe = "wod.bio.werewolf.silentstrider";
            }
            if (updateData.system.tribe == "Silver Fangs") {
                updateData.system.tribe = "wod.bio.werewolf.silverfang";
            }
            if (updateData.system.tribe == "Stargazers") {
                updateData.system.tribe = "wod.bio.werewolf.stargazer";
            }
            if (updateData.system.tribe == "Uktena") {
                updateData.system.tribe = "wod.bio.werewolf.uktena";
            }
            if (updateData.system.tribe == "Wendigo") {
                updateData.system.tribe = "wod.bio.werewolf.wendigo";
            }
            if (updateData.system.tribe == "Black Spiral Dancers") {
                updateData.system.tribe = "wod.bio.werewolf.blackspiraldancer";
            }
            if (updateData.system.tribe == "Skin Dancers") {
                updateData.system.tribe = "wod.bio.werewolf.skindancer";
            }
            if (updateData.system.tribe == "Bunyip") {
                updateData.system.tribe = "wod.bio.werewolf.bunyip";
            }
            if (updateData.system.tribe == "Croatan") {
                updateData.system.tribe = "wod.bio.werewolf.croatan";
            }
            if (updateData.system.tribe == "White Howlers") {
                updateData.system.tribe = "wod.bio.werewolf.whitehowler";
            }
        }       
        
        if (update) {
            await actor.update(updateData);
            update = false;
        }
    }

    if (_compareVersion(actor.system.settings.version, "2.1.0")) {
        let updateData = foundry.utils.duplicate(actor);

        if (updateData.type != CONFIG.worldofdarkness.sheettype.spirit) {
            updateData.system.settings.version = "2.1.0";            

            if (updateData.type == CONFIG.worldofdarkness.sheettype.mage) {
                update = true;

                updateData.system.affiliation = game.i18n.localize(updateData.system.affiliation);

                if (updateData.system.abilities.knowledge.technology.value != undefined) {
                    updateData.system.abilities.skill.technology.value = updateData.system.abilities.knowledge.technology.value;
                }
                if (updateData.system.abilities.knowledge.technology.speciality != undefined) {
                    updateData.system.abilities.skill.technology.speciality = updateData.system.abilities.knowledge.technology.speciality;
                }
                if (updateData.system.abilities.knowledge.technology.altlabel != undefined) {
                    updateData.system.abilities.skill.technology.altlabel = updateData.system.abilities.knowledge.technology.altlabel;
                }

                updateData.system.abilities.skill.technology.isvisible = true;

                updateData.system.abilities.knowledge.technology.value = 0;
                updateData.system.abilities.knowledge.technology.speciality = "";
                updateData.system.abilities.knowledge.technology.altlabel = "";
                updateData.system.abilities.knowledge.technology.isvisible = false;                                
            }
            else if (updateData.type == CONFIG.worldofdarkness.sheettype.werewolf) {
                update = true;

                updateData.system.tribe = game.i18n.localize(updateData.system.tribe);
            }
            else if (updateData.type == CONFIG.worldofdarkness.sheettype.vampire) {
                update = true;

                updateData.system.sect = game.i18n.localize(updateData.system.sect);
                updateData.system.clan = game.i18n.localize(updateData.system.clan);
            }
            else if (updateData.type == CONFIG.worldofdarkness.sheettype.creature) {
                update = true;

                updateData.system.settings.powers.haspowers = true;                            
            }

            for (const ability in updateData.system.abilities.talent) {
                if (issecondability(ability)) {
                    if (parseInt(actor.system.abilities.talent[ability].value) > 0) {
                        update = true;
                        let itemData = {
                            name: translateSecondaryAbility(actor.system.abilities.talent[ability].label),
                            type: "Trait",
                            data: {
                                iscreated: true,
                                ismeleeweapon: issecondabilitymelee(actor.system.abilities.talent[ability].label),
                                israngedeweapon: issecondabilityranged(actor.system.abilities.talent[ability].label),
                                version: migrationVersion,
                                value: parseInt(actor.system.abilities.talent[ability].value),
                                max: parseInt(actor.system.abilities.talent[ability].max),
                                label: translateSecondaryAbility(actor.system.abilities.talent[ability].label),
                                speciality: actor.system.abilities.talent[ability].speciality,
                                type: "wod.types.talentsecondability"
                            }
                        };

                        console.log(`MIGRATION: Adds ${actor.system.abilities.talent[ability].label} to ${actor.name}`);
                        await actor.createEmbeddedDocuments("Item", [itemData]);           
                    }

                    updateData.system.abilities.talent['-=' + ability] = null;
                    update = true;
                }
            }
            for (const ability in updateData.system.abilities.skill) {
                if (issecondability(ability)) {
                    if (parseInt(updateData.system.abilities.skill[ability].value) > 0) {
                        update = true;
                        let itemData = {
                            name: translateSecondaryAbility(actor.system.abilities.skill[ability].label),
                            type: "Trait",
                            data: {
                                iscreated: true,
                                ismeleeweapon: issecondabilitymelee(actor.system.abilities.skill[ability].label),
                                israngedeweapon: issecondabilityranged(actor.system.abilities.skill[ability].label),
                                version: migrationVersion,
                                value: parseInt(actor.system.abilities.skill[ability].value),
                                max: parseInt(actor.system.abilities.skill[ability].max),
                                label: translateSecondaryAbility(actor.system.abilities.skill[ability].label),
                                speciality: actor.system.abilities.skill[ability].speciality,
                                type: "wod.types.skillsecondability"
                            }
                        };

                        console.log(`MIGRATION: Adds ${actor.system.abilities.skill[ability].label} to ${actor.name}`);
                        await actor.createEmbeddedDocuments("Item", [itemData]);                        
                    }

                    updateData.system.abilities.skill['-=' + ability] = null;
                    update = true;
                }
            }
            for (const ability in updateData.system.abilities.knowledge) {
                if (issecondability(ability)) {
                    if (parseInt(updateData.system.abilities.knowledge[ability].value) > 0) {
                        update = true;
                        let itemData = {
                            name: translateSecondaryAbility(actor.system.abilities.knowledge[ability].label),
                            type: "Trait",
                            data: {
                                iscreated: true,
                                ismeleeweapon: issecondabilitymelee(actor.system.abilities.knowledge[ability].label),
                                israngedeweapon: issecondabilityranged(actor.system.abilities.knowledge[ability].label),
                                version: migrationVersion,
                                value: parseInt(actor.system.abilities.knowledge[ability].value),
                                max: parseInt(actor.system.abilities.knowledge[ability].max),
                                label: translateSecondaryAbility(actor.system.abilities.knowledge[ability].label),
                                speciality: actor.system.abilities.knowledge[ability].speciality,
                                type: "wod.types.knowledgesecondability"
                            }
                        };

                        console.log(`MIGRATION: Adds ${actor.system.abilities.knowledge[ability].label} to ${actor.name}`);
                        await actor.createEmbeddedDocuments("Item", [itemData]);                        
                    }

                    updateData.system.abilities.knowledge['-=' + ability] = null;
                    update = true;
                }
            }
        }

        if (update) {

            await actor.update(updateData);
            update = false;
        }
    }  

    if (_compareVersion(actor.system.settings.version, "2.2.0")) {        
        let updateData = foundry.utils.duplicate(actor);

        updateData.system.settings.version = "2.2.0";

        // move of advantages to mortals
        if (updateData.type != CONFIG.worldofdarkness.sheettype.spirit) {
            if (updateData.system.willpower != undefined) {
                updateData.system.advantages.willpower = updateData.system.willpower;
            }
            if (updateData.system.bloodpool != undefined) {
                updateData.system.advantages.bloodpool = updateData.system.bloodpool;
            }

            updateData.system.settings.haswillpower = true;

            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            if (updateData.system.rage != undefined) {
                updateData.system.advantages.rage = updateData.system.rage;
            }
            if (updateData.system.gnosis != undefined) {
                updateData.system.advantages.gnosis = updateData.system.gnosis;
            }

            updateData.system.settings.hasrage = true;
            updateData.system.settings.hasgnosis = true;
            
            updateData.system.settings.powers.hasgifts = true;

            update = true;
        }        

        if (updateData.type == CONFIG.worldofdarkness.sheettype.vampire) {
            if (updateData.system.rage?.bonus != undefined) {
                updateData.system.advantages.rage.bonus = updateData.system.rage.bonus; 
            }      
            if (updateData.system.virtues != undefined) {
                updateData.system.advantages.virtues = updateData.system.virtues;
            }

            updateData.system.advantages.virtues.conscience.permanent = updateData.system.advantages.virtues.conscience.value;
            updateData.system.advantages.virtues.selfcontrol.permanent = updateData.system.advantages.virtues.selfcontrol.value;
            updateData.system.advantages.virtues.courage.permanent = updateData.system.advantages.virtues.courage.value;

            if (updateData.system.path != undefined) {
                updateData.system.advantages.path = updateData.system.path;
            }

            updateData.system.advantages.path.permanent = updateData.system.advantages.path.value;

            updateData.system.settings.haspath = true;
            updateData.system.settings.hasbloodpool = true;
            updateData.system.settings.hasvirtue = true;
            updateData.system.settings.powers.hasdisciplines = true;

            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.mage) {
            if (updateData.system.arete != undefined) {
                updateData.system.advantages.arete = updateData.system.arete;
            }

            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.changeling) {
            if (updateData.system.glamour != undefined) {
                updateData.system.advantages.glamour = updateData.system.glamour;
            }
            if (updateData.system.banality != undefined) {
                updateData.system.advantages.banality = updateData.system.banality;
            }
            if (updateData.system.nightmare != undefined) {
                updateData.system.advantages.nightmare = updateData.system.nightmare;
            }

            updateData.system.settings.hasglamour = true;
            updateData.system.settings.hasbanality = true;
            updateData.system.settings.hasnightmare = true;
            updateData.system.settings.powers.hasarts = true;

            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
            if (updateData.system.rage != undefined) {
                updateData.system.advantages.rage = updateData.system.rage;
            }
            if (updateData.system.gnosis != undefined) {
                updateData.system.advantages.gnosis = updateData.system.gnosis;
            }

            updateData.system.settings.hasrage = true;
            updateData.system.settings.hasgnosis = true;
            updateData.system.settings.powers.hasgifts = true;

            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.creature) {
            if (updateData.system.rage != undefined) {
                updateData.system.advantages.rage = updateData.system.rage;
            }
            if (updateData.system.gnosis != undefined) {
                updateData.system.advantages.gnosis = updateData.system.gnosis;
            }
            if (updateData.system.glamour != undefined) {
                updateData.system.advantages.glamour = updateData.system.glamour;
            }
            if (updateData.system.banality != undefined) {
                updateData.system.advantages.banality = updateData.system.banality;
            }
            if (updateData.system.nightmare != undefined) {
                updateData.system.advantages.nightmare = updateData.system.nightmare;
            }
            if (updateData.system.essence != undefined) {
                updateData.system.advantages.essence = updateData.system.essence;
            }

            updateData.system.settings.hasrage = true;
            updateData.system.settings.hasgnosis = true;
            updateData.system.settings.powers.haspowers = true;

            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.spirit) {
            if (updateData.system.rage != undefined) {
                updateData.system.advantages.rage = updateData.system.rage;
            }
            if (updateData.system.gnosis != undefined) {
                updateData.system.advantages.gnosis = updateData.system.gnosis;
            }
            if (updateData.system.willpower != undefined) {
                updateData.system.advantages.willpower = updateData.system.willpower;
            }
            if (updateData.system.bloodpool != undefined) {
                updateData.system.advantages.bloodpool = updateData.system.bloodpool;
            }
            if (updateData.system.essence != undefined) {
                updateData.system.advantages.essence = updateData.system.essence;
            }

            updateData.system.settings.hasrage = true;
            updateData.system.settings.hasgnosis = true;
            updateData.system.settings.haswillpower = true;
            updateData.system.settings.hasessence = true;

            updateData.system.settings.powers.hascharms = true;
            updateData.system.settings.powers.hasgifts = true;

            update = false;
        }

        if (update) {            
            await actor.update(updateData);
            update = false;
        }        

        // old errors
        if (updateData.type != CONFIG.worldofdarkness.sheettype.mage) {
            updateData['system.-=paradox'] = null;
        }

        // remove of the old advantages
        if (updateData.type != CONFIG.worldofdarkness.sheettype.spirit) {
            updateData['system.-=willpower'] = null;
            updateData['system.-=bloodpool'] = null;
            updateData['system.health.-=totalhealthlevels'] = null;
            updateData['system.-=isactive'] = null;
            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            updateData['system.-=rage'] = null;
            updateData['system.-=gnosis'] = null;
            update = true;
        }      
        
        if (updateData.type == CONFIG.worldofdarkness.sheettype.vampire) {
            updateData['system.advantages.path.-=value'] = null;
            updateData['system.advantages.virtues.conscience.-=value'] = null;
            updateData['system.advantages.virtues.selfcontrol.-=value'] = null;
            updateData['system.advantages.virtues.courage.-=value'] = null;
            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.mage) {
            updateData['system.-=arete'] = null;
            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.changeling) {
            updateData['system.-=glamour'] = null;
            updateData['system.-=banality'] = null;
            updateData['system.-=nightmare'] = null;
            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.creature) {
            updateData['system.-=rage'] = null;
            updateData['system.-=gnosis'] = null;
            updateData['system.-=glamour'] = null;
            updateData['system.-=banality'] = null;
            updateData['system.-=nightmare'] = null;
            updateData['system.-=essence'] = null;
            update = true;
        }

        if (updateData.type == CONFIG.worldofdarkness.sheettype.spirit) {
            updateData['system.-=rage'] = null;
            updateData['system.-=gnosis'] = null;
            updateData['system.-=willpower'] = null;
            updateData['system.-=essence'] = null;
            update = true;
        }

        if (update) {
            await actor.update(updateData);
            update = false;
        }        
    }

    if (_compareVersion(actor.system.settings.version, "2.3.0")) {        
        let updateData = foundry.utils.duplicate(actor);

        updateData.system.settings.version = "2.3.0";
        
        if (updateData.type == CONFIG.worldofdarkness.sheettype.spirit) {
            if (updateData.system.advantages.essence.max == null) {
                updateData.system.advantages.essence.max = 20

                update = true;
            }
        }

        if (update) {
            await actor.update(updateData);
            update = false;
        }
    }

    if (_compareVersion(actor.system.settings.version, "3.1.0")) {        
        let updateData = foundry.utils.duplicate(actor);
        update = false;
        
        if (actor.type != CONFIG.worldofdarkness.sheettype.spirit) {
            update = true;

            // check for custom paths
            if (updateData.system.advantages.path.label != "custom") {
                for (const path in game.worldofdarkness.bio.path) {
                    if (((actor.system.advantages.path.label == game.worldofdarkness.bio.path[path])) || (actor.system.advantages.path.label.toLowerCase().replace(" ", "") == path)) {
                        updateData.system.advantages.path.label = game.worldofdarkness.bio.path[path];
                        found = true;
                        break;
                    }
                }     
    
                // if found then set the properties correct
                if (!found) {
                    updateData.system.advantages.path.custom = actor.system.advantages.path.label;
                    updateData.system.advantages.path.label = "custom";                
                }
    
                // reset found
                found = false; 
            }            

            if (actor.type == CONFIG.worldofdarkness.sheettype.vampire) {
                if (updateData.system.clan != "custom") {
                    // check for custom clans
                    for (const clan in game.worldofdarkness.bio.clan) {
                        if ((actor.system.clan == game.worldofdarkness.bio.clan[clan]) || (actor.system.clan.toLowerCase().replace(" ", "") == clan)) {
                            updateData.system.clan = game.worldofdarkness.bio.clan[clan];
                            found = true;
                            break;
                        }
                    }     
        
                    // if found then set the properties correct
                    if (!found) {
                        updateData.system.custom.clan = game.i18n.localize(actor.system.clan);
                        updateData.system.clan = "custom";                
                    }
        
                    // reset found
                    found = false;
                }

                if (updateData.system.sect != "custom") {
                    // check for custom sects
                    for (const sect in game.worldofdarkness.bio.sect) {
                        if ((actor.system.sect == game.worldofdarkness.bio.sect[sect]) || (actor.system.sect.toLowerCase().replace(" ", "") == sect)) {
                            updateData.system.sect = game.worldofdarkness.bio.sect[sect];
                            found = true;
                            break;
                        }
                    }     
        
                    // if found then set the properties correct
                    if (!found) {
                        updateData.system.custom.sect = game.i18n.localize(actor.system.sect);
                        updateData.system.sect = "custom";                
                    }
        
                    // reset found
                    found = false;
                }
            }

            if (actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {
                if (updateData.system.tribe != "custom") {
                    // check for custom tribes
                    for (const tribe in game.worldofdarkness.bio.tribe) {
                        if ((actor.system.tribe == game.worldofdarkness.bio.tribe[tribe]) || (actor.system.tribe.toLowerCase().replace(" ", "") == tribe)) {
                            updateData.system.tribe = game.worldofdarkness.bio.tribe[tribe];
                            found = true;
                            break;
                        }
                    }     
        
                    // if found then set the properties correct
                    if (!found) {
                        updateData.system.custom.tribe = game.i18n.localize(actor.system.tribe);
                        updateData.system.tribe = "custom";                
                    }
        
                    // reset found
                    found = false;
                }
            }

            if (actor.type == CONFIG.worldofdarkness.sheettype.mage) {
                if (updateData.system.affiliation != "custom") {
                    // check for custom affiliations
                    for (const affiliation in game.worldofdarkness.bio.affiliation) {
                        if ((actor.system.affiliation == game.worldofdarkness.bio.affiliation[affiliation]) || (actor.system.affiliation.toLowerCase().replace(" ", "") == affiliation)) {
                            updateData.system.affiliation = game.worldofdarkness.bio.affiliation[affiliation];
                            found = true;
                            break;
                        }
                    }     
        
                    // if found then set the properties correct
                    if (!found) {
                        updateData.system.custom.affiliation = game.i18n.localize(actor.system.affiliation);
                        updateData.system.affiliation = "custom";                
                    }
        
                    // reset found
                    found = false;
                }

                if (updateData.system.sect != "custom") {
                    // check for custom sects
                    for (const affiliation in game.worldofdarkness.bio.affiliation) {
                        for (const sect in game.worldofdarkness.bio.magesect[affiliation]) {
                            if ((actor.system.sect == game.worldofdarkness.bio.magesect[affiliation][sect]) || (actor.system.sect.toLowerCase().replace(" ", "") == sect)) {
                                updateData.system.sect = game.worldofdarkness.bio.magesect[affiliation][sect];

                                if (updateData.system.affiliation == "custom") {
                                    updateData.system.affiliation = game.worldofdarkness.bio.affiliation[affiliation];
                                    updateData.system.custom.affiliation = "";
                                }
                                
                                found = true;
                                break;
                            }
                        }    
                    } 
        
                    // if found then set the properties correct
                    if (!found) {
                        updateData.system.custom.sect = game.i18n.localize(actor.system.sect);
                        updateData.system.sect = "custom";                
                    }
        
                    // reset found
                    found = false;
                }
            }

            if (actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
                if (updateData.system.kith != "custom") {
                    // check for custom kiths
                    for (const kith in game.worldofdarkness.bio.kith) {
                        if ((actor.system.kith == game.worldofdarkness.bio.kith[kith]) || (actor.system.kith.toLowerCase().replace(" ", "") == kith)) {
                            updateData.system.kith = game.worldofdarkness.bio.kith[kith];
                            found = true;
                            break;
                        }
                    }     
        
                    // if found then set the properties correct
                    if (!found) {
                        updateData.system.custom.kith = game.i18n.localize(actor.system.kith);
                        updateData.system.kith = "custom";                
                    }
        
                    // reset found
                    found = false;
                }
            }

            if (actor.type != CONFIG.worldofdarkness.sheettype.creature) {
                let actorType = actor.type.toLowerCase();

                if (actor.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
                    actorType = "werewolf";
                }

                // set correct type of ability
                for (const ability of game.worldofdarkness.abilities[actorType].modern.talents) {
                    updateData.system.abilities[ability].type = "talent";
                }

                for (const ability of game.worldofdarkness.abilities[actorType].modern.skills) {
                    updateData.system.abilities[ability].type = "skill";
                }

                for (const ability of game.worldofdarkness.abilities[actorType].modern.knowledges) {
                    updateData.system.abilities[ability].type = "knowledge";
                }
            }

            // translate abilities
            for (const ability in actor.system.abilities.talent) {
                if (actor.system.abilities.talent[ability].isvisible) {
                    updateData.system.abilities[ability] = actor.system.abilities.talent[ability];
                }                
            }
            for (const ability in actor.system.abilities.skill) {
                if (actor.system.abilities.skill[ability].isvisible) {
                    if (actor.type == CONFIG.worldofdarkness.sheettype.mage) {
                        updateData.system.abilities[ability] = actor.system.abilities.skill[ability];

                        if ((ability == "technology") || (ability == "research")) {
                            updateData.system.abilities[ability].type = "skill";
                        }
                    }
                    else if ((actor.type == CONFIG.worldofdarkness.sheettype.hunter) || (actor.type == CONFIG.worldofdarkness.sheettype.demon)) {
                        updateData.system.abilities[ability] = actor.system.abilities.skill[ability];

                        if (ability == "technology") {
                            updateData.system.abilities[ability].type = "skill";
                        }

                        if (ability == "research") {
                            updateData.system.abilities[ability].isvisible = false;
                        }
                    }
                    else {
                        updateData.system.abilities[ability] = actor.system.abilities.skill[ability];

                        if ((ability == "technology") || (ability == "research")) {
                            updateData.system.abilities[ability].isvisible = false;
                        }
                    }    
                }                
            }
            for (const ability in actor.system.abilities.knowledge) {
                if (actor.system.abilities.knowledge[ability].isvisible) {
                    if (actor.type == CONFIG.worldofdarkness.sheettype.mage) {
                        updateData.system.abilities[ability] = actor.system.abilities.knowledge[ability];

                        if ((ability == "technology") || (ability == "research")) {
                            updateData.system.abilities[ability].isvisible = false;
                        }
                    }
                    else if ((actor.type == CONFIG.worldofdarkness.sheettype.hunter) || (actor.type == CONFIG.worldofdarkness.sheettype.demon)) {
                        updateData.system.abilities[ability] = actor.system.abilities.knowledge[ability];

                        if (ability == "technology") {
                            updateData.system.abilities[ability].isvisible = false;
                        }
                    }
                    else {
                        updateData.system.abilities[ability] = actor.system.abilities.knowledge[ability];
                    }                              
                }                                                
            }                                   
        }

        if (update) {
            updateData.system.settings.version = "3.1.0";

            await actor.update(updateData);
            update = false;
        }
    }

    if (_compareVersion(actor.system.settings.version, "3.2.0")) {        
        let updateData = foundry.utils.duplicate(actor);
        update = false;

        if (actor.type == CONFIG.worldofdarkness.sheettype.mortal) {
            updateData.system.settings.variant = "general";
            update = true;
        }

        if (actor.type == CONFIG.worldofdarkness.sheettype.creature) {
            updateData.system.settings.variant = "general";
            update = true;
        }

        if (actor.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
            updateData.system.settings.variant = "general";

            if (updateData.system.changingbreed == "Mokolé") {
                updateData.system.changingbreed = "Mokole";
            }
            
            update = true;
        }

        if (actor.type == CONFIG.worldofdarkness.sheettype.changeling) {
            updateData.system.settings.variant = "general";
            update = true;
        }

        if (update) {
            updateData.system.settings.version = "3.2.0";

            await actor.update(updateData);
            update = false;
        }
    }

    if (_compareVersion(actor.system.settings.version, "3.2.9")) {
        let updateData = foundry.utils.duplicate(actor);
        update = false;

        if (actor.type == CONFIG.worldofdarkness.sheettype.demon) {
            updateData.system.advantages.virtues.selfcontrol.label = "wod.advantages.virtue.conviction";
            update = true;
        }

        if (update) {
            updateData.system.settings.version = "3.2.9";

            await actor.update(updateData);
            update = false;
        }
    }  
    
    if (_compareVersion(actor.system.settings.version, "3.3.0")) {
        update = true;        

        for (const item of actor.items) {
            await updateItem(item)            ;
        }

        if (update) {
            let updateData = foundry.utils.duplicate(actor);
            updateData.system.settings.version = "3.3.0";

            await actor.update(updateData);
            update = false;
        }
    }

    if (_compareVersion(actor.system.settings.version, "4.1.0")) {
        update = false;    
        let updateData = foundry.utils.duplicate(actor);   
        
        if (actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {            
            update = true;  

            if (actor.system.breed == "Homid") {
                updateData.system.breed = "wod.bio.breedname.homid";
            }
            else if (actor.system.breed == "Metis") {
                updateData.system.breed = "wod.bio.breedname.metis";
            }
            else if (actor.system.breed == "Lupus") {
                updateData.system.breed = "wod.bio.breedname.lupus";
            }
            else {
                updateData.system.breed = "";
            }

            if (actor.system.auspice == "Ragabash") {
                updateData.system.auspice = "wod.bio.auspicename.ragabash";
            }
            else if (actor.system.auspice == "Theurge") {
                updateData.system.auspice = "wod.bio.auspicename.theurge";
            }
            else if (actor.system.auspice == "Philodox") {
                updateData.system.auspice = "wod.bio.auspicename.philodox";
            }
            else if (actor.system.auspice == "Galliard") {
                updateData.system.auspice = "wod.bio.auspicename.galliard";
            }
            else if (actor.system.auspice == "Ahroun") {
                updateData.system.auspice = "wod.bio.auspicename.ahroun";
            }
            else {
                updateData.system.auspice = "";
            }            
        }

        if (actor.type == CONFIG.worldofdarkness.sheettype.hunter) {
            update = true;

            if (actor.system.creed == game.i18n.localize("wod.bio.hunter.avenger")) {
                updateData.system.creed = "wod.bio.hunter.avenger";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.defender")) {
                updateData.system.creed = "wod.bio.hunter.defender";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.hermit")) {
                updateData.system.creed = "wod.bio.hunter.hermit";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.innocent")) {
                updateData.system.creed = "wod.bio.hunter.innocent";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.judge")) {
                updateData.system.creed = "wod.bio.hunter.judge";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.martyr")) {
                updateData.system.creed = "wod.bio.hunter.martyr";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.redeemer")) {
                updateData.system.creed = "wod.bio.hunter.redeemer";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.visionary")) {
                updateData.system.creed = "wod.bio.hunter.visionary";
            }
            else if (actor.system.creed == game.i18n.localize("wod.bio.hunter.wayword")) {
                updateData.system.creed = "wod.bio.hunter.wayword";
            }
            else {
                updateData.system.creed = "";
            }
        }

        if (actor.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
            if (actor.system.changingbreed == "Ajaba") {
                update = true;  

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Metis") {
                    updateData.system.breed = "wod.bio.breedname.metis";
                }
                else if (actor.system.breed == "Hyaenid") {
                    updateData.system.breed = "wod.bio.breedname.hyaenid";
                }
                else {
                    updateData.system.breed = "";
                }
    
                if (actor.system.auspice == "Dawn") {
                    updateData.system.auspice = "wod.bio.aspectname.dawn";
                }
                else if (actor.system.auspice == "Midnight") {
                    updateData.system.auspice = "wod.bio.aspectname.midnight";
                }
                else if (actor.system.auspice == "Dusk") {
                    updateData.system.auspice = "wod.bio.aspectname.dusk";
                }
                else {
                    updateData.system.auspice = "";
                }
            }  
            if (actor.system.changingbreed == "Ananasi") {
                update = true;  

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Arachnid") {
                    updateData.system.breed = "wod.bio.breedname.arachnid";
                }
                else {
                    updateData.system.breed = "";
                }
    
                if (actor.system.auspice == "Tenere") {
                    updateData.system.auspice = "wod.bio.aspectname.tenere";
                }
                else if (actor.system.auspice == "Hatar") {
                    updateData.system.auspice = "wod.bio.aspectname.hatar";
                }
                else if (actor.system.auspice == "Kumoti") {
                    updateData.system.auspice = "wod.bio.aspectname.kumoti";
                }
                else {
                    updateData.system.auspice = "";
                }

                if (actor.system.tribe == "Myrmidon") {
                    updateData.system.tribe = "wod.bio.factionname.myrmidon";
                }
                else if (actor.system.tribe == "Viskir") {
                    updateData.system.tribe = "wod.bio.factionname.viskir";
                }
                else if (actor.system.tribe == "Wyrsta") {
                    updateData.system.tribe = "wod.bio.factionname.wyrsta";
                }
                else {
                    updateData.system.tribe = "";
                }
            } 
            if (actor.system.changingbreed == "Apis") {
                update = true;  

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Bos") {
                    updateData.system.breed = "wod.bio.breedname.bos";
                }
                else {
                    updateData.system.breed = "";
                }
    
                if (actor.system.auspice == "Twilight") {
                    updateData.system.auspice = "wod.bio.auspicename.twilight";
                }
                else if (actor.system.auspice == "Solar") {
                    updateData.system.auspice = "wod.bio.auspicename.solar";
                }
                else if (actor.system.auspice == "Lunar") {
                    updateData.system.auspice = "wod.bio.auspicename.lunar";
                }
                else {
                    updateData.system.auspice = "";
                }
            }   
            if (actor.system.changingbreed == "Bastet") {
                update = true;  

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Metis") {
                    updateData.system.breed = "wod.bio.breedname.metis";
                }
                else if (actor.system.breed == "Feline") {
                    updateData.system.breed = "wod.bio.breedname.feline";
                }
                else {
                    updateData.system.breed = "";
                }
    
                if (actor.system.auspice == "Daylight") {
                    updateData.system.auspice = "wod.bio.pryioname.daylight";
                }
                else if (actor.system.auspice == "Twilight") {
                    updateData.system.auspice = "wod.bio.pryioname.twilight";
                }
                else if (actor.system.auspice == "Night") {
                    updateData.system.auspice = "wod.bio.pryioname.night";
                }
                else {
                    updateData.system.auspice = "";
                }

                if (actor.system.tribe == "Bagheera") {
                    updateData.system.tribe = "wod.bio.tribename.bagheera";
                }
                else if (actor.system.tribe == "Balam") {
                    updateData.system.tribe = "wod.bio.tribename.balam";
                }
                else if (actor.system.tribe == "Bubasti") {
                    updateData.system.tribe = "wod.bio.tribename.bubasti";
                }
                else if (actor.system.tribe == "Ceilican") {
                    updateData.system.tribe = "wod.bio.tribename.ceilican";
                }
                else if (actor.system.tribe == "Khan") {
                    updateData.system.tribe = "wod.bio.tribename.khan";
                }
                else if (actor.system.tribe == "Pumonca") {
                    updateData.system.tribe = "wod.bio.tribename.pumonca";
                }
                else if (actor.system.tribe == "Qualmi") {
                    updateData.system.tribe = "wod.bio.tribename.qualmi";
                }
                else if (actor.system.tribe == "Simba") {
                    updateData.system.tribe = "wod.bio.tribename.simba";
                }
                else if (actor.system.tribe == "Swara") {
                    updateData.system.tribe = "wod.bio.tribename.swara";
                }
                else {
                    updateData.system.tribe = "";
                }
            }      
            if (actor.system.changingbreed == "Corax") {
                update = true;  

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Corvid") {
                    updateData.system.breed = "wod.bio.breedname.corvid";
                }
                else {
                    updateData.system.breed = "";
                }
    
                if (actor.system.auspice == "Chasers") {
                    updateData.system.auspice = "wod.bio.tribename.chasers";
                }
                else if (actor.system.auspice == "Leshy") {
                    updateData.system.auspice = "wod.bio.tribename.leshy";
                }
                else if (actor.system.auspice == "Hermetic Order of Swift Light") {
                    updateData.system.auspice = "wod.bio.tribename.swiftlight";
                }
                else if (actor.system.auspice == "The Gulls of Battle") {
                    updateData.system.auspice = "wod.bio.tribename.gulls";
                }
                else if (actor.system.auspice == "The Morrigan") {
                    updateData.system.auspice = "wod.bio.tribename.morrigan";
                }
                else if (actor.system.auspice == "Murder's Gaughters") {
                    updateData.system.auspice = "wod.bio.tribename.gaughters";
                }
                else if (actor.system.auspice == "The Sun-Lost") {
                    updateData.system.auspice = "wod.bio.tribename.sunlost";
                }
                else if (actor.system.auspice == "Tulugaq") {
                    updateData.system.auspice = "wod.bio.tribename.tulugaq";
                }
                else {
                    updateData.system.auspice = "";
                }
            } 
            if (actor.system.changingbreed == "Grondr") {
                update = true;  

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Metis") {
                    updateData.system.breed = "wod.bio.breedname.metis";
                }
                else if (actor.system.breed == "Scrofa") {
                    updateData.system.breed = "wod.bio.breedname.scrofa";
                }
                else {
                    updateData.system.breed = "";
                }
            }  
            if (actor.system.changingbreed == "Gurahl") {
                update = true;

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Ursine") {
                    updateData.system.breed = "wod.bio.breedname.ursine";
                }
                else {
                    updateData.system.breed = "";
                }

                if (actor.system.auspice == "Arcas") {
                    updateData.system.auspice = "wod.bio.auspicename.arcas";
                }
                else if (actor.system.auspice == "Uzmati") {
                    updateData.system.auspice = "wod.bio.auspicename.uzmati";
                }
                else if (actor.system.auspice == "Kojubat") {
                    updateData.system.auspice = "wod.bio.auspicename.kojubat";
                }
                else if (actor.system.auspice == "Kieh") {
                    updateData.system.auspice = "wod.bio.auspicename.kieh";
                }
                else if (actor.system.auspice == "Rishi") {
                    updateData.system.auspice = "wod.bio.auspicename.rishi";
                }
                else {
                    updateData.system.auspice = "";
                }

                if (actor.system.tribe == "Forest Walkers") {
                    updateData.system.tribe = "wod.bio.tribename.forestwalkers";
                }
                else if (actor.system.tribe == "Ice Stalkers") {
                    updateData.system.tribe = "wod.bio.tribename.icestalkers";
                }
                else if (actor.system.tribe == "Mountain Guardians") {
                    updateData.system.tribe = "wod.bio.tribename.mountainguardians";
                }
                else if (actor.system.tribe == "River Keepers") {
                    updateData.system.tribe = "wod.bio.tribename.riverkeepers";
                }
                else {
                    updateData.system.tribe = "";
                }
            } 
            if (actor.system.changingbreed == "Kitsune") {
                update = true;

                if (actor.system.breed == "Kojin") {
                    updateData.system.breed = "wod.bio.breedname.kojin";
                }
                else if (actor.system.breed == "Shinju") {
                    updateData.system.breed = "wod.bio.breedname.shinju";
                }
                else if (actor.system.breed == "Roko") {
                    updateData.system.breed = "wod.bio.breedname.roko";
                }
                else {
                    updateData.system.breed = "";
                }

                if (actor.system.auspice == "Kataribe") {
                    updateData.system.auspice = "wod.bio.pathname.kataribe";
                }
                else if (actor.system.auspice == "Gukutsushi") {
                    updateData.system.auspice = "wod.bio.pathname.gukutsushi";
                }
                else if (actor.system.auspice == "Doshi") {
                    updateData.system.auspice = "wod.bio.pathname.doshi";
                }
                else if (actor.system.auspice == "Eji") {
                    updateData.system.auspice = "wod.bio.pathname.eji";
                }
                else {
                    updateData.system.auspice = "";
                }
            }
            if (actor.system.changingbreed == "Mokole") {
                update = true;

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Archid") {
                    updateData.system.breed = "wod.bio.breedname.archid";
                }
                else if (actor.system.breed == "Suchid") {
                    updateData.system.breed = "wod.bio.breedname.suchid";
                }
                else {
                    updateData.system.breed = "";
                }

                if (actor.system.auspice == "Rising Sun") {
                    updateData.system.auspice = "wod.bio.auspicename.risingsun";
                }
                else if (actor.system.auspice == "Noonday Sun") {
                    updateData.system.auspice = "wod.bio.auspicename.noondaysun";
                }
                else if (actor.system.auspice == "Setting Sun") {
                    updateData.system.auspice = "wod.bio.auspicename.settingsun";
                }
                else if (actor.system.auspice == "Shrouded Sun") {
                    updateData.system.auspice = "wod.bio.auspicename.shroudedsun";
                }
                else if (actor.system.auspice == "Midnight Sun") {
                    updateData.system.auspice = "wod.bio.auspicename.midnightsun";
                }
                else if (actor.system.auspice == "Decorated Sun") {
                    updateData.system.auspice = "wod.bio.auspicename.decoratedsun";
                }
                else if (actor.system.auspice == "Eclipsed Sun") {
                    updateData.system.auspice = "wod.bio.auspicename.eclipsedsun";
                }
                else {
                    updateData.system.auspice = "";
                }

                if (actor.system.tribe == "Champsa") {
                    updateData.system.tribe = "wod.bio.varnaname.champsa";
                }
                else if (actor.system.tribe == "Gharial") {
                    updateData.system.tribe = "wod.bio.varnaname.gharial";
                }
                else if (actor.system.tribe == "Halpatee") {
                    updateData.system.tribe = "wod.bio.varnaname.halpatee";
                }
                else if (actor.system.tribe == "Karna") {
                    updateData.system.tribe = "wod.bio.varnaname.karna";
                }
                else if (actor.system.tribe == "Makara") {
                    updateData.system.tribe = "wod.bio.varnaname.makara";
                }
                else if (actor.system.tribe == "Ora") {
                    updateData.system.tribe = "wod.bio.varnaname.ora";
                }
                else if (actor.system.tribe == "Paisa") {
                    updateData.system.tribe = "wod.bio.varnaname.paisa";
                }
                else if (actor.system.tribe == "Syrta") {
                    updateData.system.tribe = "wod.bio.varnaname.syrta";
                }
                else if (actor.system.tribe == "Unktehi") {
                    updateData.system.tribe = "wod.bio.varnaname.unktehi";
                }
                else {
                    updateData.system.tribe = "";
                }
            }
            if (actor.system.changingbreed == "Nagah") {
                update = true;

                if (actor.system.breed == "Balaram") {
                    updateData.system.breed = "wod.bio.breedname.balaram";
                }
                else if (actor.system.breed == "Ahi") {
                    updateData.system.breed = "wod.bio.breedname.ahi";
                }
                else if (actor.system.breed == "Vasuki") {
                    updateData.system.breed = "wod.bio.breedname.vasuki";
                }
                else {
                    updateData.system.breed = "";
                }

                if (actor.system.auspice == "Kamakshi") {
                    updateData.system.auspice = "wod.bio.auspicename.kamakshi";
                }
                else if (actor.system.auspice == "Kartikeya") {
                    updateData.system.auspice = "wod.bio.auspicename.kartikeya";
                }
                else if (actor.system.auspice == "Kamsa") {
                    updateData.system.auspice = "wod.bio.auspicename.kamsa";
                }
                else if (actor.system.auspice == "Kali") {
                    updateData.system.auspice = "wod.bio.auspicename.kali";
                }
                else {
                    updateData.system.auspice = "";
                }
            }
            if (actor.system.changingbreed == "Nuwisha") {
                update = true;

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Latrani") {
                    updateData.system.breed = "wod.bio.breedname.latrani";
                }
                else {
                    updateData.system.breed = "";
                }
            }
            if (actor.system.changingbreed == "Ratkin") {
                update = true;

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Metis") {
                    updateData.system.breed = "wod.bio.breedname.metis";
                }
                else if (actor.system.breed == "Rodens") {
                    updateData.system.breed = "wod.bio.breedname.rodens";
                }
                else {
                    updateData.system.breed = "";
                }

                if (actor.system.auspice == "Tunnel Runner") {
                    updateData.system.auspice = "wod.bio.aspectname.tunnelrunner";
                }
                else if (actor.system.auspice == "Shadow Seer") {
                    updateData.system.auspice = "wod.bio.aspectname.shadowseer";
                }
                else if (actor.system.auspice == "Knife Skulker") {
                    updateData.system.auspice = "wod.bio.aspectname.knifeskulker";
                }
                else if (actor.system.auspice == "Warrior") {
                    updateData.system.auspice = "wod.bio.aspectname.warrior";
                }
                else if (actor.system.auspice == "Engineers") {
                    updateData.system.auspice = "wod.bio.aspectname.engineers";
                }
                else if (actor.system.auspice == "Plague Lords") {
                    updateData.system.auspice = "wod.bio.aspectname.plaguelords";
                }
                else if (actor.system.auspice == "Munchmausen") {
                    updateData.system.auspice = "wod.bio.aspectname.munchmausen";
                }
                else if (actor.system.auspice == "Twitchers") {
                    updateData.system.auspice = "wod.bio.aspectname.twitchers";
                }
                else {
                    updateData.system.auspice = "";
                }
            }
            if (actor.system.changingbreed == "Rokea") {
                update = true;

                if (actor.system.breed == "Homid") {
                    updateData.system.breed = "wod.bio.breedname.homid";
                }
                else if (actor.system.breed == "Rodens") {
                    updateData.system.breed = "wod.bio.breedname.squamus";
                }
                else {
                    updateData.system.breed = "";
                }

                if (actor.system.auspice == "Brightwaters") {
                    updateData.system.auspice = "wod.bio.auspicename.brightwaters";
                }
                else if (actor.system.auspice == "Dimwater") {
                    updateData.system.auspice = "wod.bio.auspicename.dimwater";
                }
                else if (actor.system.auspice == "Darkwater") {
                    updateData.system.auspice = "wod.bio.auspicename.darkwater";
                }
                else {
                    updateData.system.auspice = "";
                }
            }
        }

        if (update) {
            //let updateData = foundry.utils.duplicate(actor);
            updateData.system.settings.version = "4.1.0";

            await actor.update(updateData);
            update = false;
        }
    }
}

/**
 * patch an item to the latest version
 * @param {Item} item   The Item to Update
 * 
 */
 export const updateItem = async function(item) {
    let altered = false;

    if (_compareVersion(item.system.version, "1.5.0")) {
        const itemData = foundry.utils.duplicate(item);

        if (item.type == "Armor") {
            itemData.system.forms.hashomid = itemData.system.forms.homid;
            itemData.system.forms.hasglabro = itemData.system.forms.glabro;
            itemData.system.forms.hascrinos = itemData.system.forms.crinos;
            itemData.system.forms.hashispo = itemData.system.forms.hispo;
            itemData.system.forms.haslupus = itemData.system.forms.lupus;
        }

        // Weapons
        if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
            itemData.system.attack.isrollable = itemData.system.attack.roll;
            itemData.system.damage.isrollable = itemData.system.damage.roll;

            if (itemData.system.diff != undefined) {
                itemData.system.difficulty = parseInt(itemData.system.diff);
            }
            
            itemData.system.istwohanded = itemData.system.twohanded;
        }

        if (item.type == "Melee Weapon") {
            itemData.system.isnatural = itemData.system.natural;
        }

        if (item.type == "Ranged Weapon") {
            itemData.system.mode.hasreload = itemData.system.mode.reload;
            itemData.system.mode.hasburst = itemData.system.mode.burst;
            itemData.system.mode.hasfullauto = itemData.system.mode.fullauto;
            itemData.system.mode.hasspray = itemData.system.mode.spray;
        }

        if (item.type == "Fetish") {
            itemData.system.difficulty = parseInt(itemData.system.diff);
        }

        // Alla actor items POWER skall flytta active -> isactive
        if (item.type == "Power") {
            itemData.system.isactive = itemData.system.active;
            itemData.system.isrollable = itemData.system.rollable;                 
        }                      

        if (item.type == "Rote") {
            itemData.system.instrument.ispersonalized = itemData.system.instrument.personalized;
            itemData.system.instrument.isunique = itemData.system.instrument.unique;
        }

        if (item.type == "Feature") {
            itemData.system.isrollable = itemData.system.roll;
        }
        
        if (item.type == "Experience") {
            itemData.system.isspent = itemData.system.spent;
        }

        itemData.system.version = "1.5.0";
        itemData.system.iscreated = true;

        altered = true;

        if (altered) {
            await item.update(itemData);

            altered = false;
        }

        // Armor
        if (item.type == "Armor") {
            itemData.system.forms['-=homid'] = null;
            itemData.system.forms['-=glabro'] = null;
            itemData.system.forms['-=crinos'] = null;
            itemData.system.forms['-=hispo'] = null;
            itemData.system.forms['-=lupus'] = null;

            altered = true;
        }

        // Weapons
        if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
            itemData.system.attack['-=roll'] = null;
            itemData.system.attack['-=isRollable'] = null;
            itemData.system.damage['-=roll'] = null;
            itemData.system.damage['-=isRollable'] = null;
            itemData.system['-=diff'] = null;
            itemData.system['-=twohanded'] = null;

            altered = true;
        }

        // Melee Weapon
        if (item.type == "Melee Weapon") {
            itemData.system['-=natural'] = null;

            altered = true;
        }

        // Ranged Weapon
        if (item.type == "Ranged Weapon") {
            itemData.system.mode['-=reload'] = null;
            itemData.system.mode['-=burst'] = null;
            itemData.system.mode['-=fullauto'] = null;
            itemData.system.mode['-=spray'] = null;

            altered = true;
        }

        // Fetish
        if (item.type == "Fetish") {
            itemData.system['-=diff'] = null;

            altered = true;
        }

        // Power
        if (item.type == "Power") {
            itemData.system['-=active'] = null;
            itemData.system['-=rollable'] = null;
            itemData.system['-=isRollable'] = null;

            altered = true;
        }                      

        // Rote
        if (item.type == "Rote") {
            itemData.system.instrument['-=personalized'] = null;
            itemData.system.instrument['-=unique'] = null;

            altered = true;
        }

        // Feature
        if (item.type == "Feature") {
            itemData.system['-=roll'] = null;
            itemData.system['-=isRollable'] = null;

            altered = true;
        }
        
        if (item.type == "Experience") {
            itemData.system['-=spent'] = null;

            altered = true;
        }

        if (item.type != "Experience") {      
            itemData.system['-=created'] = null;  

            altered = true;
        }

        if (altered) {
            await item.update(itemData);

            altered = false;
        }
    }

    if (_compareVersion(item.system.version, "2.1.0")) {
        const itemData = foundry.utils.duplicate(item);
        itemData.system.version = "2.1.0";

        if (item.type == "Melee Weapon") {
            if ((itemData.system.attack.ability != "athletics") && (itemData.system.attack.ability != "brawl") && (itemData.system.attack.ability != "martialarts") && (itemData.system.attack.ability != "melee")) {
                itemData.system.attack.ability = "custom";
                altered = true;
            }            
        }

        if (item.type == "Ranged Weapon") {
            if ((itemData.system.attack.ability != "athletics") && (itemData.system.attack.ability != "firearms")) {
                itemData.system.attack.ability = "custom";
                altered = true;
            }            
        }

        if (altered) {
            await item.update(itemData);

            altered = false;
        }

        if ((item.type == "Armor") || (item.type == "Melee Weapon") || (item.type == "Ranged Weapon") || (item.type == "Fetish")) {
            itemData.system['-=isEquipped'] = null;
            itemData.system['-=isMagical'] = null;

            altered = true;
        }

        if (altered) {
            await item.update(itemData);
            
            altered = false;
        }
    }

    if (_compareVersion(item.system.version, "2.2.0")) {
        const itemData = foundry.utils.duplicate(item);
        itemData.system.version = "2.2.0";

        if (item.type == "Power") {
            itemData.system.details = itemData.system.system;
            itemData['system.-=system'] = null;

            altered = true;
        }
        if (item.type == "Fetish") {
            itemData.system.difficulty = 6;
            altered = true;
        }

        if (altered) {
            await item.update(itemData);
            
            altered = false;
        }
    }

    if (_compareVersion(item.system.version, "2.3.0")) {
        const itemData = foundry.utils.duplicate(item);        

        if (item.type == "Power") {
            if ((item.system.type == "wod.types.art") || (item.system.type == "wod.types.artpower")) {
                itemData.system.game = "changeling";
                altered = true;
            }
            else if ((item.system.type == "wod.types.edge") || (item.system.type == "wod.types.edgepower")) {
                itemData.system.game = "hunter";
                altered = true;
            }
            else if ((item.system.type == "wod.types.discipline") || (item.system.type == "wod.types.disciplinepower") ||
                    (item.system.type == "wod.types.disciplinepath") || (item.system.type == "wod.types.disciplinepathpower") ||
                    (item.system.type == "wod.types.ritual")) {
                itemData.system.game = "vampire";
                altered = true;
            }
            else if ((item.system.type == "wod.types.gift") || (item.system.type == "wod.types.rite")) {
                itemData.system.game = "werewolf";
                altered = true;            
            }            
            else {
                itemData.system.game = "";
                altered = true;
            }
        }

        if (altered) {
            itemData.system.version = "2.3.0";
            await item.update(itemData);
            
            altered = false;
        }
    }

    if (_compareVersion(item.system.version, "3.1.0")) {
        const itemData = foundry.utils.duplicate(item);        

        if (item.type == "Power") {
            if (item.system.type == "wod.types.artpower") {
                itemData.system.property = {
                    arttype: ""
                };
                altered = true;
            }           
            if ((item.system.type == "wod.types.ritual") && (item.system.game == "vampire")) {
                itemData.system.category = "wod.power.thaumaturgy";

                altered = true;
            }
        }

        if (altered) {
            itemData.system.version = "3.1.0";
            await item.update(itemData);
            
            altered = false;
        }
    }

    if (_compareVersion(item.system.version, "3.2.0")) {
        const itemData = foundry.utils.duplicate(item);

        if (item.type == "Power") {
            if (item.system.type == "wod.types.artpower") {
                let property = itemData.system.property;
                let arttype = property['arttype'];

                itemData.system.arttype = arttype;
                altered = true;
            } 
        }

        if (altered) {
            itemData.system.version = "3.2.0";
            await item.update(itemData);
            
            altered = false;
        }
    }

    if (_compareVersion(item.system.version, "3.3.0")) {
        let itemData = foundry.utils.duplicate(item);

        if ((item.type == "Bonus") && ((item.system.parentid != "") && (item.system.parentid != "hispo") && (item.system.parentid != "lupus") && item.actor != null)) {
            console.log(`Bonus found on ${item.actor.name} type ${item.system.type}`);

            let bonus = item.actor.getEmbeddedDocument("Item", item.system.parentid);
            itemData = foundry.utils.duplicate(bonus);

            let bonusData = {
                name: item.name,
                settingtype: item.system.settingtype,
                type: item.system.type,
                value: parseInt(item.system.value),
                isactive: item.system.isactive
            }

            itemData.system.bonuslist[bonus.system.bonuslist.length] = bonusData;
            itemData.system.version = "3.3.0";

            await bonus.update(itemData);   
            console.log(`Adding bonus to ${item.actor.name} bonusname ${item.name}`);

            await item.actor.deleteEmbeddedDocuments("Item", [item._id]);
            console.log(`Removing bonus id ${item._id} bonusname ${item.name}`);
        }
        if (item.type == "Power") {
            if (item.system.type == "wod.types.artpower")  {
                if (item.system.arttype == "wod.power.wyld") {
                    console.log(`Artpower bonusname ${item.name} was type: ${item.system.arttype}`);
                    itemData.system.arttype == "wod.types.wyrd";                    
                }

                altered = true;
            } 
        }

        if (altered) {
            itemData.system.version = "3.3.0";
            await item.update(itemData);
            
            altered = false;
        }
    }
 };

 /**
 * patch an compendium to the latest version
 * @param {Pack} pack   The pack to Update
 * @param migrationVersion   The version that is being pushed at the world
 * 
 */
 export const updateCompendium = async function(pack, migrationVersion) {
    const entity = pack.documentName;
    if ( !["Actor", "Item", "Scene"].includes(entity) ) return;

    // Unlock the pack for editing
    const wasLocked = pack.locked;
    await pack.configure({locked: false});

    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const content = await pack.getDocuments();

    // Iterate over compendium entries - applying fine-tuned migration functions
    for ( let ent of content ) {
        try {
            switch (entity) {
                case "Actor":
                    await updateActor(ent, migrationVersion);
                    break;
                case "Item":
                    await updateItem(ent);
                    break;
                case "Scene":
                    break;
            }
            //console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
        }

        // Handle migration failures
        catch(err) {
            err.message = `Failed migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
            console.error(err);
        }
    }

    // Apply the original locked status for the pack
    await pack.configure({locked: wasLocked});
    console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
 };

  /**
 * Fetches the update information text as an updated is being made.
 * @param installedVersion   The version that is being pushed at the world
 * @param migrationVersion   The version that is being pushed at the world
 * 
 */
 function _getVersionText(installedVersion, migrationVersion) {
    let patch110 = false;
    let patch120 = false;
    let patch130 = false;
    let patch140 = false;
    let patch150 = false;
    let patch160 = false;
    let patch210 = false;
    let patch220 = false;
    let patch230 = false;
    let patch300 = false;
    let patch310 = false;
    let patch320 = false;
    let patch330 = false;
    let patch400 = false;
    let patch410 = false;

    let newfunctions = "";

    try {
        // add the new setting in settings.js
        patch110 = game.settings.get('worldofdarkness', 'patch110');
        patch120 = game.settings.get('worldofdarkness', 'patch120');
        patch130 = game.settings.get('worldofdarkness', 'patch130');
        patch140 = game.settings.get('worldofdarkness', 'patch140');
        patch150 = game.settings.get('worldofdarkness', 'patch150');
        patch160 = game.settings.get('worldofdarkness', 'patch160');
        patch210 = game.settings.get('worldofdarkness', 'patch210');
        patch220 = game.settings.get('worldofdarkness', 'patch220');
        patch230 = game.settings.get('worldofdarkness', 'patch230');
        patch300 = game.settings.get('worldofdarkness', 'patch300');
        patch310 = game.settings.get('worldofdarkness', 'patch310');
        patch320 = game.settings.get('worldofdarkness', 'patch320');
        patch330 = game.settings.get('worldofdarkness', 'patch330');
        patch400 = game.settings.get('worldofdarkness', 'patch400');
        patch410 = game.settings.get('worldofdarkness', 'patch410');
    } 
    catch (e) {
    }

    if (!patch110) {
        game.settings.set('worldofdarkness', 'patch110', true);

        /* newfunctions += "<li>Creature sheet released</li>";
        newfunctions += "<li>Added new System Setting where you can switch to use 5th ed Attributes and 5th ed Willpower.</li>";
        newfunctions += "<li>Added new alternatives in sheet Settings</li>";
        newfunctions += "<li>And a bunch of bug fixes</li>"; */
    }

    if (!patch120) {
        game.settings.set('worldofdarkness', 'patch120', true);

        /* newfunctions += "<li>Added buttons to handle Initiative, Soak and general dice rolling</li>";
        newfunctions += "<li>Added German Translation</li>";
        newfunctions += "<li>Fixed the System can use Foundry rolling of Initiative</li>";
        newfunctions += "<li>Worked on design on the different sheets"; */
    }

    if (!patch130) {
        game.settings.set('worldofdarkness', 'patch130', true);

        /* newfunctions += "<li>Added Changing Breed sheets. Supports Ajaba, Ananasi, Bastet, Corax, Gurahl, Kitsune, Mokole, Nagah, Nuwisha, Ratkin and Rokea</li>";
        newfunctions += "<li>Worked on design on the sheets of the macro buttons</li>";
        newfunctions += "<li>Changed font</li>";
        newfunctions += "<li>Worked on design on the combat section of the sheets</li>";
        newfunctions += "<li>Fixed graphical problems if using German Translation</li>";
        newfunctions += '<li>Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/1">#1</a> a problem where the Attribute Setting in Power Items did not read the setting if you where using the 20th or 5th System setting</li>';
        newfunctions += '<li>Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/2">#2</a> so you can clear permanent Renown</li>'; */
    }

    if (!patch140) {
        game.settings.set('worldofdarkness', 'patch140', true);

        /* newfunctions += "<li>Added Spanish</li>";
        newfunctions += "<li>Added Mage the Ascension</li>";
        newfunctions += "<li>Added Secondary Abilities is added under Settings</li>";
        newfunctions += "<li>[WtA] Added icon to roll frenzy</li>";
        newfunctions += "<li>[WtA] Added new item - Fetish listed in Gear</li>";
        newfunctions += "<li>[MtA] Added icon to roll cast spell</li>";
        newfunctions += "<li>[MtA] Added support to create and cast Rote spells</li>";
        newfunctions += "<li>Fixed graphical problems if using Spanish Translation</li>";     */    
    }

    if (!patch150) {
        game.settings.set('worldofdarkness', 'patch150', true);

        /* newfunctions += "<li>Added Vampire the Masquerade</li>";
        newfunctions += "<li>Added full support for update existing World and Compendiums</li>";
        newfunctions += "<li>Remade all roll functions and redesigned them</li>";
        newfunctions += "<li>Unified the structure of all Actors and Items</li>";
        newfunctions += "<li>Altered design of all power tabs</li>";
        newfunctions += "<li>All item lists are sorted</li>";
        newfunctions += "<li>Fixed a number of bugs and graphical issues</li>";
        newfunctions += '<li>[MtA] Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/124">#124</a> Could not alter a Sphere value</li>';
        newfunctions += '<li>Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/126">#126</a> that pain penalty was not calculated in Rolls</li>';
        newfunctions += '<li>[VtM] Added Cappadocian and Salubri as clans <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/128">#128</a></li>';
        newfunctions += '<li>[WtA] Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/135">#135</a> the shifter image in Changing Breeds sheet had wrong width for English</li>';
        newfunctions += '<li>[MtA] Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/130">#130</a> could not set Affinity Sphere</li>';
        newfunctions += '<li>[MtA] Got report that Features did not work in Notes - Unrepeatable. Added descriptive texts if item has no values</li>';
        newfunctions += '<li>[MTA] Added Technology as a Skill Ability <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/125">#125</a></li>';
        newfunctions += '<li>Added User Permissions <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/141">#141</a> and <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/143">#143</a></li>';
        newfunctions += '<li>Fixed so you could add Ability Specialities <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/145">#145</a></li>';
        newfunctions += '<li>Fixed problems rolling Attributes and Abilities <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/146">#146</a> and <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/147">#147</a></li>';    
        newfunctions += '<li>[VtM] Fixed so you can clear Blood Pool <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/148">#148</a></li>';
        newfunctions += '<li>Added Bone Craft as a selective Skill <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/162">#162</a></li>';    
        newfunctions += '<li>Fixed problems with permissions to alter Actor and Item images <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/143">#143</a></li>';
        newfunctions += '<li>Fixed that spirits could not roll macro buttons <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/163">#163</a></li>'; */
    } 

    if (!patch160) {
        game.settings.set('worldofdarkness', 'patch160', true);

        /* newfunctions += "<li>Major update of the graphics way too much to list here</li>";
        newfunctions += "<li>Can turn off the special sheet fonts</li>";
        newfunctions += "<li>German and Spanish updated</li>";
        newfunctions += "<li>Added an Add-button to add backgrounds, mertis, flaws and blood bounds to the sheet</li>";
        newfunctions += "<li>[WtA] Added rank 6</li>";
        newfunctions += "<li>[WtA] Spirits can have Gifts</li>";
        newfunctions += "<li>[MtA] Added Paradigm, Practice and Instruments</li>";
        newfunctions += "<li>[MtA] Supports Constructs and Familiars</li>";
        newfunctions += "<li>[VtM] Added Blood Bounded people under Info</li>";
        newfunctions += "<li>Fixed a bunish of bugs and stuff of irritation</li>"; */
    }

    if (!patch210) {
        game.settings.set('worldofdarkness', 'patch210', true);

        /* newfunctions += "<li>Added Changeling the Dreaming</li>";
        newfunctions += "<li>Added support automatic fire</li>";
        newfunctions += "<li>Added a Secondary Ability system</li>";
        newfunctions += "<li>Added editors to textfields</li>";
        newfunctions += "<li>Added possibility to specialize abilities e.g Craft</li>";
        newfunctions += "<li>Able you to equip armor that is calculated in soak rolls</li>";
        newfunctions += "<li>Creature sheet supports Chimeras</li>";
        newfunctions += "<li>[WtA] Added Shapeshift button</li>";
        newfunctions += "<li>[VtM] Added support temporary generation</li>";
        newfunctions += "<li>[MtA] Added resonance and fetish support</li>";
        newfunctions += "<li>Fixed a bunish of bugs and other minor issues</li>";  */       
    }

    if (!patch220) {
        game.settings.set('worldofdarkness', 'patch220', true);

        /* newfunctions += "<li>Added Hunter the Reckoning</li>";
        newfunctions += "<li>Removed the 'clear' icon</li>";
        newfunctions += "<li>Added functions to handle Ghouls and Kinfolk</li>";
        newfunctions += "<li>Added more functionality to Other Traits</li>";
        newfunctions += "<li>Expanded the settings of Mortals and Creatures</li>";
        newfunctions += "<li>Added to be able to set max trait of abilities to above 5</li>";
        newfunctions += "<li>[WtA] Added remain active icon</li>";
        newfunctions += "<li>[WtA] Added shapeshift image on token</li>";
        newfunctions += "<li>Fixed a bunish of bugs and other minor issues</li>"; */
    }

    if (!patch230) {
        game.settings.set('worldofdarkness', 'patch230', true);

        /* newfunctions += "<li>Added Demon the Fallen</li>";
        newfunctions += "<li>Added Tours - see Foundry Tour Management</li>";
        newfunctions += "<li>Added a bonus system to use with merit/flaws/powers and so on</li>";
        newfunctions += "<li>Graphical improvements</li>";
        newfunctions += "<li>Improved how specialities are edited</li>";
        newfunctions += "<li>Shows the character's movement under Combat tab</li>";
        newfunctions += "<li>Fixed a bunish of bugs and other minor issues</li>"; */
    }

    if (!patch300) {
        game.settings.set('worldofdarkness', 'patch300', true);

        //newfunctions += "<li>Support Foundry v11</li>";
    }

    if (!patch310) {
        game.settings.set('worldofdarkness', 'patch310', true);

        /* newfunctions += "<li>Biggest update yet.</li>";
        newfunctions += "<li>Total new design with a bunch of improvments on all sheets.</li>";
        newfunctions += "<li>Support for eras in VtM, WtA and MtA</li>";
        newfunctions += "<li>A number of new World settings to help you run the game you wish</li>";
        newfunctions += "<li>[CtD] Improved how to roll arts</li>";
        newfunctions += "<li>[MtA] Added magical items</li>";
        newfunctions += "<li>[MtA] Improved spellcasting dialog</li>";
        newfunctions += "<li>Fixed a bunish of bugs and other minor issues</li>"; */
    }

    if (!patch320) {
        game.settings.set('worldofdarkness', 'patch320', true);

        /* newfunctions += "<li>Added Wraith the Oblivion.</li>";
        newfunctions += "<li>Spirit sheet is no longer supported use Crerature sheet instead.</li>";
        newfunctions += "<li>Added variant sheet support.</li>";
        newfunctions += "<li>[CtD] Added support for changeling variants.</li>";
        newfunctions += "<li>[WtO] Added support for shadow variant.</li>";
        newfunctions += "<li>[Mortal] Added support for mortal variants.</li>";
        newfunctions += "<li>[Creature] Added support for creature variants.</li>"; */
    }

    if (!patch330) {
        game.settings.set('worldofdarkness', 'patch330', true);

        /*newfunctions += "<li>Dark mode setting</li>";
        newfunctions += '<li>Added support for <a href="https://foundryvtt.com/packages/drag-ruler/">Drag Rules module</a></li>';
        newfunctions += "<li>Bonus system is reworked to support adding bonus to items not connected to Actor</li>";
        newfunctions += "<li>[MtA] Added creature variants Familiar and Construct</li>";
        newfunctions += "<li>[VtM] Combination disciplines</li>";
        newfunctions += "<li>[WtA] Added lost breeds Apis, Camazotz and Grondr</li>";
        newfunctions += "<li>Fixed a bunish of bugs and other minor issues</li>";*/
    }

    if (!patch400) {
        game.settings.set('worldofdarkness', 'patch400', true);

        newfunctions += "<li>Foundry version 12</li>";
        newfunctions += '<li>Added Ukrainian support</li>';        
    }

    if (!patch410) {
        game.settings.set('worldofdarkness', 'patch410', true);

        newfunctions += "<li>If creating item to actor edit opens automatically</li>";
        newfunctions += "<li>Textareas can be resized</li>";
        newfunctions += "<li>Added graphical rules if screen is smaller than 1024px width</li>";
        newfunctions += "<li>Added checkbox to add the selection of use of Willpower</li>";
        newfunctions += "<li>Added world setting who Willpower is calculated</li>";
        newfunctions += "<li>Added world setting to add health penalties to damage rolls</li>";
        newfunctions += "<li>[MtA] The graphics of the listing of Rotes has been reworked</li>";
        newfunctions += "<li>[MtA] Can alter a difficulty of a Rote roll manually</li>";
        newfunctions += "<li>Fixed a bunish of bugs and other minor issues</li>";
    }

    // Support Drag Ruler module (notify stabchenfisch about it)

    if (newfunctions == "") {
        newfunctions += 'Issues fixed in version:<br />';

        if (_compareVersion(installedVersion, '4.1.3')) {
            newfunctions += '<li>Adding support for Vampire Classical Era and Age of Living Gods (mortal and vampire sheets). <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/912">[#912]</a></li>';
        }

        if (_compareVersion(installedVersion, '4.1.2')) {
            newfunctions += '<li>Added Realms in the type list as you create/edit Traits (Item).</li>';
            newfunctions += '<li>Added so you can set max value of Traits (Item).</li>';
            newfunctions += '<li>Using Willpower broke the Use-Result-One-Rule. <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/909">[#909]</a></li>';
        }

        if (_compareVersion(installedVersion, '4.1.1')) {
            newfunctions += '<li>The new setting of using health penalties in damage rolls did not work. <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/900">[#900]</a></li>';
            newfunctions += '<li>[VtM] Changes to Combined Disciplines broke the form. <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/903">[#903]</a></li>';
            newfunctions += '<li>[MtA] Mages with Arete higher than 5 did not got their increase in Sphere max level. <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/898">[#898]</a></li>';
        }

        /* if (_compareVersion(installedVersion, '4.0.2')) {
            newfunctions += '<li>Fixed problems to send message to chat.</li>';
        }

        if (_compareVersion(installedVersion, '4.0.1')) {
            newfunctions += '<li>New Werewolves, Demons or Changelings was created in a wrong way which is now fixed. <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/859">[#859], <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/860">[#860], <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/861">[#861]</li>';
            newfunctions += '<li>Setting an item to Active or Equipped now works. <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/858">[#858]</a></li>';
        } */           
    }

    game.settings.set('worldofdarkness', 'worldVersion', migrationVersion);

    const headline = "Version "+migrationVersion+" installed";

    let message = 'New version of the system has been installed. Details can be read at <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki/Changelog#fix-in-410">Changelog</a>.<br /><br />';
    message += 'If you find any problems, are missing things or just would like a feature that the System is lacking, please report these <a href="https://github.com/JohanFalt/Foundry_WoD20/issues">HERE</a><br /><br />';
    message += 'If you wish to read about the system you can do so <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki">HERE</a><br /><br />';

    if (installedVersion != "1") {
        message += '<h2><b>Short Summery of update:</b></h2>';
        message += '<ul>';
        message += newfunctions;
        message += '</ul>';
    } 

    message += '<h2><b>Support my work</b></h2>';
    message += '<a href="https://ko-fi.com/johanfk"><img src="https://ko-fi.com/img/githubbutton_sm.svg" /></a>';

    MessageHelper.printMessage(headline, message);
}

  /**
 * Compares two version numbers to see if the new one is newer than the old one
 * @param oldVersion   The existing version no: e.g. 1.5.9
 * @param newVersion   The new version no: e.g. 1.5.10
 */
  function _compareVersion(oldVersion, newVersion) {
    if (newVersion == "") {
        return false;
    }
  
    if (newVersion == undefined) {
        return false;
    }
  
    if (oldVersion == "") {
      return true;
    }
  
    if (oldVersion.toLowerCase().includes("alpha")) {
      oldVersion = oldVersion.toLowerCase().replace("alpha", "");
      oldVersion = oldVersion.toLowerCase().replace("-", "");
      oldVersion = oldVersion.toLowerCase().replace(" ", "");
    }
  
    if (newVersion.toLowerCase().includes("alpha")) {
      newVersion = newVersion.toLowerCase().replace("alpha", "");
      newVersion = newVersion.toLowerCase().replace("-", "");
      newVersion = newVersion.toLowerCase().replace(" ", "");
    }
  
    if (oldVersion == "1") {
      return true;
    } 
  
    if (oldVersion == newVersion) {
      return false;
    }
  
    try {
      const newfields = newVersion.split(".");
      const oldfields = oldVersion.split(".");
  
      for (let i = 0; i <= 2; i++) {
        let varde1 = 0;
        let varde2 = 0;
        
        if (newfields[i] != undefined) {
          varde1 = newfields[i];
        }
        if (oldfields[i] != undefined) {
          varde2 = oldfields[i];
        }
        if (parseInt(varde1) > parseInt(varde2)) {
          return true;
        }
        else if (parseInt(varde1) < parseInt(varde2)) {
          return false;
        }
      }
    }
    catch {
    }
  
    return false
  }

/**
 * Checks if a certain ability is not part of the main ones.
 * @param ability   
 */
function issecondability(ability) {
    if (CONFIG.worldofdarkness.talents[ability] != undefined) {
        return false;
    }
    if (CONFIG.worldofdarkness.skills[ability] != undefined) {
        return false;
    }
    if (CONFIG.worldofdarkness.knowledges[ability] != undefined) {
        return false;
    }

    return true;
}

function issecondabilitymelee(ability) {
    if (ability == "wod.abilities.do") {
        return true;
    }
    if (ability == "wod.abilities.fencing") {
        return true;
    }

    return false;
}

function issecondabilityranged(ability) {
    if (ability == "wod.abilities.archery") {
        return true;
    }
    if (ability == "wod.abilities.energyweapons") {
        return true;
    }
    if (ability == "wod.abilities.heavyweapons") {
        return true;
    }

    return false;
    
}

function translateSecondaryAbility(label) {
    /* Talents */
    if (label == "wod.abilities.animalkinskip") {
        if (CONFIG.language == "de") {
            return "Tiergespühr";
        }
        else if (CONFIG.language == "es") {
            return "Afinidad Animal";
        }
        else if (CONFIG.language == "fr") {
            return "Animaux";
        }
        else if (CONFIG.language == "it") {
            return "Affinità Animale";
        }
        else {
            return "Animal Kinship";
        }
    }
    if (label == "wod.abilities.blatancy") {
        if (CONFIG.language == "de") {
            return "Dreistigkeit";
        }
        else if (CONFIG.language == "es") {
            return "Descaro";
        }
        else if (CONFIG.language == "fr") {
            return "Aplomb";
        }
        else if (CONFIG.language == "it") {
            return "Vistosità";
        }
        else {
            return "Blatancy";
        }
    }
    if (label == "wod.abilities.carousing") {
        if (CONFIG.language == "de") {
            return "Zechen";
        }
        else if (CONFIG.language == "es") {
            return "Juerga";
        }
        else if (CONFIG.language == "fr") {
            return "Picoler";
        }
        else if (CONFIG.language == "it") {
            return "Gozzovigliare";
        }
        else {
            return "Carousing";
        }
    }
    if (label == "wod.abilities.cooking") {
        if (CONFIG.language == "de") {
            return "Kochen";
        }
        else if (CONFIG.language == "es") {
            return "Cocinar";
        }
        else if (CONFIG.language == "fr") {
            return "Cuisiner";
        }
        else if (CONFIG.language == "it") {
            return "Cucinare";
        }
        else {
            return "Cooking";
        }
    }
    if (label == "wod.abilities.diplomacy") {
        if (CONFIG.language == "de") {
            return "Diplomatie";
        }
        else if (CONFIG.language == "es") {
            return "Diplomacia";
        }
        else if (CONFIG.language == "fr") {
            return "Diplomatie";
        }
        else if (CONFIG.language == "it") {
            return "Diplomazia";
        }
        else {
            return "Diplomacy";
        }
    }
    if (label == "wod.abilities.do") {
        if (CONFIG.language == "es") {
            return "Hacer";
        }
        else {
            return "Do";
        }
    }
    if (label == "wod.abilities.gestures") {
        if (CONFIG.language == "de") {
            return "Gesten";
        }
        else if (CONFIG.language == "es") {
            return "Gestos";
        }
        else if (CONFIG.language == "it") {
            return "Gesti";
        }
        else {
            return "Gestures";
        }
    }
    if (label == "wod.abilities.highritual") {
        if (CONFIG.language == "de") {
            return "Hohes Ritual";
        }
        else if (CONFIG.language == "es") {
            return "Alto Ritual";
        }
        else if (CONFIG.language == "fr") {
            return "Haut rituel";
        }
        else if (CONFIG.language == "it") {
            return "Alto Ritualismo";
        }
        else {
            return "High Ritual";
        }
    }
    if (label == "wod.abilities.instruction") {
        if (CONFIG.language == "de") {
            return "Anleitung";
        }
        else if (CONFIG.language == "es") {
            return "Instrucción";
        }
        else if (CONFIG.language == "fr") {
            return "Enseignement";
        }
        else if (CONFIG.language == "it") {
            return "Insegnare";
        }
        else {
            return "Instruction";
        }
    }
    if (label == "wod.abilities.intrigue") {
        if (CONFIG.language == "de") {
            return "Intrige";
        }
        else if (CONFIG.language == "es") {
            return "Intriga";
        }
        else if (CONFIG.language == "it") {
            return "Intrighi";
        }
        else {
            return "Intrigue";
        }
    }
    if (label == "wod.abilities.intuition") {
        if (CONFIG.language == "de") {
            return "Sechster Sinn";
        }
        else if (CONFIG.language == "es") {
            return "Intuición";
        }
        else if (CONFIG.language == "fr") {
            return "Intuition";
        }
        else if (CONFIG.language == "it") {
            return "Intuizione";
        }
        else {
            return "Intuition";
        }
    }
    if (label == "wod.abilities.legerdemain") {
        if (CONFIG.language == "de") {
            return "Taschenspielertricks";
        }
        else if (CONFIG.language == "es") {
            return "Prestidigitación";
        }
        else if (CONFIG.language == "it") {
            return "Rapidità di Mano";
        }
        else {
            return "Legerdemain";
        }
    }
    if (label == "wod.abilities.luciddreaming") {
        if (CONFIG.language == "de") {
            return "Luzides Träumen";
        }
        else if (CONFIG.language == "es") {
            return "Sueño Lúcido";
        }
        else if (CONFIG.language == "fr") {
            return "Rêve éveillé";
        }
        else if (CONFIG.language == "it") {
            return "Sogno Lucido";
        }
        else {
            return "Lucid Dreaming";
        }
    }
    if (label == "wod.abilities.mimicry") {
        if (CONFIG.language == "de") {
            return "Nachahmung";
        }
        else if (CONFIG.language == "es") {
            return "Mimetismo";
        }
        else if (CONFIG.language == "fr") {
            return "Imitation";
        }
        else if (CONFIG.language == "it") {
            return "Mimica";
        }
        else {
            return "Mimicry";
        }
    }
    if (label == "wod.abilities.negotiation") {
        if (CONFIG.language == "de") {
            return "Verhandlung";
        }
        else if (CONFIG.language == "es") {
            return "Negociación";
        }
        else if (CONFIG.language == "fr") {
            return "Négotiation";
        }
        else if (CONFIG.language == "it") {
            return "Negoziare";
        }
        else {
            return "Negotiation";
        }
    }
    if (label == "wod.abilities.newspeak") {
        if (CONFIG.language == "de") {
            return "Newspeak";
        }
        else if (CONFIG.language == "es") {
            return "Neolengua";
        }
        else if (CONFIG.language == "it") {
            return "Propaganda";
        }
        else {
            return "Newspeak";
        }
    }
    if (label == "wod.abilities.scan") {
        if (CONFIG.language == "de") {
            return "Scannen";
        }
        else if (CONFIG.language == "es") {
            return "Otear";
        }
        else {
            return "Scan";
        }
    }
    if (label == "wod.abilities.scrounging") {
        if (CONFIG.language == "de") {
            return "Schnorren";
        }
        else if (CONFIG.language == "es") {
            return "Rebuscar";
        }
        else if (CONFIG.language == "it") {
            return "Cercare";
        }
        else {
            return "Scrounging";
        }
    }
    if (label == "wod.abilities.seduction") {
        if (CONFIG.language == "de") {
            return "Verführung";
        }
        else if (CONFIG.language == "es") {
            return "Sedución";
        }
        else if (CONFIG.language == "fr") {
            return "Séduction";
        }
        else if (CONFIG.language == "it") {
            return "Sedurre";
        }
        else {
            return "Seduction";
        }
    }
    if (label == "wod.abilities.style") {
        if (CONFIG.language == "de") {
            return "Stil";
        }
        else if (CONFIG.language == "es") {
            return "Estilo";
        }
        else if (CONFIG.language == "it") {
            return "Stile";
        }
        else {
            return "Style";
        }
    }

    /* Skills */
    if (label == "wod.abilities.archery") {
        if (CONFIG.language == "de") {
            return "Bogenschießen";
        }
        else if (CONFIG.language == "es") {
            return "Arqueria";
        }
        else if (CONFIG.language == "fr") {
            return "Tir à l'arc";
        }
        else if (CONFIG.language == "it") {
            return "Tiro con l'Arco";
        }
        else {
            return "Archery";
        }
    }
    if (label == "wod.abilities.biotech") {
        if (CONFIG.language == "de") {
            return "Biotechnologie";
        }
        else if (CONFIG.language == "es") {
            return "Biotecnología";
        }
        else if (CONFIG.language == "fr") {
            return "Biotechnologie";
        }
        else if (CONFIG.language == "it") {
            return "Biotecnologia";
        }
        else {
            return "Biotech";
        }
    }
    if (label == "wod.abilities.blindfighting") {
        if (CONFIG.language == "de") {
            return "Blind Kämpfen";
        }
        else if (CONFIG.language == "es") {
            return "Lucha a Ciegas";
        }
        else if (CONFIG.language == "fr") {
            return "Combat aveugle";
        }
        else if (CONFIG.language == "it") {
            return "Combattere alla Cieca";
        }
        else {
            return "Blind Fighting";
        }
    }
    if (label == "wod.abilities.bonecraft") {
        if (CONFIG.language == "de") {
            return "Knochenkunst";
        }
        else if (CONFIG.language == "es") {
            return "Moldear Hueso";
        }
        else if (CONFIG.language == "it") {
            return "Artigianato di Ossa";
        }
        else {
            return "Bone Craft";
        }
    }
    if (label == "wod.abilities.climbing") {
        if (CONFIG.language == "de") {
            return "Klettern";
        }
        else if (CONFIG.language == "es") {
            return "Escalada";
        }
        else if (CONFIG.language == "it") {
            return "Scalare";
        }
        else {
            return "Climbing";
        }
    }
    if (label == "wod.abilities.commerce") {
        if (CONFIG.language == "de") {
            return "Handel";
        }
        else if (CONFIG.language == "es") {
            return "Comerciar";
        }
        else if (CONFIG.language == "it") {
            return "Commercio";
        }
        else {
            return "Commerce";
        }
    }
    if (label == "wod.abilities.disguise") {
        if (CONFIG.language == "de") {
            return "Verkleidung";
        }
        else if (CONFIG.language == "es") {
            return "Disfraz";
        }
        else if (CONFIG.language == "it") {
            return "Camuffare";
        }
        else {
            return "Disguise";
        }
    }
    if (label == "wod.abilities.elusion") {
        if (CONFIG.language == "de") {
            return "Trugbild";
        }
        else if (CONFIG.language == "es") {
            return "Elusion";
        }
        else if (CONFIG.language == "it") {
            return "Eludere";
        }
        else {
            return "Elusion";
        }
    }
    if (label == "wod.abilities.energyweapons") {
        if (CONFIG.language == "de") {
            return "Energiewaffen";
        }
        else if (CONFIG.language == "es") {
            return "Armas de Energía";
        }
        else if (CONFIG.language == "fr") {
            return "Armes à Energie";
        }
        else if (CONFIG.language == "it") {
            return "Armi a Energia";
        }
        else {
            return "Energy Weapons";
        }
    }
    if (label == "wod.abilities.escapology") {
        if (CONFIG.language == "de") {
            return "Fesselung";
        }
        else if (CONFIG.language == "es") {
            return "Escapología";
        }
        else if (CONFIG.language == "fr") {
            return "Art de l'évasion";
        }
        else if (CONFIG.language == "it") {
            return "Artista della Fuga";
        }
        else {
            return "Escapology";
        }
    }
    if (label == "wod.abilities.fastdraw") {
        if (CONFIG.language == "de") {
            return "Schnellziehen";
        }
        else if (CONFIG.language == "es") {
            return "Desenfundado Rápido";
        }
        else if (CONFIG.language == "fr") {
            return "Duel au Colt";
        }
        else {
            return "Fast-draw";
        }
    }
    if (label == "wod.abilities.fasttalk") {
        if (CONFIG.language == "de") {
            return "Fast-talk";
        }
        else if (CONFIG.language == "es") {
            return "Charlatanería";
        }
        else if (CONFIG.language == "it") {
            return "Parlata Veloce";
        }
        else {
            return "Fast-talk";
        }
    }
    if (label == "wod.abilities.fencing") {
        if (CONFIG.language == "de") {
            return "Fechten";
        }
        else if (CONFIG.language == "es") {
            return "Esgrima";
        }
        else {
            return "Fencing";
        }
    }
    if (label == "wod.abilities.fortunetelling") {
        if (CONFIG.language == "de") {
            return "Weisagung";
        }
        else if (CONFIG.language == "es") {
            return "Clarividencia";
        }
        else if (CONFIG.language == "fr") {
            return "Voyance";
        }
        else if (CONFIG.language == "it") {
            return "Divinare";
        }
        else {
            return "Fortune-telling";
        }
    }
    if (label == "wod.abilities.gambling") {
        if (CONFIG.language == "de") {
            return "Glückspiel";
        }
        else if (CONFIG.language == "es") {
            return "Juegos de Azar";
        }
        else if (CONFIG.language == "fr") {
            return "Jeux d'argent";
        }
        else if (CONFIG.language == "it") {
            return "Azzardo";
        }
        else {
            return "Gambling";
        }
    }
    if (label == "wod.abilities.heavyweapons") {
        if (CONFIG.language == "de") {
            return "Schwere Waffen";
        }
        else if (CONFIG.language == "es") {
            return "Armamento Pesado";
        }
        else if (CONFIG.language == "fr") {
            return "Armes Lourdes";
        }
        else if (CONFIG.language == "it") {
            return "Armi Pesanti";
        }
        else {
            return "Heavy Weapons";
        }
    }
    if (label == "wod.abilities.hypertech") {
        if (CONFIG.language == "de") {
            return "Hypertechnologie";
        }
        else if (CONFIG.language == "es") {
            return "Hipertecnología";
        }
        else if (CONFIG.language == "fr") {
            return "Hypertechnologie";
        }
        else if (CONFIG.language == "it") {
            return "Ipertecnologia";
        }
        else {
            return "Hypertech";
        }
    }
    if (label == "wod.abilities.hypnotism") {
        if (CONFIG.language == "de") {
            return "Hypnose";
        }
        else if (CONFIG.language == "es") {
            return "Hipnotismo";
        }
        else if (CONFIG.language == "fr") {
            return "Hypnotisme";
        }
        else if (CONFIG.language == "it") {
            return "Ipnotizzare";
        }
        else {
            return "Hypnotism";
        }
    }
    if (label == "wod.abilities.hunting") {
        if (CONFIG.language == "de") {
            return "Jagen";
        }
        else if (CONFIG.language == "es") {
            return "Caza";
        }
        else if (CONFIG.language == "fr") {
            return "";
        }
        else if (CONFIG.language == "it") {
            return "";
        }
        else {
            return "Hunting";
        }
    }
    if (label == "wod.abilities.juryrigging") {
        if (CONFIG.language == "de") {
            return "Jury-Täuschung";
        }
        else if (CONFIG.language == "es") {
            return "Apañar";
        }
        else if (CONFIG.language == "it") {
            return "Cacciare";
        }
        else {
            return "Jury-rigging";
        }
    }
    if (label == "wod.abilities.microgravityoperations") {
        if (CONFIG.language == "de") {
            return "Mikrogravitationsoperationen";
        }
        else if (CONFIG.language == "es") {
            return "Operaciones en Microgravedad";
        }
        else if (CONFIG.language == "it") {
            return "Operare in Microgravità";
        }
        else {
            return "Microgravity Operations";
        }
    }
    if (label == "wod.abilities.misdirections") {
        if (CONFIG.language == "de") {
            return "Irreführungen";
        }
        else if (CONFIG.language == "es") {
            return "Distracción";
        }
        else if (CONFIG.language == "it") {
            return "Reindirizzare";
        }
        else {
            return "Misdirections";
        }
    }
    if (label == "wod.abilities.networking") {
        if (CONFIG.language == "de") {
            return "Netzwerkarbeit";
        }
        else if (CONFIG.language == "es") {
            return "Hacer Contactos";
        }
        else {
            return "Net-working";
        }
    }
    if (label == "wod.abilities.pilot") {
        if (CONFIG.language == "de") {
            return "Pilot";
        }
        else if (CONFIG.language == "es") {
            return "Pilotaje";
        }
        else if (CONFIG.language == "fr") {
            return "Piloter";
        }
        else if (CONFIG.language == "it") {
            return "Pilotare";
        }
        else {
            return "Pilot";
        }
    }
    if (label == "wod.abilities.psychology") {
        if (CONFIG.language == "de") {
            return "Psychologie";
        }
        else if (CONFIG.language == "es") {
            return "Psicología";
        }
        else if (CONFIG.language == "fr") {
            return "Psychologie";
        }
        else if (CONFIG.language == "it") {
            return "Psicoanalizzare";
        }
        else {
            return "Psychology";
        }
    }
    if (label == "wod.abilities.riding") {
        if (CONFIG.language == "de") {
            return "Reiten";
        }
        else if (CONFIG.language == "es") {
            return "Equitación";
        }
        else if (CONFIG.language == "fr") {
            return "Equitation";
        }
        else if (CONFIG.language == "it") {
            return "Cavalcare";
        }
        else {
            return "Riding";
        }
    }
    if (label == "wod.abilities.security") {
        if (CONFIG.language == "de") {
            return "Sicherheit";
        }
        else if (CONFIG.language == "es") {
            return "Seguridad";
        }
        else if (CONFIG.language == "fr") {
            return "Securité";
        }
        else if (CONFIG.language == "it") {
            return "Sicurezza";
        }
        else {
            return "Security";
        }
    }
    if (label == "wod.abilities.speedreading") {
        if (CONFIG.language == "de") {
            return "Schnelllesen";
        }
        else if (CONFIG.language == "es") {
            return "Lectura Rápida";
        }
        else if (CONFIG.language == "it") {
            return "Lettura Rapida";
        }
        else {
            return "Speed-reading";
        }
    }
    if (label == "wod.abilities.swimming") {
        if (CONFIG.language == "de") {
            return "Schwimmen";
        }
        else if (CONFIG.language == "es") {
            return "Natación";
        }
        else if (CONFIG.language == "it") {
            return "Nuotare";
        }
        else {
            return "Swimming";
        }
    }
    if (label == "wod.abilities.torture") {
        if (CONFIG.language == "de") {
            return "Folter";
        }
        else if (CONFIG.language == "es") {
            return "Tortura";
        }
        else if (CONFIG.language == "it") {
            return "Torturare";
        }
        else {
            return "Torture";
        }
    }

    /* Knowledges */
    if (label == "wod.abilities.ancientmedicine") {
        if (CONFIG.language == "de") {
            return "Antike Medizin";
        }
        if (CONFIG.language == "fr") {
            return "Médecine Ancienne";
        }
        if (CONFIG.language == "it") {
            return "Medicina Antica";
        }
        if (CONFIG.language == "es") {
            return "Medicina Antigua";
        }
        else {
            return "Ancient Medicine";
        }
    }
    if (label == "wod.abilities.astrology") {
        if (CONFIG.language == "de") {
            return "Astrologie";
        }
        if (CONFIG.language == "fr") {
            return "Astrologie";
        }
        if (CONFIG.language == "it") {
            return "Astrologia";
        }
        if (CONFIG.language == "es") {
            return "Astrología";
        }
        else {
            return "Astrology";
        }
    }
    if (label == "wod.abilities.bureaucracy") {
        if (CONFIG.language == "de") {
            return "Bürokratie";
        }
        else if (CONFIG.language == "es") {
            return "Burocracia";
        }
        else if (CONFIG.language == "fr") {
            return "Bureaucracie";
        }
        else if (CONFIG.language == "it") {
            return "Costrutti Politici";
        }
        else {
            return "Bureaucracy";
        }
    }
    if (label == "wod.abilities.chantry") {
        if (CONFIG.language == "de") {
            return "Glaubenssysteme";
        }
        else if (CONFIG.language == "es") {
            return "Capilla";
        }
        else if (CONFIG.language == "fr") {
            return "Fondation";
        }
        else {
            return "Chantry";
        }
    }
    if (label == "wod.abilities.chemistry") {
        if (CONFIG.language == "de") {
            return "Chemie";
        }
        else if (CONFIG.language == "es") {
            return "Química";
        }
        else if (CONFIG.language == "fr") {
            return "Chimie";
        }
        else if (CONFIG.language == "it") {
            return "Chimica";
        }
        else {
            return "Chemistry";
        }
    }
    if (label == "wod.abilities.conspiracytheory") {
        if (CONFIG.language == "de") {
            return "Verschwörungstheorie";
        }
        else if (CONFIG.language == "es") {
            return "Teorías de la Conspiración";
        }
        else if (CONFIG.language == "it") {
            return "Teorie Complottiste";
        }
        else {
            return "Conspiracy Theor";
        }
    }
    if (label == "wod.abilities.covertculture") {
        if (CONFIG.language == "de") {
            return "Verborgene Kultur";
        }
        else if (CONFIG.language == "es") {
            return "Cultura Encubierta";
        }
        else if (CONFIG.language == "it") {
            return "Cultura Nascosta";
        }
        else {
            return "Covert Culture";
        }
    }
    if (label == "wod.abilities.cryptography") {
        if (CONFIG.language == "de") {
            return "Kryptographie";
        }
        else if (CONFIG.language == "es") {
            return "Criptografía";
        }
        else if (CONFIG.language == "fr") {
            return "Cryptographie";
        }
        else if (CONFIG.language == "it") {
            return "Criptografia";
        }
        else {
            return "Cryptography";
        }
    }
    if (label == "wod.abilities.culturalsavvy") {
        if (CONFIG.language == "de") {
            return "Kulturelles Geschick";
        }
        else if (CONFIG.language == "es") {
            return "Destreza Cultural";
        }
        else if (CONFIG.language == "it") {
            return "Esperto Culturale";
        }

        else {
            return "Cultural Savvy";
        }
    }
    if (label == "wod.abilities.culture") {
        if (CONFIG.language == "de") {
            return "Kultur";
        }
        else if (CONFIG.language == "es") {
            return "Cultura";
        }
        else {
            return "Culture";
        }
    }
    if (label == "wod.abilities.customs") {
        if (CONFIG.language == "de") {
            return "Bräuche";
        }
        else if (CONFIG.language == "es") {
            return "Costumbres";
        }
        else if (CONFIG.language == "fr") {
            return "Coutumes";
        }
        else if (CONFIG.language == "it") {
            return "Usanze";
        }
        else {
            return "Customs";
        }
    }
    if (label == "wod.abilities.hearthwisdom") {
        if (CONFIG.language == "de") {
            return "Herzensweisheit";
        }
        else if (CONFIG.language == "es") {
            return "Sabiduria de corazón";
        }
        else if (CONFIG.language == "fr") {
            return "Sagesse populaire";
        }
        else if (CONFIG.language == "it") {
            return "Saggezza Popolare";
        }
        else {
            return "Hearth Wisdom";
        }
    }
    if (label == "wod.abilities.herbalism") {
        if (CONFIG.language == "de") {
            return "Kräuterkunde";
        }
        else if (CONFIG.language == "es") {
            return "Herbalismo";
        }
        else if (CONFIG.language == "fr") {
            return "Herboristerie";
        }
        else if (CONFIG.language == "it") {
            return "Erboristeria";
        }
        else {
            return "Herbalism";
        }
    }
    if (label == "wod.abilities.helmsman") {
        if (CONFIG.language == "de") {
            return "Steuermann";
        }
        else if (CONFIG.language == "es") {
            return "Helmsman";
        }
        else if (CONFIG.language == "it") {
            return "Navigare (Astronavi)";
        }
        else {
            return "Helmsman";
        }
    }
    if (label == "wod.abilities.history") {
        if (CONFIG.language == "de") {
            return "Geschichte";
        }
        else if (CONFIG.language == "es") {
            return "Historia";
        }
        else if (CONFIG.language == "fr") {
            return "Histoire";
        }
        else if (CONFIG.language == "it") {
            return "Storia";
        }
        else {
            return "History";
        }
    }
    if (label == "wod.abilities.legends") {
        if (CONFIG.language == "de") {
            return "Legenden";
        }
        else if (CONFIG.language == "es") {
            return "Leyendas";
        }
        else if (CONFIG.language == "fr") {
            return "Légendes";
        }
        else if (CONFIG.language == "it") {
            return "Leggende";
        }
        else {
            return "Legends";
        }
    }
    if (label == "wod.abilities.media") {
        if (CONFIG.language == "de") {
            return "Medien";
        }
        else if (CONFIG.language == "es") {
            return "Medios";
        }
        else if (CONFIG.language == "fr") {
            return "Média";
        }
        else if (CONFIG.language == "it") {
            return "Media";
        }
        else {
            return "Media";
        }
    }
    if (label == "wod.abilities.mythology") {
        if (CONFIG.language == "de") {
            return "Mythologie";
        }
        if (CONFIG.language == "fr") {
            return "Mythologie";
        }
        if (CONFIG.language == "it") {
            return "Mitologia";
        }
        if (CONFIG.language == "es") {
            return "Mitología";
        }
        else {
            return "Mythology";
        }
    }
    if (label == "wod.abilities.philosophy") {
        if (CONFIG.language == "de") {
            return "Philosophie";
        }
        if (CONFIG.language == "fr") {
            return "Philosophie";
        }
        if (CONFIG.language == "it") {
            return "Filosofia";
        }
        if (CONFIG.language == "es") {
            return "Filosofía";
        }
        else {
            return "Philosophy";
        }
    }
    if (label == "wod.abilities.ritualistics") {
        if (CONFIG.language == "de") {
            return "Ritualistik";
        }
        if (CONFIG.language == "fr") {
            return "Ritualistique";
        }
        if (CONFIG.language == "it") {
            return "Ritualistica";
        }
        if (CONFIG.language == "es") {
            return "Ritualística";
        }
        else {
            return "Ritualistics";
        }
    }
    if (label == "wod.abilities.powerbrokering") {
        if (CONFIG.language == "es") {
            return "Juegos de Poder";
        }
        else {
            return "Power-brokering";
        }
    }
    if (label == "wod.abilities.propaganda") {
        if (CONFIG.language == "fr") {
            return "Propagande";
        }
        else {
            return "Propaganda";
        }
    }
    if (label == "wod.abilities.religion") {
        if (CONFIG.language == "es") {
            return "Religión";
        }
        else if (CONFIG.language == "it") {
            return "Religione";
        }
        else {
            return "Religion";
        }
    }
    if (label == "wod.abilities.seneschal") {
        if (CONFIG.language == "es") {
            return "Senescal";
        }
        else if (CONFIG.language == "it") {
            return "Governo Domestico";
        }
        else {
            return "Seneschal";
        }
    }
    if (label == "wod.abilities.theology") {
        if (CONFIG.language == "de") {
            return "Theologie";
        }
        else if (CONFIG.language == "es") {
            return "Tecnología";
        }
        else if (CONFIG.language == "fr") {
            return "Théologie";
        }
        else if (CONFIG.language == "it") {
            return "Teologia";
        }
        else {
            return "Theology";
        }
    }
    if (label == "wod.abilities.unconventionalwarfare") {
        if (CONFIG.language == "de") {
            return "Unkonventionelle Kriegsführung";
        }
        else if (CONFIG.language == "es") {
            return "Unconventional Warfare";
        }
        else if (CONFIG.language == "it") {
            return "Terrorismo";
        }
        else {
            return "Unconventional Warfare";
        }
    }
    if (label == "wod.abilities.vice") {
        if (CONFIG.language == "de") {
            return "Laster";
        }
        else if (CONFIG.language == "es") {
            return "Vicio";
        }
        else if (CONFIG.language == "fr") {
            return "Débauche";
        }
        else if (CONFIG.language == "it") {
            return "Vizi";
        }
        else {
            return "Vice";
        }
    }
    if (label == "wod.abilities.writing") {
        if (CONFIG.language == "de") {
            return "Schreiben";
        }
        if (CONFIG.language == "fr") {
            return "Écriture";
        }
        if (CONFIG.language == "it") {
            return "Scrittura";
        }
        if (CONFIG.language == "es") {
            return "Escritura";
        }
        else {
            return "Writing";
        }
    }

    return label;
}
