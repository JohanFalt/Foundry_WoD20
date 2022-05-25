import Patch from "./scripts/patch.js";
import ActionHelper from "./scripts/action-helpers.js"

export const patches = async (installedVersion, currentVersion) => {
    //let worldVersion = '1';

    //const currentVersion = game.data.system.data.version;  
    let characterChanged = false;

    let patch107 = false;
    let hasRun107 = false;

    let patch110 = false;
    let hasRun110 = false;

    let patch120 = false;
    let hasRun120 = false;

    let patch130 = false;
    let hasRun130 = false;

    let patch140 = false;
    let hasRun140 = false;

    let patch150 = false;
    let hasRun150 = false;

    let newfunctions = "";

    try {
        // add the new setting in settings.js
        patch107 = game.settings.get('worldofdarkness', 'patch107');
        patch110 = game.settings.get('worldofdarkness', 'patch110');
        patch120 = game.settings.get('worldofdarkness', 'patch120');
        patch130 = game.settings.get('worldofdarkness', 'patch130');
        patch140 = game.settings.get('worldofdarkness', 'patch140');
        patch150 = game.settings.get('worldofdarkness', 'patch150');
    } 
    catch (e) {
        console.log("Fel uppstod i migration.js");
    }

    console.log('WoD | Current world version: ' + installedVersion);
    console.log('WoD | Getting version: ' + currentVersion);

    for (const actor of game.actors) {

        // patches for actor's items
        for (const item of actor.items) {
            if (item.data.data.version == undefined) {
                item.update({"data.version" : currentVersion});

                if (Patch.patch1_0_7(item, patch107)) {
                    characterChanged = true;            
                }          
            }        
        }

        // patch the actor itself
        if (actor.data.data.attributes != undefined) {
            if (Patch.patch1_1_0(actor, patch110)) {
                characterChanged = true;
            }        
        }      
    }

    hasRun107 = true;
    hasRun110 = true;
    hasRun120 = true;
    hasRun130 = true;
    hasRun140 = true;
    hasRun150 = true;

    if ((!patch107) && (hasRun107)) {
        game.settings.set('worldofdarkness', 'patch107', true);
        ui.notifications.info('Has run patch107!');
    }

    if ((!patch110) && (hasRun110)) {
        game.settings.set('worldofdarkness', 'patch110', true);
        ui.notifications.info('Has run patch110!');

        newfunctions += "<li>Creature sheet released</li>";
        newfunctions += "<li>Added new System Setting where you can switch to use 5th ed Attributes and 5th ed Willpower.</li>";
        newfunctions += "<li>Added new alternatives in sheet Settings</li>";
        newfunctions += "<li>And a bunch of bug fixes</li>";
    }

    if ((!patch120) && (hasRun120)) {
        game.settings.set('worldofdarkness', 'patch120', true);

        newfunctions += "<li>Added buttons to handle Initiative, Soak and general dice rolling</li>";
        newfunctions += "<li>Added German Translation</li>";
        newfunctions += "<li>Fixed the System can use Foundry rolling of Initiative</li>";
        newfunctions += "<li>Worked on design on the different sheets";
    }

    if ((!patch130) && (hasRun130)) {
        game.settings.set('worldofdarkness', 'patch130', true);

        newfunctions += "<li>Added Changing Breed sheets. Supports Ajaba, Ananasi, Bastet, Corax, Gurahl, Kitsune, Mokole, Nagah, Nuwisha, Ratkin and Rokea</li>";
        newfunctions += "<li>Worked on design on the sheets of the macro buttons</li>";
        newfunctions += "<li>Changed font</li>";
        newfunctions += "<li>Worked on design on the combat section of the sheets</li>";
        newfunctions += "<li>Fixed graphical problems if using German Translation</li>";
        newfunctions += '<li>Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/1">#1</a> a problem where the Attribute Setting in Power Items did not read the setting if you where using the 20th or 5th System setting</li>';
        newfunctions += '<li>Fixed <a href="https://github.com/JohanFalt/Foundry_WoD20/issues/2">#2</a> so you can clear permanent Renown</li>';
    }

    if ((!patch140) && (hasRun140)) {
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

    // if ((!patch150) && (hasRun150)) {
    //   //game.settings.set('worldofdarkness', 'patch150', true);
    // }    
      
    game.settings.set('worldofdarkness', 'worldVersion', currentVersion);

    if (characterChanged) {
        ui.notifications.info(game.i18n.localize("wod.system.characters"));    
    }

    ui.notifications.info(game.i18n.localize("wod.system.world"));

    console.log('WoD | Patches done');

    const headline = "<h1><b>Version "+currentVersion+" installed</b></h1>";

    let message = 'New version of the system has been installed. Details can be read at <a href="https://github.com/JohanFalt/Foundry_WoD20/wiki/Changelog#fix-in-140">Changelog</a>.<br /><br />';
    message += 'If you find any problems, are missing things or just would like a feature that the System is lacking, please report these <a href="https://github.com/JohanFalt/Foundry_WoD20/issues">HERE</a><br /><br />';
    message += '<h2>Short Summery:</h2>';
    message += '<ul>';
    message += newfunctions;
    message += '</ul>';

    ActionHelper.printMessage(headline, message);
}

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
        if ((actor.type == "Mortal") || (actor.type == "Mage") || (actor.type == "Werewolf") || (actor.type == "Changing Breed") || (actor.type == "Creature")) {
        if (attributeSettings == "20th") {
            actor.update({"data.attributes.strength.visible" : true,
            "data.attributes.dexterity.visible" : true,
            "data.attributes.stamina.visible" : true,
            "data.attributes.charisma.visible" : true,
            "data.attributes.manipulation.visible" : true,
            "data.attributes.appearance.visible" : true,
            "data.attributes.composure.visible" : false,
            "data.attributes.perception.visible" : true,
            "data.attributes.intelligence.visible" : true,
            "data.attributes.wits.visible" : true,
            "data.attributes.resolve.visible" : false});
        }
        else if (attributeSettings == "5th") {
            actor.update({"data.attributes.strength.visible" : true,
            "data.attributes.dexterity.visible" : true,
            "data.attributes.stamina.visible" : true,
            "data.attributes.charisma.visible" : true,
            "data.attributes.manipulation.visible" : true,
            "data.attributes.appearance.visible" : false,
            "data.attributes.composure.visible" : true,
            "data.attributes.perception.visible" : false,
            "data.attributes.intelligence.visible" : true,
            "data.attributes.wits.visible" : true,
            "data.attributes.resolve.visible" : true});
        }

        if (rollSettings) {
            if ((actor.type != "Mortal") && (actor.type != "Mage")) {
            rage = actor.data.data.rage.permanent; 
            gnosis = actor.data.data.gnosis.permanent;
            }
            
            willpower = actor.data.data.willpower.permanent; 
        }
        else {
            if ((actor.type != "Mortal") && (actor.type != "Mage")) {
            rage = actor.data.data.rage.permanent > actor.data.data.rage.temporary ? actor.data.data.rage.temporary : actor.data.data.rage.permanent; 
            gnosis = actor.data.data.gnosis.permanent > actor.data.data.gnosis.temporary ? actor.data.data.gnosis.temporary : actor.data.data.gnosis.permanent;
            }
            
            willpower = actor.data.data.willpower.permanent > actor.data.data.willpower.temporary ? actor.data.data.willpower.temporary : actor.data.data.willpower.permanent; 
        }

        if ((actor.type != "Mortal") && (actor.type != "Mage")) {
            actor.update({"data.gnosis.roll" : gnosis,
            "data.rage.roll" : rage});
        }

        actor.update({"data.willpower.roll" : willpower});        
        }

        totalinit = parseInt(actor.data.data.initiative.base) + parseInt(actor.data.data.initiative.bonus);
        actor.update({"data.initiative.total" : totalinit});       
    }  
}
