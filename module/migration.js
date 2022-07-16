import ActionHelper from "./scripts/action-helpers.js";
import { getImage } from "./items/item-sheet.js";

/**
 * Time to update the entire world and patch it correctly
 * @param installedVersion   The version that is installed
 * @param migrationVersion   The version that is being pushed at the world
 */
export const UpdateWorld = async function (installedVersion, migrationVersion) {
    let updateWorld = false;
    let isError = false;

    if (compareVersion(installedVersion, migrationVersion)) {
        updateWorld = true;

        ui.notifications.warn(`Updating World from version ${installedVersion} to ${migrationVersion} do not close your game or shut down your server. Please wait this can take a while...`, {permanent: true});
        console.log(`Updating from ${installedVersion} to ${migrationVersion}`);

        ActionHelper.printMessage("<h1><b>Updating World</b></h1>", "As you update the world each entity within it will be updated to the newest version. Depending on how large your world is this can take some time.<br />First is all Actors, then all Items and last any Compendium that are installed.");
        ActionHelper.printMessage("<h3>Starting with Actors</h3>", "");
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
        ActionHelper.printMessage("<h3>Actors done</h3>", "");

        ActionHelper.printMessage("<h3>Starting with World Items</h3>", "");
        //World Items
        for (const item of game.items) {
            try {
                await updateItem(item, migrationVersion);
            } catch(err) {
                err.message = `Failed migration for Actor Item ${item.name}: ${err.message}`;
                console.error(err);
                isError = true;
            }
        }
        ActionHelper.printMessage("<h3>Items done</h3>", "");

        ActionHelper.printMessage("<h3>Starting with World Compendiums</h3>", "");
        // World Compendiums
        for ( let pack of game.packs ) {
            try {
                if ( pack.metadata.package !== "world" ) continue;
                if ( !["Actor", "Item", "Scene"].includes(pack.documentName) ) continue;
                await updateCompendium(pack, migrationVersion);
            } catch(err) {
                console.error(err);
                isError = true;
            }
        }
        ActionHelper.printMessage("<h3>Compendiums done</h3>", "");

        console.log("Update completed!"); 

        ActionHelper.printMessage("<h3>Checking character settings</h3>", "");
    }

    try {
        await this.updates();
    }
    catch (e) {
    }

    if (updateWorld) {
        ui.notifications.info(`World updated to version ${game.system.data.version}!`, {permanent: true});
    }
    else {
        ui.notifications.info("Done!", {permanent: true});
    }

    if (isError) {
        ui.notifications.error(`An error occured during the system migration. Please check the console (F12) for details.`, {permanent: true});
    }
    else if (updateWorld) {
        getVersionText(installedVersion, migrationVersion);  
    }
}


/**
 * Function to keep the world up-to-date with possible World settings that you might have altered since last time it opened.
 */
