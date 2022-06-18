import ActionHelper from "./action-helpers.js"

export default class Patch {

	static patch1_0_7(item, hasRun) {
        let characterChanged = false;

        if (!hasRun) {
            for (const actor of game.actors) {
                // patches for actor's items
                for (const item of actor.items) {
                    if (item.data.type == "Experience") {
                        if (item.data.data.type == "wod.types.expgained") {
                            item.update({"data.description" : item.name});
                          characterChanged = true;
                        }
                    }     
                }
            }                      
        }

        return characterChanged;
    }

    //delete itemData.data.active;
    static async patch1_5_0(currentVersion) {
        ActionHelper.printMessage("<h2>Updating Actors</h2>", "There are " + Object.keys(game.actors).length + " actors (with items) to update.");

        for (const actor of game.actors) {
            // patches for actor's items
            for (const item of actor.items) {
                if (getVersion(item.data.data.version) < 150) {
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

                    itemData.data.version = currentVersion;
                    itemData.data.iscreated = true;

                    await item.update(itemData);

                    if (item.type == "Armor") {
                        await item.update({"data.forms.-=homid": null,
                                        "data.forms.-=glabro": null,
                                        "data.forms.-=crinos": null,
                                        "data.forms.-=hispo": null,
                                        "data.forms.-=lupus": null});
                    }

                    // Weapons
                    if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
                        await item.update({"data.attack.-=roll": null,
                                        "data.attack.-=isRollable": null,
                                        "data.damage.-=roll": null,
                                        "data.damage.-=isRollable": null,
                                        "data.-=diff": null,
                                        "data.-=twohanded": null});
                    }

                    if (item.type == "Melee Weapon") {
                        await item.update({"data.-=natural": null});
                    }

                    if (item.type == "Ranged Weapon") {
                        await item.update({"data.mode.-=reload": null,
                                        "data.mode.-=burst": null,
                                        "data.mode.-=fullauto": null,
                                        "data.mode.-=spray": null});
                    }

                    if (item.type == "Fetish") {
                        await item.update({"data.-=diff": null});
                    }

                    if (item.type == "Power") {
                        await item.update({"data.-=active": null,
                                        "data.-=rollable": null,
                                        "data.-=isRollable": null});
                    }                      

                    if (item.type == "Rote") {
                        await item.update({"data.instrument.-=personalized": null,
                                        "data.instrument.-=unique": null});
                    }

                    if (item.type == "Feature") {
                        await item.update({"data.-=roll": null,
                                        "data.-=isRollable": null});
                    }
                    
                    if (item.type == "Experience") {
                        await item.update({"data.-=spent": null});
                    }

                    if (item.type != "Experience") {                        
                        await item.update({"data.-=created": null});
                    }
                }      
            }

            // patch the actor itself
            if (getVersion(actor.data.data.version) < 150) {

                const actorData = duplicate(actor);   
                
                actorData.data.settings.version = currentVersion;
                actorData.data.settings.iscreated = actorData.data.settings.created;
                actorData.data.settings.soak.bashing.isrollable = actorData.data.settings.soak.bashing.roll;
                actorData.data.settings.soak.lethal.isrollable = actorData.data.settings.soak.lethal.roll;
                actorData.data.settings.soak.aggravated.isrollable = actorData.data.settings.soak.aggravated.roll;

                actorData.data.conditions.isignoringpain = actorData.data.conditions.ignorepain;
                actorData.data.conditions.isstunned = actorData.data.conditions.stunned;

                if (actor.type != "Spirit") {
                    for (const attribute in actorData.data.attributes) {
                        actorData.data.attributes[attribute].isvisible = actorData.data.attributes[attribute].visible;      
                    }

                    for (const ability in actorData.data.abilities.talent) {
                        actorData.data.abilities.talent[ability].isvisible = actorData.data.abilities.talent[ability].visible;                    
                    }

                    for (const ability in actorData.data.abilities.skill) {
                        actorData.data.abilities.skill[ability].isvisible = actorData.data.abilities.skill[ability].visible;                    
                    }

                    for (const ability in actorData.data.abilities.knowledge) {
                        actorData.data.abilities.knowledge[ability].isvisible = actorData.data.abilities.knowledge[ability].visible;                    
                    }
                }

                if (actor.type == CONFIG.wod.sheettype.werewolf) {
                    actorData.data.conditions.isfrenzy = actorData.data.conditions.frenzy;

                    actorData.data.shapes.homid.isactive = actorData.data.shapes.homid.active;
                    actorData.data.shapes.glabro.isactive = actorData.data.shapes.glabro.active;
                    actorData.data.shapes.crinos.isactive = actorData.data.shapes.crinos.active;
                    actorData.data.shapes.hispo.isactive = actorData.data.shapes.hispo.active;
                    actorData.data.shapes.lupus.isactive = actorData.data.shapes.lupus.active;
                }  

                await actor.update(actorData);

                /* remove deprigated attributes */

                await actor.update({"data.settings.-=created": null,
                                        "data.settings.soak.bashing.-=roll": null,
                                        "data.settings.soak.lethal.-=roll": null,
                                        "data.settings.soak.aggravated.-=roll": null,
                                        "data.conditions.-=ignorepain": null,
                                        "data.conditions.-=stunned": null});

                if (actor.type != "Spirit") {
                    await actor.update({"data.attributes.strength.alertness.-=visible": null,
                                        "data.attributes.dexterity.alertness.-=visible": null,
                                        "data.attributes.stamina.alertness.-=visible": null,
                                        "data.attributes.charisma.alertness.-=visible": null,
                                        "data.attributes.manipulation.alertness.-=visible": null,
                                        "data.attributes.appearance.alertness.-=visible": null,
                                        "data.attributes.composure.alertness.-=visible": null,
                                        "data.attributes.perception.alertness.-=visible": null,
                                        "data.attributes.intelligence.alertness.-=visible": null,
                                        "data.attributes.wits.alertness.-=visible": null,
                                        "data.attributes.resolve.alertness.-=visible": null});

                    await actor.update({"data.abilities.talent.alertness.-=visible": null,
                                        "data.abilities.talent.animalkinskip.-=visible": null,
                                        "data.abilities.talent.art.-=visible": null,
                                        "data.abilities.talent.athletics.-=visible": null,
                                        "data.abilities.talent.awareness.-=visible": null,
                                        "data.abilities.talent.blatancy.-=visible": null,
                                        "data.abilities.talent.brawl.-=visible": null,
                                        "data.abilities.talent.carousing.-=visible": null,
                                        "data.abilities.talent.cooking.-=visible": null,
                                        "data.abilities.talent.diplomacy.-=visible": null,
                                        "data.abilities.talent.do.-=visible": null,
                                        "data.abilities.talent.empathy.-=visible": null,
                                        "data.abilities.talent.expression.-=visible": null,
                                        "data.abilities.talent.gestures.-=visible": null,
                                        "data.abilities.talent.highritual.-=visible": null,
                                        "data.abilities.talent.instruction.-=visible": null,
                                        "data.abilities.talent.intrigue.-=visible": null,
                                        "data.abilities.talent.intimidation.-=visible": null,
                                        "data.abilities.talent.intuition.-=visible": null,
                                        "data.abilities.talent.leadership.-=visible": null,
                                        "data.abilities.talent.luciddreaming.-=visible": null,
                                        "data.abilities.talent.mimicry.-=visible": null,
                                        "data.abilities.talent.negotiation.-=visible": null,
                                        "data.abilities.talent.primalurge.-=visible": null,
                                        "data.abilities.talent.seduction.-=visible": null,
                                        "data.abilities.talent.streetwise.-=visible": null,
                                        "data.abilities.talent.style.-=visible": null,
                                        "data.abilities.talent.subterfuge.-=visible": null});

                    await actor.update({"data.abilities.skill.animalken.-=visible": null,
                                        "data.abilities.skill.archery.-=visible": null,
                                        "data.abilities.skill.biotech.-=visible": null,
                                        "data.abilities.skill.blindfighting.-=visible": null,
                                        "data.abilities.skill.craft.-=visible": null,
                                        "data.abilities.skill.disguise.-=visible": null,
                                        "data.abilities.skill.drive.-=visible": null,
                                        "data.abilities.skill.energyweapons.-=visible": null,
                                        "data.abilities.skill.escapology.-=visible": null,
                                        "data.abilities.skill.etiquette.-=visible": null,
                                        "data.abilities.skill.fastdraw.-=visible": null,
                                        "data.abilities.skill.firearms.-=visible": null,
                                        "data.abilities.skill.fortunetelling.-=visible": null,
                                        "data.abilities.skill.gambling.-=visible": null,
                                        "data.abilities.skill.heavyweapons.-=visible": null,
                                        "data.abilities.skill.hypertech.-=visible": null,
                                        "data.abilities.skill.hypnotism.-=visible": null,
                                        "data.abilities.skill.larceny.-=visible": null,
                                        "data.abilities.skill.martialarts.-=visible": null,
                                        "data.abilities.skill.meditation.-=visible": null,
                                        "data.abilities.skill.melee.-=visible": null,
                                        "data.abilities.skill.networking.-=visible": null,
                                        "data.abilities.skill.performance.-=visible": null,
                                        "data.abilities.skill.pilot.-=visible": null,
                                        "data.abilities.skill.psychology.-=visible": null,
                                        "data.abilities.skill.research.-=visible": null,
                                        "data.abilities.skill.riding.-=visible": null,
                                        "data.abilities.skill.security.-=visible": null,
                                        "data.abilities.skill.stealth.-=visible": null,
                                        "data.abilities.skill.survival.-=visible": null,
                                        "data.abilities.skill.torture.-=visible": null});

                    await actor.update({"data.abilities.knowledge.academics.-=visible": null,
                                        "data.abilities.knowledge.bureaucracy.-=visible": null,
                                        "data.abilities.knowledge.chantry.-=visible": null,
                                        "data.abilities.knowledge.chemistry.-=visible": null,
                                        "data.abilities.knowledge.cosmology.-=visible": null,
                                        "data.abilities.knowledge.cryptography.-=visible": null,
                                        "data.abilities.knowledge.culture.-=visible": null,
                                        "data.abilities.knowledge.computer.-=visible": null,
                                        "data.abilities.knowledge.enigmas.-=visible": null,
                                        "data.abilities.knowledge.esoterica.-=visible": null,
                                        "data.abilities.knowledge.finance.-=visible": null,
                                        "data.abilities.knowledge.hearthwisdom.-=visible": null,
                                        "data.abilities.knowledge.herbalism.-=visible": null,
                                        "data.abilities.knowledge.history.-=visible": null,
                                        "data.abilities.knowledge.investigation.-=visible": null,
                                        "data.abilities.knowledge.law.-=visible": null,
                                        "data.abilities.knowledge.legends.-=visible": null,
                                        "data.abilities.knowledge.media.-=visible": null,
                                        "data.abilities.knowledge.medicine.-=visible": null,
                                        "data.abilities.knowledge.occult.-=visible": null,
                                        "data.abilities.knowledge.politics.-=visible": null,
                                        "data.abilities.knowledge.propaganda.-=visible": null,
                                        "data.abilities.knowledge.religion.-=visible": null,
                                        "data.abilities.knowledge.rituals.-=visible": null,
                                        "data.abilities.knowledge.science.-=visible": null,
                                        "data.abilities.knowledge.theology.-=visible": null,
                                        "data.abilities.knowledge.technology.-=visible": null,
                                        "data.abilities.knowledge.vice.-=visible": null});
                }

                if (actor.type == CONFIG.wod.sheettype.werewolf) {
                    await actor.update({"data.conditions.-=frenzy": null,
                                            "data.shapes.homid.-=active": null,
                                            "data.shapes.glabro.-=active": null,
                                            "data.shapes.crinos.-=active": null,
                                            "data.shapes.hispo.-=active": null,
                                            "data.shapes.lupus.-=active": null});
                }           
            }
        }