export const updates = async () => {
    console.log('WoD | Settings starts');

    let attributeSettings = "20th";
    let rollSettings = true;

    try {
        attributeSettings = game.settings.get("worldofdarkness", "attributeSettings");
        rollSettings = game.settings.get('worldofdarkness', 'advantageRolls');
    } 
    catch (e) {
        console.log("Fel uppstod i migration.js");
    }

    // handle Game settings  
    let willpower = -1;
    let gnosis = -1;
    let rage = -1;
    let totalinit = -1;

    for (const actor of game.actors) {
        const actorData = duplicate(actor);

        if (actor.type != CONFIG.wod.sheettype.spirit) {
            
            if (attributeSettings == "20th") {
                for (const attribute in CONFIG.wod.attributes20) {
                    actorData.data.attributes[attribute].isvisible = true;
                }
                
                actorData.data.attributes.composure.isvisible = false;
                actorData.data.attributes.resolve.isvisible = false;
            }
            else if (attributeSettings == "5th") {
                for (const attribute in CONFIG.wod.attributes) {
                    actorData.data.attributes[attribute].isvisible = true;
                }

                actorData.data.attributes.appearance.isvisible = false;
                actorData.data.attributes.perception.isvisible = false;
            }

            if (rollSettings) {
                if ((actor.type != CONFIG.wod.sheettype.mortal) && (actor.type != CONFIG.wod.sheettype.vampire) && (actor.type != CONFIG.wod.sheettype.mage)) {
                rage = actor.data.data.rage.permanent; 
                gnosis = actor.data.data.gnosis.permanent;
                }
                
                willpower = actor.data.data.willpower.permanent; 
            }
            else {
                if ((actor.type != CONFIG.wod.sheettype.mortal) && (actor.type != CONFIG.wod.sheettype.vampire) && (actor.type != CONFIG.wod.sheettype.mage)) {
                rage = parseInt(actor.data.data.rage.permanent) > parseInt(actor.data.data.rage.temporary) ? actor.data.data.rage.temporary : actor.data.data.rage.permanent; 
                gnosis = parseInt(actor.data.data.gnosis.permanent) > parseInt(actor.data.data.gnosis.temporary) ? actor.data.data.gnosis.temporary : actor.data.data.gnosis.permanent;
                }
                
                willpower = parseInt(actor.data.data.willpower.permanent) > parseInt(actor.data.data.willpower.temporary) ? actor.data.data.willpower.temporary : actor.data.data.willpower.permanent; 
            }

            if ((actor.type != CONFIG.wod.sheettype.mortal) && (actor.type != CONFIG.wod.sheettype.vampire) && (actor.type != CONFIG.wod.sheettype.mage)) {
                actorData.data.rage.roll = parseInt(rage);
                actorData.data.gnosis.roll = parseInt(gnosis);
            }

            actorData.data.willpower.roll = parseInt(willpower);

            for (const item of actor.items) {

                let hasChanged = false;
                const itemData = duplicate(item);
                const imgUrl = getImage(item);

                if (imgUrl != "") {                    
                    hasChanged = itemData.img == imgUrl ? false : true;
                    itemData.img = imgUrl;
                }

                if (hasChanged) {
                    await item.update(itemData);
                }
            }
        }

        totalinit = parseInt(actor.data.data.initiative.base) + parseInt(actor.data.data.initiative.bonus);
        actorData.data.initiative.total = parseInt(totalinit);

        await actor.update(actorData);
    }
    
    for (const item of game.items) {
        let hasChanged = false;
        const itemData = duplicate(item);
        const imgUrl = getImage(item);

        if (imgUrl != "") {                    
            hasChanged = itemData.img == imgUrl ? false : true;
            itemData.img = imgUrl;
        }

        if (hasChanged) {
            await item.update(itemData);
        }
    }
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
    if (compareVersion(actor.data.data.settings.version, "1.5.0")) {
        
        const updateData = duplicate(actor);

        updateData.data.settings.version = migrationVersion;

        if(updateData.data.settings.created != undefined) {
            updateData.data.settings.iscreated = updateData.data.settings.created;   
        }        

        if(updateData.data.settings.soak.bashing.roll != undefined) {
            updateData.data.settings.soak.bashing.isrollable = updateData.data.settings.soak.bashing.roll;            
        }

        if(updateData.data.settings.soak.lethal.roll != undefined) {
            updateData.data.settings.soak.lethal.isrollable = updateData.data.settings.soak.lethal.roll;            
        }        

        if(updateData.data.settings.soak.aggravated.roll != undefined) {
            updateData.data.settings.soak.aggravated.isrollable = updateData.data.settings.soak.aggravated.roll;            
        }        

        if(updateData.data.conditions.ignorepain != undefined) {
            updateData.data.conditions.isignoringpain = updateData.data.conditions.ignorepain;        
        }
        if(updateData.data.conditions.stunned != undefined) {
        updateData.data.conditions.isstunned = updateData.data.conditions.stunned;
        }
        

        if (updateData.type != CONFIG.wod.sheettype.spirit) {
            for (const attribute in updateData.data.attributes) {
                if(updateData.data.attributes[attribute].visible != undefined) {
                    updateData.data.attributes[attribute].isvisible = updateData.data.attributes[attribute].visible;   
                }
            }

            for (const ability in updateData.data.abilities.talent) {
                if(updateData.data.abilities.talent[ability].visible != undefined) {
                    updateData.data.abilities.talent[ability].isvisible = updateData.data.abilities.talent[ability].visible;  
                }                  
            }

            for (const ability in updateData.data.abilities.skill) {
                if(updateData.data.abilities.skill[ability].visible != undefined) {
                    updateData.data.abilities.skill[ability].isvisible = updateData.data.abilities.skill[ability].visible; 
                }
            }

            for (const ability in updateData.data.abilities.knowledge) {
                if(updateData.data.abilities.knowledge[ability].visible != undefined) {
                    updateData.data.abilities.knowledge[ability].isvisible = updateData.data.abilities.knowledge[ability].visible; 
                }
            }
        }

        if (updateData.type == CONFIG.wod.sheettype.werewolf) {
            if(updateData.data.conditions.frenzy != undefined) {
                updateData.data.conditions.isfrenzy = updateData.data.conditions.frenzy;
            }

            if(updateData.data.shapes.homid.active != undefined) {
                updateData.data.shapes.homid.isactive = updateData.data.shapes.homid.active;
            }
            if(updateData.data.shapes.glabro.active != undefined) {
                updateData.data.shapes.glabro.isactive = updateData.data.shapes.glabro.active;
            }
            if(updateData.data.shapes.crinos.active != undefined) {
                updateData.data.shapes.crinos.isactive = updateData.data.shapes.crinos.active;
            }
            if(updateData.data.shapes.hispo.active != undefined) {
                updateData.data.shapes.hispo.isactive = updateData.data.shapes.hispo.active;
            }
            if(updateData.data.shapes.lupus.active != undefined) {
                updateData.data.shapes.lupus.isactive = updateData.data.shapes.lupus.active;
            }
        } 

        await actor.update(updateData);

        updateData.data.settings['-=created'] = null;
        updateData.data.settings.soak.bashing['-=roll'] = null;
        updateData.data.settings.soak.lethal['-=roll'] = null;
        updateData.data.settings.soak.aggravated['-=roll'] = null;

        updateData.data.conditions['-=ignorepain'] = null;
        updateData.data.conditions['-=stunned'] = null;

        if (updateData.type != CONFIG.wod.sheettype.spirit) {
            for (const attribute in updateData.data.attributes) {
                updateData.data.attributes[attribute]['-=visible'] = null;
            }

            for (const ability in updateData.data.abilities.talent) {
                updateData.data.abilities.talent[ability]['-=visible'] = null;
            }

            for (const ability in updateData.data.abilities.skill) {
                updateData.data.abilities.skill[ability]['-=visible'] = null;                   
            }

            for (const ability in updateData.data.abilities.knowledge) {
                updateData.data.abilities.knowledge[ability]['-=visible'] = null;                   
            }
        }

        if (updateData.type == CONFIG.wod.sheettype.werewolf) {
            updateData.data.conditions['-=frenzy'] = null;

            updateData.data.shapes.homid['-=active'] = null;
            updateData.data.shapes.glabro['-=active'] = null;
            updateData.data.shapes.crinos['-=active'] = null;
            updateData.data.shapes.hispo['-=active'] = null;
            updateData.data.shapes.lupus['-=active'] = null;
        } 

        await actor.update(updateData);
    }
    if (compareVersion(actor.data.data.settings.version, "1.6.0")) {
        const updateData = duplicate(actor);
        let update = false;
        updateData.data.settings.version = migrationVersion;

        if (updateData.type == CONFIG.wod.sheettype.creature) {
            update = true;            

            updateData.data.settings.hasrage = true;
            updateData.data.settings.hasgnosis = true;
            updateData.data.settings.haswillpower = true;
            updateData.data.settings.hasessence = false;
            updateData.data.settings.hasbloodpool = false;                    
        }   
        if (updateData.type == CONFIG.wod.sheettype.werewolf) {
            update = true;  

            if (updateData.data.tribe == "Black Furies") {
                updateData.data.tribe = "wod.bio.werewolf.blackfuries";
            }
            if (updateData.data.tribe == "Bone Gnawers") {
                updateData.data.tribe = "wod.bio.werewolf.bonegnawer";
            }
            if (updateData.data.tribe == "Children of Gaia") {
                updateData.data.tribe = "wod.bio.werewolf.childrenofgaia";
            }
            if (updateData.data.tribe == "Fianna") {
                updateData.data.tribe = "wod.bio.werewolf.fianna";
            }
            if (updateData.data.tribe == "Get of Fenris") {
                updateData.data.tribe = "wod.bio.werewolf.getoffenris";
            }
            if (updateData.data.tribe == "Glass Walkers") {
                updateData.data.tribe = "wod.bio.werewolf.glasswalker";
            }
            if (updateData.data.tribe == "Red Talons") {
                updateData.data.tribe = "wod.bio.werewolf.redtalon";
            }
            if (updateData.data.tribe == "Shadow Lords") {
                updateData.data.tribe = "wod.bio.werewolf.shadowlord";
            }
            if (updateData.data.tribe == "Silent Striders") {
                updateData.data.tribe = "wod.bio.werewolf.silentstrider";
            }
            if (updateData.data.tribe == "Silver Fangs") {
                updateData.data.tribe = "wod.bio.werewolf.silverfang";
            }
            if (updateData.data.tribe == "Stargazers") {
                updateData.data.tribe = "wod.bio.werewolf.stargazer";
            }
            if (updateData.data.tribe == "Uktena") {
                updateData.data.tribe = "wod.bio.werewolf.uktena";
            }
            if (updateData.data.tribe == "Wendigo") {
                updateData.data.tribe = "wod.bio.werewolf.wendigo";
            }
            if (updateData.data.tribe == "Black Spiral Dancers") {
                updateData.data.tribe = "wod.bio.werewolf.blackspiraldancer";
            }
            if (updateData.data.tribe == "Skin Dancers") {
                updateData.data.tribe = "wod.bio.werewolf.skindancer";
            }
            if (updateData.data.tribe == "Bunyip") {
                updateData.data.tribe = "wod.bio.werewolf.bunyip";
            }
            if (updateData.data.tribe == "Croatan") {
                updateData.data.tribe = "wod.bio.werewolf.croatan";
            }
            if (updateData.data.tribe == "White Howlers") {
                updateData.data.tribe = "wod.bio.werewolf.whitehowler";
            }
        }
        
        if (update) {
            await actor.update(updateData);
        }
    }

    for (const item of actor.items) {
        await updateItem(item, migrationVersion);
    }
};