        ActionHelper.printMessage("<h2>Updating World Items</h2>", "There are " + Object.keys(game.items).length + " items to update.");

        for (const item of game.items) {
            if (getVersion(item.data.data.version) < 150) {
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

                itemData.data.version = currentVersion;
                itemData.data.iscreated = true;

                await item.update(itemData);

                if (item.type == "Armor") {
                    await item.update({"data.forms.-=homid": null,
                                    "data.forms.-=glabro": null,
                                    "data.forms.-=crinos": null,
                                    "data.forms.-=hispo": null,
                                    "data.forms.-=lupus": null});
                }

                // Weapons
                if ((item.type == "Melee Weapon") || (item.type == "Ranged Weapon")) {
                    await item.update({"data.attack.-=roll": null,
                                    "data.attack.-=isRollable": null,
                                    "data.damage.-=roll": null,
                                    "data.damage.-=isRollable": null,
                                    "data.-=diff": null,
                                    "data.-=twohanded": null});
                }

                if (item.type == "Melee Weapon") {
                    await item.update({"data.-=natural": null});
                }

                if (item.type == "Ranged Weapon") {
                    await item.update({"data.mode.-=reload": null,
                                    "data.mode.-=burst": null,
                                    "data.mode.-=fullauto": null,
                                    "data.mode.-=spray": null});
                }

                if (item.type == "Fetish") {
                    await item.update({"data.-=diff": null});
                }

                if (item.type == "Power") {
                    await item.update({"data.-=active": null,
                                    "data.-=rollable": null,
                                    "data.-=isRollable": null});
                }                      

                if (item.type == "Rote") {
                    await item.update({"data.instrument.-=personalized": null,
                                    "data.instrument.-=unique": null});
                }

                if (item.type == "Feature") {
                    await item.update({"data.-=roll": null,
                                    "data.-=isRollable": null});
                }
                
                if (item.type == "Experience") {
                    await item.update({"data.-=spent": null});
                }

                if (item.type != "Experience") {                        
                    await item.update({"data.-=created": null});
                }
            } 
        }