/**
 * patch an item to the latest version
 * @param {Item} item   The Item to Update
 * @param migrationVersion   The version that is being pushed at the world
 * 
 */
 export const updateItem = async function(item, migrationVersion) {
    if (compareVersion(item.data.data.version, "1.5.0")) {
        const itemData = duplicate(item);

        if (item.type == "Armor") {
            itemData.data.forms.hashomid = itemData.data.forms.homid;
            itemData.data.forms.hasglabro = itemData.data.forms.glabro;
            itemData.data.forms.hascrinos = itemData.data.forms.crinos;
            itemData.data.forms.hashispo = itemData.data.forms.hispo;
            itemData.data.forms.haslupus = itemData.data.forms.lupus;
        }

        // Weapons
        if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
            itemData.data.attack.isrollable = itemData.data.attack.roll;
            itemData.data.damage.isrollable = itemData.data.damage.roll;
            itemData.data.difficulty = parseInt(itemData.data.diff);
            itemData.data.istwohanded = itemData.data.twohanded;
        }

        if (item.type == "Melee Weapon") {
            itemData.data.isnatural = itemData.data.natural;
        }

        if (item.type == "Ranged Weapon") {
            itemData.data.mode.hasreload = itemData.data.mode.reload;
            itemData.data.mode.hasburst = itemData.data.mode.burst;
            itemData.data.mode.hasfullauto = itemData.data.mode.fullauto;
            itemData.data.mode.hasspray = itemData.data.mode.spray;
        }

        if (item.type == "Fetish") {
            itemData.data.difficulty = parseInt(itemData.data.diff);
        }

        // Alla actor items POWER skall flytta active -> isactive
        if (item.type == "Power") {
            itemData.data.isactive = itemData.data.active;
            itemData.data.isrollable = itemData.data.rollable;                        
        }                      

        if (item.type == "Rote") {
            itemData.data.instrument.ispersonalized = itemData.data.instrument.personalized;
            itemData.data.instrument.isunique = itemData.data.instrument.unique;
        }

        if (item.type == "Feature") {
            itemData.data.isrollable = itemData.data.roll;
        }
        
        if (item.type == "Experience") {
            itemData.data.isspent = itemData.data.spent;
        }

        itemData.data.version = migrationVersion;
        itemData.data.iscreated = true;

        await item.update(itemData);

        // Armor
        if (item.type == "Armor") {
            itemData.data.forms['-=homid'] = null;
            itemData.data.forms['-=glabro'] = null;
            itemData.data.forms['-=crinos'] = null;
            itemData.data.forms['-=hispo'] = null;
            itemData.data.forms['-=lupus'] = null;
        }

        // Weapons
        if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
            itemData.data.attack['-=roll'] = null;
            itemData.data.attack['-=isRollable'] = null;
            itemData.data.damage['-=roll'] = null;
            itemData.data.damage['-=isRollable'] = null;
            itemData.data['-=diff'] = null;
            itemData.data['-=twohanded'] = null;
        }

        // Melee Weapon
        if (item.type == "Melee Weapon") {
            itemData.data['-=natural'] = null;
        }

        // Ranged Weapon
        if (item.type == "Ranged Weapon") {
            itemData.data.mode['-=reload'] = null;
            itemData.data.mode['-=burst'] = null;
            itemData.data.mode['-=fullauto'] = null;
            itemData.data.mode['-=spray'] = null;
        }

        // Fetish
        if (item.type == "Fetish") {
            itemData.data['-=diff'] = null;
        }

        // Power
        if (item.type == "Power") {
            itemData.data['-=active'] = null;
            itemData.data['-=rollable'] = null;
            itemData.data['-=isRollable'] = null;
        }                      

        // Rote
        if (item.type == "Rote") {
            itemData.data.instrument['-=personalized'] = null;
            itemData.data.instrument['-=unique'] = null;
        }

        // Feature
        if (item.type == "Feature") {
            itemData.data['-=roll'] = null;
            itemData.data['-=isRollable'] = null;
        }
        
        if (item.type == "Experience") {
            itemData.data['-=spent'] = null;
        }

        if (item.type != "Experience") {      
            itemData.data['-=created'] = null;  
        }

        await item.update(itemData);
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
                    await updateItem(ent, migrationVersion);
                    break;
                case "Scene":
                    break;
            }
            //console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
        }

        // Handle migration failures
        catch(err) {
            err.message = `Failed cofd system migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
            console.error(err);
        }
    }

    // Apply the original locked status for the pack
    pack.configure({locked: wasLocked});
    console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
 };

  /**
 * Fetches the update information text as an updated is being made.
 * @param migrationVersion   The version that is being pushed at the world
 * 
 */
 function getVersionText(installedVersion, migrationVersion) {
    let patch107 = false;
    let patch110 = false;
    let patch120 = false;
    let patch130 = false;
    let patch140 = false;
    let patch150 = false;
    let patch160 = false;

    let newfunctions = "";

    try {
        // add the new setting in settings.js
        patch107 = game.settings.get('worldofdarkness', 'patch107');
        patch110 = game.settings.get('worldofdarkness', 'patch110');
        patch120 = game.settings.get('worldofdarkness', 'patch120');
        patch130 = game.settings.get('worldofdarkness', 'patch130');
        patch140 = game.settings.get('worldofdarkness', 'patch140');
        patch150 = game.settings.get('worldofdarkness', 'patch150');
        patch160 = game.settings.get('worldofdarkness', 'patch160');
    } 
    catch (e) {
    }

    if (!patch110) {
        game.settings.set('worldofdarkness', 'patch110', true);

        newfunctions += "<li>Creature sheet released</li>";
        newfunctions += "<li>Added new System Setting where you can switch to use 5th ed Attributes and 5th ed Willpower.</li>";
        newfunctions += "<li>Added new alternatives in sheet Settings</li>";
        newfunctions += "<li>And a bunch of bug fixes</li>";
    }

    if (!patch120) {
        game.settings.set('worldofdarkness', 'patch120', true);

        newfunctions += "<li>Added buttons to handle Initiative, Soak and general dice rolling</li>";
        newfunctions += "<li>Added German Translation</li>";
        newfunctions += "<li>Fixed the System can use Foundry rolling of Initiative</li>";
        newfunctions += "<li>Worked on design on the different sheets";
    }

    if (!patch130) {
        game.settings.set('worldofdarkness', 'patch130', true);

        newfunctions += "<li>Added Changing Breed sheets. Supports Ajaba, Ananasi, Bastet, Corax, Gurahl, Kitsune, Mokole, Nagah, Nuwisha, Ratkin and Rokea</li>";
        newfunctions += "<li>Worked on design on the sheets of the macro buttons</li>";
        newfunctions += "<li>Changed font</li>";
        newfunctions += "<li>Worked on design on the combat section of the sheets</li>";
        newfunctions += "<li>Fixed graphical problems if using German Translation</li>";
        newfunctions += '<li>Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/1">#1</a> a problem where the Attribute Setting in Power Items did not read the setting if you where using the 20th or 5th System setting</li>';
        newfunctions += '<li>Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/2">#2</a> so you can clear permanent Renown</li>';
    }

    if (!patch140) {
        game.settings.set('worldofdarkness', 'patch140', true);

        newfunctions += "<li>Added Spanish</li>";
        newfunctions += "<li>Added Mage the Ascention</li>";
        newfunctions += "<li>Added Secondary Abilities is added under Settings</li>";
        newfunctions += "<li>[WtA] Added icon to roll frenzy</li>";
        newfunctions += "<li>[WtA] Added new item - Fetish listed in Gear</li>";
        newfunctions += "<li>[MtA] Added icon to roll cast spell</li>";
        newfunctions += "<li>[MtA] Added support to create and cast Rote spells</li>";
        newfunctions += "<li>Fixed graphical problems if using Spanish Translation</li>";        
    }

    if (!patch150) {
        game.settings.set('worldofdarkness', 'patch150', true);

        newfunctions += "<li>Added Vampire the Masquerade</li>";
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
        newfunctions += '<li>Fixed that spirits could not roll macro buttons <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/163">#163</a></li>';
    } 

    if (!patch160) {
        game.settings.set('worldofdarkness', 'patch160', true);

        newfunctions += "<li>Major update of the graphics way too much to list here</li>";
        newfunctions += "<li>Can turn off the special sheet fonts</li>";
        newfunctions += "<li>German and Spanish updated</li>";
        newfunctions += "<li>Added an Add-button to add backgrounds, mertis, flaws and blood bounds to the sheet</li>";
        newfunctions += "<li>[WtA] Added rank 6</li>";
        newfunctions += "<li>[WtA] Spirits can have Gifts</li>";
        newfunctions += "<li>[MtA] Added Paradigm, Practice and Instruments</li>";
        newfunctions += "<li>[MtA] Supports Constructs and Familiars</li>";
        newfunctions += "<li>[VtM] Added Blood Bounded people under Info</li>";
        newfunctions += "<li>Fixed a bunish of bugs and stuff of irritation</li>";
    }

    if (newfunctions == "") {
        newfunctions = '<li>General bug fixes</li>';
    }

    game.settings.set('worldofdarkness', 'worldVersion', migrationVersion);

    const headline = "<h1><b>Version "+migrationVersion+" installed</b></h1>";

    let message = 'New version of the system has been installed. Details can be read at <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki/Changelog#fix-in-160">Changelog</a>.<br /><br />';
    message += 'If you find any problems, are missing things or just would like a feature that the System is lacking, please report these <a href="https://github.com/JohanFalt/Foundry_WoD20/issues">HERE</a><br /><br />';
    message += 'If you wish to read about the system you can do so <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki/World-of-Darkness-20th-ed-System">HERE</a><br /><br />';

    if (installedVersion != "1") {
        message += '<h2>Short Summery of update:</h2>';
        message += '<ul>';
        message += newfunctions;
        message += '</ul>';
    } 

    ActionHelper.printMessage(headline, message);
}

  /**
 * Converts a version number into an integer
 * @param version   Version string that is to be converted
 * 
 */
function getVersion(version) {
    if (version == "") {
        return 0;
    }

    if (version == undefined) {
        return 0;
    }

    try {
        let number = version.replaceAll(".", "");
        return parseInt(number);
    }
    catch {
        return 0;
    }
}

  /**
 * Compares two version numbers to see if the new one is newer than the old one
 * @param oldVersion   The existing version no: e.g. 1.5.9
 * @param newVersion   The new version no: e.g. 1.5.10
 */
function compareVersion(oldVersion, newVersion) {
    if (newVersion == "") {
        return false;
    }

    if (newVersion == undefined) {
        return false;
    }

    let greaterVersion = false;

    try {
        const newfields = newVersion.split(".");
        const oldfields = oldVersion.split(".");

        for (let i = 0; i <= 2; i++) {
            if (parseInt(newfields[i]) > parseInt(oldfields[i])) {
                greaterVersion = true;
            }
        }

        return greaterVersion;
    }
    catch {
        return false;
    }
}