        return true;
    }

    
}

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

// *********************** SKRÄP

// go through all of the game's actors
// for (const actor of game.actors) {
//     // patches for actor's items
//     for (const item of actor.items) {
//         if ((item.data.data.version < 150) || (item.data.data.version == "")) {
//             // Alla actor items POWER skall flytta active -> isactive
//             // Alla actor items ARMOR skall flytta homid -> hashomid, glabro -> hasglabro, crinos -> hascrinos, hispo -> hashispo, lupus -> haslupus
//             item.update({"data.version" : currentVersion});

//             characterChanged = true; 
//         }

//         if (item.data.data.version == undefined) {
//             item.update({"data.version" : currentVersion});

//             if (Patch.patch1_0_7(item, patch107)) {
//                 characterChanged = true;            
//             }          
//         }        
//     }

//     // patch the actor itself
//     if (actor.data.data.attributes != undefined) {
//         if (Patch.patch1_1_0(actor, patch110)) {
//             characterChanged = true;
//         }        
//     }      
// }


    // static patch1_1_0(actor, hasRun) {
    //     let characterChanged = false;

    //     if (!hasRun) {
    //         if (actor.type == CONFIG.wod.sheettype.werewolf) {
    //           actor.update({"data.settings.soak.bashing.roll" : true,
    //               "data.settings.soak.lethal.roll" : true,
    //               "data.settings.soak.aggravated.roll" : true});

    //           characterChanged = true;
    //         }
    //         else if (actor.type == "Spirit") {
    //           actor.update({"data.settings.soak.bashing.roll" : true,
    //               "data.settings.soak.lethal.roll" : true,
    //               "data.settings.soak.aggravated.roll" : true});

    //           characterChanged = true;
    //         }
    //         else {
    //           actor.update({"data.settings.soak.bashing.roll" : true,
    //                 "data.settings.soak.lethal.roll" : false,
    //                 "data.settings.soak.aggravated.roll" : false});
              
    //           characterChanged = true;
    //         }
    //     }

    //     return characterChanged;
    // }