import { calculateTotals } from "../../scripts/totals.js";
import CombatHelper from "../../scripts/combat-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";
import Functions from "../../functions.js";
import PCActorAPI from "../api-handler.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class WoDActor extends Actor {
    /**
     * Get the PC Actor API
     * @returns {PCActorAPI|undefined} The API instance if actor is PC, undefined otherwise
     */
    get api() {
        if (this.type === "PC") {
            return new PCActorAPI(this);
        }
        return undefined;
    }

    /**
   * @override
   * Prepare data for the actor. Calling the super version of this executes
   * the following, in order: data reset (to clear active effects),
   * prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
   * prepareDerivedData().
   */
    prepareData() {
        // This exists because if an actor exists from another system (such as "Vampire" from WOD5),
        // the prepareData function will get stuck in a loop. For some reason Foundry isn't registering
        // those kinds of actors as invalid, and thus this is a quick way to make sure people can
        // still load their worlds with those invalid actors.
        if (game.actors.invalidDocumentIds.has(this.id)) {
            return
        }

        super.prepareData();

        const actorData = this;
        // Make separate methods for each Actor type (character, npc, etc.) to keep things organized.
        this._prepareCharacterData(actorData);
    }

    async prepareDerivedData() {
        const actorData = this;
        const systemData = actorData.system;

        // Skip if actor is invalid
        if (game.actors.invalidDocumentIds.has(actorData.id)) {
            return;
        }

        // Skip if no owner
        if (actorData.permission < 3) {
            return;
        }

        try {
            // Handle PC actors
            if (actorData.type === "PC") {
                // Derived calculations: Wound levels
                await this._handleWoundLevelCalculations(actorData);
                
                
                // Derived calculations: Movement (needs total dexterity and all active items)
                systemData.movement = await CombatHelper.CalculateMovementv2(actorData);
            }
            // Handle legacy actors
            else {
                // Normalization: Willpower calculations
                let advantageRollSetting = true;
                try {
                    advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
                } 
                catch (e) {
                    advantageRollSetting = true;
                }

                // Willpower permanent calculation
                if (systemData.settings.variant != "spirit") {
                    

                    if ((CONFIG.worldofdarkness.attributeSettings == "5th") && (CONFIG.worldofdarkness.fifthEditionWillpowerSetting == "5th")) {
                        systemData.advantages.willpower.permanent = parseInt(systemData.attributes.composure.value) + parseInt(systemData.attributes.resolve.value);
                    }
                }

                // Normalization: Willpower clamping
                if (systemData?.advantages?.willpower?.permanent > systemData?.advantages?.willpower?.max) {
                    systemData.advantages.willpower.permanent = systemData.advantages.willpower.max;
                }

                if (systemData?.advantages?.willpower?.permanent < systemData?.advantages?.willpower?.temporary) {
                    systemData.advantages.willpower.temporary = systemData.advantages.willpower.permanent;
                }

                // Derived calculations: Willpower roll value
                if (advantageRollSetting) {
                    if (systemData?.advantages?.willpower?.permanent) {
                        systemData.advantages.willpower.roll = systemData.advantages.willpower.permanent;
                    }
                }
                else {
                    if ((systemData?.advantages?.willpower?.permanent) && (systemData?.advantages?.willpower?.temporary)) {
                        systemData.advantages.willpower.roll = systemData.advantages.willpower.permanent > systemData.advantages.willpower.temporary ? systemData.advantages.willpower.temporary : systemData.advantages.willpower.permanent;
                    }
                }

                // Handle splat-specific calculations
                // Werewolf and spirits
                if ((systemData?.settings?.hasrage) || (systemData?.settings?.hasgnosis)) {
                    await this._handleWerewolfCalculations(actorData);
                }
                
                // Vampire
                if ((systemData?.settings?.haspath) || (systemData?.settings?.hasbloodpool) || (systemData?.settings?.hasvirtue)) {
                    await this._handleVampireCalculations(actorData);
                }
                
                // Mage
                if (actorData.type == CONFIG.worldofdarkness.sheettype.mage) {
                    await this._handleMageCalculations(actorData);
                }
                
                // Changeling
                if (systemData?.settings?.hasglamour) {
                    await this._handleChangelingCalculations(actorData);
                }
                
                // Hunter
                if (systemData?.settings?.hasconviction) {
                    await this._handleHunterCalculations(actorData);
                }
                
                // Demon
                if ((systemData?.settings?.hasfaith) || (systemData?.settings?.hastorment)) {
                    await this._handleDemonCalculations(actorData);
                }
                
                // Mummy
                if (systemData?.settings?.hasbalance) {
                    await this._handleMummyCalculations(actorData);
                }
                
                // Wraith
                if (actorData.type == CONFIG.worldofdarkness.sheettype.wraith) {
                    await this._handleWraithCalculations(actorData);
                }

                // Exalted
                if (actorData.type == CONFIG.worldofdarkness.sheettype.exalted) {
                    await this._handleExaltedCalculations(actorData);
                    await this._keepSheetValuesCorrect(actorData);
                }

                
                // Derived calculations: Wound levels
                await this._handleWoundLevelCalculations(actorData);
                

                // Derived calculations: Movement (needs total dexterity and all active items)
                systemData.movement = await CombatHelper.CalculateMovement(actorData);
            }
        }
        catch (err) {
            ui.notifications.error(`Cannot prepare derived data for Actor ${actorData?.name}. Please check console for details.`);
            err.message = `Cannot prepare derived data for Actor ${actorData?.name}: ${err.message}`;
            console.error(err);
            console.log(actorData);
        }
    }

  /**
   * Prepare Character type specific data
   */
    async _prepareCharacterData(actorData) {
        // As in some cases an attribute on the actor might have updated which affects the items the actor has
        // this needs to be updated as well.

        let traitMax = 5;

        if (this.type === "PC") {
            let itemList = [];

            const abilities = (this?.items || []).filter(item => item.type === "Ability");
            const advantages = (this?.items || []).filter(item => item.type === "Advantage");
            const spheres = (this?.items || []).filter(item => item.type === "Sphere");
            const powers = (this?.items || []).filter(item => item.type === "Power" && item.system.secondaryabilityid === "");
            const allpowers = (this?.items || []).filter(item => item.type === "Power" || item.type === "Sphere" || item.type === "Rote");
            const shapes = actorData.items.filter(item => item.type === "Trait" && (item.system.type === "wod.types.shapeform"));
            const resonances = actorData.items.filter(item => item.type === "Trait" && item.system?.type === "wod.types.resonance");            

            // Normalization: Set ability max values
            await this._setAbilityMaxValue(actorData);

            traitMax = actorData.system.settings.attributes.defaultmaxvalue;

            // attributes max
            for (const i in actorData.system.attributes) {
                actorData.system.attributes[i].isvisible = true;                

                if (actorData.system.attributes[i].max === traitMax) {
                    continue;
                }

                actorData.system.attributes[i].max = traitMax;

                if (actorData.system.attributes[i].value > traitMax) {
                    actorData.system.attributes[i].value = traitMax;
                }
            }

            if (CONFIG.worldofdarkness.attributeSettings == "5th") {
                if (actorData.system.attributes.appearance) {
                    actorData.system.attributes.appearance.isvisible = false;
                }
                if (actorData.system.attributes.perception) {
                    actorData.system.attributes.perception.isvisible = false;
                }
            }
            else if (CONFIG.worldofdarkness.attributeSettings == "20th") {
                if (actorData.system.attributes.composure) {
                    actorData.system.attributes.composure.isvisible = false;
                }
                if (actorData.system.attributes.resolve) {
                    actorData.system.attributes.resolve.isvisible = false;
                }
            }

            // Add abilities as objektstruktur
            actorData.system.abilities = {};

            for (const ability of abilities) {
                const key = ability.system.slug ?? ability.system.id ?? ability.name.toLowerCase();
                actorData.system.abilities[key] = ability.toObject();

                traitMax = actorData.system.settings.abilities.defaultmaxvalue;

                if (ability.system.max != traitMax) {
                    itemList.push({
                        _id: ability._id,
                        "system.max": traitMax
                    });

                    actorData.system.abilities[key].system.max = traitMax;
                }

                continue;
            }

            // Add advantages as objektstruktur
            actorData.system.advantages = {};            
            
            for (const adv of advantages) {
                const key = adv.system.slug ?? adv.system.id ?? adv.name.toLowerCase();
                actorData.system.advantages[key] = adv.toObject();

                // set bearing in path correctly
                if (actorData.system.advantages[key].system.id === "path") {
    				let bearing = 0;
                    let pathvalue = actorData.system.advantages[key].system.permanent;

                    if (pathvalue <= 1) {
                        bearing = 2;
                    }
                    else if ((pathvalue >= 2) && (pathvalue <= 3)) {
                        bearing = 1;
                    }
                    else if ((pathvalue >= 4) && (pathvalue <= 7)) {
                        bearing = 0;
                    }
                    else if ((pathvalue >= 8) && (pathvalue <= 9)) {
                        bearing = -1;
                    }
                    else if (pathvalue == 10) {
                        bearing = -2;
                    }

                    // bearing is being updated so need to update item
                    if (adv.system.bearing != bearing) {
                        itemList.push({
                            _id: adv._id,
                            "system.bearing": bearing
                        });

                        actorData.system.advantages[key].system.bearing = bearing;
                    }                       
                    
                    continue;
                } 

                // set max value in virtues correctly
                if (actorData.system.advantages[key].system.group === "virtue") {
                    traitMax = actorData.system.settings.powers.defaultmaxvalue;

                    if (adv.system.max != traitMax) {
                        itemList.push({
                            _id: adv._id,
                            "system.max": traitMax
                        });

                        actorData.system.advantages[key].system.max = traitMax;
                    }

                    continue;
                }

                if (actorData.system.advantages[key].system.id === "bloodpool") {  
                    if (actorData.system.bio.splatfields.generation != undefined) {
                        const bloodpoolMax = this._calculteMaxBlood(actorData.system.bio.splatfields.generation.value - actorData.system.bio.splatfields.generation.mod);
                        const bloodSpending = this._calculteMaxBloodSpend(actorData.system.bio.splatfields.generation.value - actorData.system.bio.splatfields.generation.mod);

                        if ((adv.system.max != bloodpoolMax) || (adv.system.perturn != bloodSpending)) {
                            actorData.system.advantages[key].system.max = bloodpoolMax;
                            actorData.system.advantages[key].system.perturn = bloodSpending;

                            if (actorData.system.advantages[key].system.temporary > bloodpoolMax) {
                                actorData.system.advantages[key].system.temporary = bloodpoolMax;
                            }

                            itemList.push({
                                _id: adv._id,
                                "system.max": bloodpoolMax,
                                "system.perturn": bloodSpending,
                                "system.temporary": actorData.system.advantages[key].system.temporary
                            });
                        }  
                        
                        
                    }   
                    
                    continue;
                }
            }

            traitMax = parseInt(actorData.system.settings.powers.defaultmaxvalue);

            for (const sphere of spheres) {
                if (sphere.system.max !== traitMax) {
                    itemList.push({ _id: sphere._id, "system.max": traitMax });
                }
            }

            for (const power of powers) {
                if (power.system.max !== traitMax) {
                    itemList.push({ _id: power._id, "system.max": traitMax });
                }
            }

            // Set power type flags based on what powers exist on the actor
            actorData.system.settings.hasdisciplines = false;
            actorData.system.settings.hascombinationdisciplines = false;
            actorData.system.settings.hasrituals = false;
            actorData.system.settings.hasgifts = false;
            actorData.system.settings.hasrites = false;
            actorData.system.settings.hasshapes = false;
            actorData.system.settings.hasspheres = false;
            actorData.system.settings.hasrotes = false;
            actorData.system.settings.hasnuminas = false;

            for (const power of allpowers) {
                if (power.system.type === "wod.types.discipline") {
                    actorData.system.settings.hasdisciplines = true;
                }
                if (power.system.type === "wod.types.combination") {
                    actorData.system.settings.hascombinationdisciplines = true;
                }
                if (power.system.type === "wod.types.ritual") {
                    actorData.system.settings.hasrituals = true;
                }
                if (power.system.type === "wod.types.gift") {
                    actorData.system.settings.hasgifts = true;
                }
                if (power.system.type === "wod.types.rite") {
                    actorData.system.settings.hasrites = true;
                }
                if (power.system.type === "wod.types.numina") {
                    actorData.system.settings.hasnuminas = true;
                }
                if (power.type === "Sphere") {
                    actorData.system.settings.hasspheres = true;
                }
                if (power.type === "Rote") {
                    actorData.system.settings.hasrotes = true;
                }
            }            

            actorData.system.settings.hasshapes = shapes.length > 0;
            actorData.system.settings.hasresonances = resonances.length > 0;

            if (itemList.length > 0) {
                this.updateEmbeddedDocuments("Item", itemList);
            }


        }
    }

    

    /**
     * @override
     * Handle data that happens before the creation of a new item document
     */
    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);
        const actor = this;

        try {
            let updates = {};

            if (!actor.system.settings.iscreated) {
                updates["system.settings.usesplatfont"] = game.settings.get('worldofdarkness', 'useSplatFonts');

                if (data.type == "PC") {
                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.era"] = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultMortalEra];

                    console.log(`Create PC`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.mortal) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);  
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, "mortal", CONFIG.worldofdarkness.defaultMortalEra);

                    updates["system.settings.iscreated"] = true;		
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.era"] = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultMortalEra];

                    // Create items
                    await CreateHelper.SetMortalAbilities(this, CONFIG.worldofdarkness.defaultMortalEra);   

                    console.log(`Create ${CONFIG.worldofdarkness.sheettype.mortal}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.werewolf) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, CONFIG.worldofdarkness.splat.werewolf, CONFIG.worldofdarkness.defaultWerewolfEra);
                    updates = await CreateHelper.SetWerewolfAttributesv2(updates, this);

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.era"] = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultWerewolfEra];
                    updates["system.settings.variant"] = "general";
                    updates["system.settings.isshapecreated"] = true;

                    // Create items
                    await CreateHelper.SetWerewolfAbilities(this, CONFIG.worldofdarkness.defaultWerewolfEra);
                    await CreateHelper.CreateShape(this, game.data.system.version);

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.werewolf}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.vampire) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, CONFIG.worldofdarkness.splat.vampire, CONFIG.worldofdarkness.defaultVampireEra);             
                    updates = await CreateHelper.SetVampireAttributesv2(updates, this);                    

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.era"] = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultVampireEra];

                    // Create items
                    await CreateHelper.SetVampireAbilities(this, CONFIG.worldofdarkness.defaultVampireEra);

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.vampire}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.mage) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, CONFIG.worldofdarkness.splat.mage, CONFIG.worldofdarkness.defaultMageEra);
                    updates = await CreateHelper.SetMageAttributesv2(updates, this);

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.era"] = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultMageEra];
                    updates["system.settings.variant"] = "general";                    
            
                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.mage}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.changeling) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, "changeling", "modern");   
                    updates = await CreateHelper.SetChangelingAttributesv2(updates, this);

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.era"] = CONFIG.worldofdarkness.era["modern"];
                    updates["system.settings.variant"] = "general";

                    // Create items
                    await CreateHelper.SetChangelingAbilities(this);
                    
                    console.log(`Create ${CONFIG.worldofdarkness.sheettype.changeling}`);
                } 

                if (data.type == CONFIG.worldofdarkness.sheettype.hunter) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, "hunter", "modern");
                    updates = await CreateHelper.SetHunterAttributesv2(updates, this);	

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.variant"] = "general";                    

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.hunter}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.demon) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, "demon", "modern");
                    updates = await CreateHelper.SetDemonAttributesv2(updates, this);	

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;
                    updates["system.settings.variant"] = "general";                    

                    // Create items
                    await CreateHelper.SetDemonAbilities(this);

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.demon}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.mummy) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, "mummy", "modern");
                    updates = await CreateHelper.SetMummyAttributesv2(updates, this);

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;	
                    updates["system.settings.variant"] = "general";
            
                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.mummy}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.wraith) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, "wraith", "modern");
                    updates = await CreateHelper.SetWraithAttributesv2(updates, this);	

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;                   

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.wraith}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetAbilitiesv2(updates, this, CONFIG.worldofdarkness.sheettype.werewolf.toLowerCase(), CONFIG.worldofdarkness.defaultWerewolfEra);
                    // since no shifter type has been selected only set as werewolf so far			
                    updates = await CreateHelper.SetWerewolfAttributesv2(updates, this);

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;                    

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.changingbreed}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.exalted) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);

                    updates = await CreateHelper.SetAbilitiesv2(updates, this, "exalted", "modern");
                    updates = await CreateHelper.SetExaltedAttributesv2(updates, this);        
                    // Note: _keepSheetValuesCorrect still uses data, needs to be handled separately if needed

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;	                    
            
                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.exalted}`);
                }

                if (data.type == CONFIG.worldofdarkness.sheettype.creature) {
                    updates = await CreateHelper.SetMortalAttributesv2(updates, this);
                    updates = await CreateHelper.SetCreatureAttributesv2(updates, this);
                    updates = await CreateHelper.SetCreatureAbilitiesv2(updates, this);

                    updates["system.settings.iscreated"] = true;
                    updates["system.settings.version"] = game.data.system.version;

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.creature}`);
                }	
            }  

            if (Object.keys(updates).length > 0) {
                this.updateSource(updates);
            }
        }
		catch (err) {
			err.message = `Failed _preCreate Actor ${data?.name}: ${err.message}`;
			console.error(err);
		}
    }

  /**
   * @override
   * Post-process a creation operation for a single Document instance. Post-operation events occur for all connected clients.
   * @param data - The initial data object provided to the document creation request
   * @param options - Additional options which modify the creation request
   * @param userId - The id of the User requesting the document update
  */
    async _onCreate(data, options, userId) {
        await super._onCreate(data, options, userId);
    }

    async _onUpdate(updateData, options, user) {
        super._onUpdate(updateData, options, user);

        if (this.type !== "PC") {
            let actor;

            try {
                actor = this;

                if ((!actor) || (actor == undefined)) {
                    return;
                }

                // if no owner skip
                if (actor.permission < 3) {
                    return;
                }

                updateData = foundry.utils.duplicate(actor);

                if ((actor.type != CONFIG.worldofdarkness.sheettype.vampire) && (actor.type != "PC")) {
                    for (const i in updateData.system?.abilities) {
                        if ((updateData.system.abilities[i].max !== updateData.system.settings.abilities.defaultmaxvalue) && (updateData.system.settings.isupdated)) {
                            updateData.system.settings.isupdated = false;
                        }                
                    }
                }
            
                if ((updateData?.system?.settings?.isupdated == undefined) || (updateData?.system?.settings?.isupdated)) {
                    return;
                }        

                let advantageRollSetting = true;        
                let isSpirit = false;

                if ((updateData.type == CONFIG.worldofdarkness.sheettype.creature) && (updateData.system.settings.variant == "spirit")) {
                    isSpirit = true;
                }

                try {
                    advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
                } 
                catch (e) {
                    advantageRollSetting = true;
                }

                // abilities max
                // set base line of what is normally max values
                updateData = await this._setAbilityMaxValue(updateData);

                // willpower
                if (updateData.system.settings.variant != "spirit") {
                    if ((CONFIG.worldofdarkness.attributeSettings == "5th") && (CONFIG.worldofdarkness.fifthEditionWillpowerSetting == "5th")) {
                        updateData.system.advantages.willpower.permanent = parseInt(updateData.system.attributes.composure.value) + parseInt(updateData.system.attributes.resolve.value);
                    }
                    
                        
                }            
                
                if (updateData.system.advantages.willpower.permanent > updateData.system.advantages.willpower.max) {
                    updateData.system.advantages.willpower.permanent = updateData.system.advantages.willpower.max;
                }
                
                if (updateData.system.advantages.willpower.permanent < updateData.system.advantages.willpower.temporary) {
                    updateData.system.advantages.willpower.temporary = updateData.system.advantages.willpower.permanent;
                }

                if (advantageRollSetting) {
                    updateData.system.advantages.willpower.roll = updateData.system.advantages.willpower.permanent;
                }
                else {
                    updateData.system.advantages.willpower.roll = updateData.system.advantages.willpower.permanent > updateData.system.advantages.willpower.temporary ? updateData.system.advantages.willpower.temporary : updateData.system.advantages.willpower.permanent; 
                }

                if ((updateData.system.settings.hasrage) || (updateData.system.settings.hasgnosis)) {
                    updateData = await this._handleWerewolfCalculations(updateData);
                }
                if ((updateData.system.settings.haspath) || (updateData.system.settings.hasbloodpool) || (updateData.system.settings.hasvirtue)) {
                    updateData = await this._handleVampireCalculations(updateData);
                }
                if (updateData.type == CONFIG.worldofdarkness.sheettype.mage) {
                    updateData = await this._handleMageCalculations(updateData);
                }
                if (updateData.system.settings.hasglamour) {
                    updateData = await this._handleChangelingCalculations(updateData);
                }
                if (updateData.system.settings.hasconviction) {
                    updateData = await this._handleHunterCalculations(updateData);
                }
                if ((updateData.system.settings.hasfaith) || (updateData.system.settings.hastorment)) {
                    updateData = await this._handleDemonCalculations(updateData);
                }
                if (updateData.system.settings.hasbalance) {
                    updateData = await this._handleMummyCalculations(updateData);
                }
                if (updateData.type == CONFIG.worldofdarkness.sheettype.wraith) {
                    updateData = await this._handleWraithCalculations(updateData);
                }

                if (updateData.type == CONFIG.worldofdarkness.sheettype.exalted) {
                    updateData = await this._handleExaltedCalculations(updateData);
                    updateData = await this._keepSheetValuesCorrect(updateData);
                }

                await this._setItems(actor, updateData);
                updateData = await this._handleWoundLevelCalculations(updateData);
                updateData = await calculateTotals(updateData);

                // movement needs the total dexterity and all active items to work correctly.
                updateData.system.movement = await CombatHelper.CalculateMovement(updateData);

                updateData.system.settings.isupdated = true;
                await actor.update(updateData);
            }
            catch (err) {
                ui.notifications.error(`Cannot update Actor ${actor?.name}. Please check console for details.`);
                err.message = `Cannot update Actor ${actor?.name}: ${err.message}`;
                console.error(err);
                console.log(actor);
            }
        }    
    }

    async _setAbilityMaxValue(actorData) {
        if (!Functions.isNumber(actorData.system.settings.abilities.defaultmaxvalue)) {
            actorData.system.settings.abilities.defaultmaxvalue = 5;
        }
        if (!Functions.isNumber(actorData.system.settings.powers.defaultmaxvalue)) {
            actorData.system.settings.powers.defaultmaxvalue = 5;
        }

        try {
            if (actorData.type !== "PC") {
                for (const i in actorData.system.abilities) {
                    if (actorData.system.abilities[i].max !== actorData.system.settings.abilities.defaultmaxvalue) {
                        actorData.system.abilities[i].max = actorData.system.settings.abilities.defaultmaxvalue;
                    }                
                }
            }
            else {
                for (const bio in actorData.system.bio.splatfields) {
                    if (actorData.system.bio.splatfields[bio].label == "wod.bio.vampire.generation") {                    
                        const traitMax = await this._calculteMaxTrait(parseInt(actorData.system.bio.splatfields.generation.value) - parseInt(actorData.system.bio.splatfields.generation.mod));

                        actorData.system.settings.attributes.defaultmaxvalue = traitMax;
                        actorData.system.settings.abilities.defaultmaxvalue = traitMax;
                        actorData.system.settings.powers.defaultmaxvalue = traitMax;
                    }
                }
            }     
        }
        catch (err) {
            ui.notifications.error("Cannot set abilities to max rating. Please check console for details.");
            err.message = `Cannot set abilities to max rating for Actor ${actorData.name}: ${err.message}`;
            console.error(err);
            console.log(actorData);
        }		

        return actorData;
    }

    async _handleWoundLevelCalculations(actorData) {
        try
        {
            let totalNormWoundLevels = parseInt(actorData.system.health.damage.bashing) + parseInt(actorData.system.health.damage.lethal) + parseInt(actorData.system.health.damage.aggravated);
            let totalChimericalWoundLevels = 0;
            
            if (actorData.system.health.damage.chimerical != undefined) {
                totalChimericalWoundLevels = parseInt(actorData.system.health.damage.chimerical.bashing) + parseInt(actorData.system.health.damage.chimerical.lethal) + parseInt(actorData.system.health.damage.chimerical.aggravated);
            }
    
            let totalWoundLevels = totalNormWoundLevels < totalChimericalWoundLevels ? totalChimericalWoundLevels : totalNormWoundLevels;
    
            // calculate total amount of health levels
            actorData.system.traits.health.totalhealthlevels.max = 0;
    
            for (const i in CONFIG.worldofdarkness.woundLevels) {
                actorData.system.traits.health.totalhealthlevels.max += parseInt(actorData.system.health[i].total);
            }
    
            actorData.system.traits.health.totalhealthlevels.value = actorData.system.traits.health.totalhealthlevels.max - totalWoundLevels;
    
            if (totalWoundLevels == 0) {
                actorData.system.health.damage.woundlevel = "";
                actorData.system.health.damage.woundpenalty = 0;
    
                return actorData;
            }		
    
            // check wound level and wound penalty
            for (const i in CONFIG.worldofdarkness.woundLevels) {
                totalWoundLevels = totalWoundLevels - parseInt(actorData.system.health[i].total);
    
                if (totalWoundLevels <= 0) {
                    actorData.system.health.damage.woundlevel = actorData.system.health[i].label;
                    actorData.system.health.damage.woundpenalty = parseInt(actorData.system.health[i].penalty);
    
                    return actorData;
                }
            }	
        }
        catch (err) {
            err.message = `Failed _handleWoundLevelCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }
		
        
        return actorData;
	}

    async _handleVampireCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

        try {
            actorData.system.advantages.path.roll = parseInt(actorData.system.advantages.path.permanent);
            actorData.system.advantages.virtues.conscience.roll = parseInt(actorData.system.advantages.virtues.conscience.permanent);
            actorData.system.advantages.virtues.selfcontrol.roll = parseInt(actorData.system.advantages.virtues.selfcontrol.permanent);
            actorData.system.advantages.virtues.courage.roll = parseInt(actorData.system.advantages.virtues.courage.permanent);	
            
            if (actorData.system.advantages.path.permanent == 1) {
                actorData.system.advantages.path.bearing = 2;
            }
            else if ((actorData.system.advantages.path.permanent >= 2) && (actorData.system.advantages.path.permanent <= 3)) {
                actorData.system.advantages.path.bearing = 1;
            }
            else if ((actorData.system.advantages.path.permanent >= 4) && (actorData.system.advantages.path.permanent <= 7)) {
                actorData.system.advantages.path.bearing = 0;
            }
            else if ((actorData.system.advantages.path.permanent >= 8) && (actorData.system.advantages.path.permanent <= 9)) {
                actorData.system.advantages.path.bearing = -1;
            }
            else if (actorData.system.advantages.path.permanent == 10) {
                actorData.system.advantages.path.bearing = -2;
            }

            if (actorData.type != CONFIG.worldofdarkness.sheettype.vampire) {
                if (!Functions.isNumber(actorData.system.settings.powers.defaultmaxvalue)) {
                    actorData.system.settings.powers.defaultmaxvalue = 5;
                }
                if (!Functions.isNumber(actorData.system.settings.abilities.defaultmaxvalue)) {
                    actorData.system.settings.abilities.defaultmaxvalue = 5;
                }
            }
            else {
                const bloodpoolMax = this._calculteMaxBlood(actorData.system.generation - actorData.system.generationmod);
                const bloodSpending = this._calculteMaxBloodSpend(actorData.system.generation - actorData.system.generationmod);
                const traitMax = this._calculteMaxTrait(actorData.system.generation - actorData.system.generationmod);
                actorData.system.settings.abilities.defaultmaxvalue = traitMax;
                actorData.system.settings.powers.defaultmaxvalue = traitMax;

                // attributes max
                for (const i in actorData.system.attributes) {
                    actorData.system.attributes[i].max = traitMax;

                    if (actorData.system.attributes[i].value > traitMax) {
                        actorData.system.attributes[i].value = traitMax;
                    }
                }

                for (const i in actorData.system.abilities) {
                    actorData.system.abilities[i].max = traitMax;

                    if (actorData.system.abilities[i].value > traitMax) {
                        actorData.system.abilities[i].value = traitMax;
                    }
                }

                // virtues
                for (const i in actorData.system.advantages.virtues) {
                    actorData.system.advantages.virtues[i].max = 5;
                }

                // blood pool
                actorData.system.advantages.bloodpool.max = bloodpoolMax;
                actorData.system.advantages.bloodpool.perturn = bloodSpending;

                if (actorData.system.advantages.bloodpool.temporary > bloodpoolMax) {
                    actorData.system.advantages.bloodpool.temporary = bloodpoolMax;
                }
            }
        }
        catch (err) {
            err.message = `Failed _handleVampireCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }				

        return actorData;
	}

    _calculteMaxBlood(selectedGeneration) {
        let bloodpoolMax = 10;
    
        if (selectedGeneration == 16) {
            bloodpoolMax = 4;
        }
        if (selectedGeneration == 15) {
            bloodpoolMax = 6;
        }
        if (selectedGeneration == 14) {
            bloodpoolMax = 8;
        }
        if (selectedGeneration == 12) {
            bloodpoolMax = 11;
        }
        if (selectedGeneration == 11) {
            bloodpoolMax = 12;
        }
        if (selectedGeneration == 10) {
            bloodpoolMax = 13;
        }
        if (selectedGeneration == 9) {
            bloodpoolMax = 14;
        }
        if (selectedGeneration == 8) {
            bloodpoolMax = 15;
        }
        if (selectedGeneration == 7) {
            bloodpoolMax = 20;
        }
        if (selectedGeneration == 6) {
            bloodpoolMax = 30;
        }
        if (selectedGeneration == 5) {
            bloodpoolMax = 40;
        }
        if (selectedGeneration == 4) {
            bloodpoolMax = 50;
        }
    
        return bloodpoolMax;
    }

    _calculteMaxBloodSpend(selectedGeneration) {
        let bloodSpending = 1;
    
        if (selectedGeneration == 9) {
            bloodSpending = 2;
        }
        if (selectedGeneration == 8) {
            bloodSpending = 3;
        }
        if (selectedGeneration == 7) {
            bloodSpending = 4;
        }
        if (selectedGeneration == 6) {
            bloodSpending = 6;
        }
        if (selectedGeneration == 5) {
            bloodSpending = 8;
        }
        if (selectedGeneration == 4) {
            bloodSpending = 10;
        }
    
        return bloodSpending;
    }

    _calculteMaxTrait(selectedGeneration) {
        let traitMax = 5;
    
        if (selectedGeneration == 7) {
            traitMax = 6;
        }
        if (selectedGeneration == 6) {
            traitMax = 7;
        }
        if (selectedGeneration == 5) {
            traitMax = 8;
        }
        if (selectedGeneration == 4) {
            traitMax = 9;
        }
    
        return traitMax;
    }


    async _handleWerewolfCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }
        
        try {
            let advantageRollSetting = true;
    
            try {
                advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
            } 
            catch (e) {
                advantageRollSetting = true;
            }
    
            // shift
            if ((actorData.type == CONFIG.worldofdarkness.sheettype.werewolf) || (actorData.type == CONFIG.worldofdarkness.sheettype.changingbreed)) {
                if ((!actorData.system.shapes.homid.isactive) &&
                    (!actorData.system.shapes.glabro.isactive) &&
                    (!actorData.system.shapes.crinos.isactive) &&
                    (!actorData.system.shapes.hispo.isactive) &&
                    (!actorData.system.shapes.lupus.isactive)) {
                    actorData.system.shapes.homid.isactive = true;				
                }
    
                if (actorData.system.shapes.homid.isactive) {
                    actorData.system.shapes.glabro.isactive = false;
                    actorData.system.shapes.crinos.isactive = false;
                    actorData.system.shapes.hispo.isactive = false;
                    actorData.system.shapes.lupus.isactive = false;
                }
                else if (actorData.system.shapes.glabro.isactive) {
                    actorData.system.shapes.homid.isactive = false;
                    actorData.system.shapes.crinos.isactive = false;
                    actorData.system.shapes.hispo.isactive = false;
                    actorData.system.shapes.lupus.isactive = false;
                }
                else if (actorData.system.shapes.crinos.isactive) {
                    actorData.system.shapes.homid.isactive = false;
                    actorData.system.shapes.glabro.isactive = false;
                    actorData.system.shapes.hispo.isactive = false;
                    actorData.system.shapes.lupus.isactive = false;
                }
                else if (actorData.system.shapes.hispo.isactive) {
                    actorData.system.shapes.homid.isactive = false;
                    actorData.system.shapes.glabro.isactive = false;
                    actorData.system.shapes.crinos.isactive = false;
                    actorData.system.shapes.lupus.isactive = false;
                }
                else if (actorData.system.shapes.lupus.isactive) {
                    actorData.system.shapes.homid.isactive = false;
                    actorData.system.shapes.glabro.isactive = false;
                    actorData.system.shapes.crinos.isactive = false;
                    actorData.system.shapes.hispo.isactive = false;
                }
            }
    
            // rage
            if (actorData.system.advantages.rage.permanent > actorData.system.advantages.rage.max) {
                actorData.system.advantages.rage.permanent = actorData.system.advantages.rage.max;
            }
            
            // gnosis
            if (actorData.system.advantages.gnosis.permanent > actorData.system.advantages.gnosis.max) {
                actorData.system.advantages.gnosis.permanent = actorData.system.advantages.gnosis.max;
            }
            
            if (actorData.system.advantages.gnosis.permanent < actorData.system.advantages.gnosis.temporary) {
                actorData.system.advantages.gnosis.temporary = actorData.system.advantages.gnosis.permanent;
            }				
    
            if (advantageRollSetting) {
                actorData.system.advantages.rage.roll = actorData.system.advantages.rage.permanent; 
                actorData.system.advantages.gnosis.roll = actorData.system.advantages.gnosis.permanent;
                actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent; 
            }
            else {
                actorData.system.advantages.rage.roll = actorData.system.advantages.rage.permanent > actorData.system.advantages.rage.temporary ? actorData.system.advantages.rage.temporary : actorData.system.advantages.rage.permanent; 
                actorData.system.advantages.gnosis.roll = actorData.system.advantages.gnosis.permanent > actorData.system.advantages.gnosis.temporary ? actorData.system.advantages.gnosis.temporary : actorData.system.advantages.gnosis.permanent;
                actorData.system.advantages.willpower.roll = actorData.system.advantages.willpower.permanent > actorData.system.advantages.willpower.temporary ? actorData.system.advantages.willpower.temporary : actorData.system.advantages.willpower.permanent; 
            }		
    
            for (const item of actorData.items) {
                if (item.type == "Bonus") {
                    if ((item.system.parentid == "glabro") || (item.system.parentid == "crinos") || (item.system.parentid == "hispo") || (item.system.parentid == "lupus")) {
                        item.system.isactive = false;
                    }
    
                    if (actorData.system.shapes != undefined) {
                        if ((actorData.system.shapes.hispo.isactive) && (item.system.parentid == "hispo")) {
                            if ((item.system.settingtype == "perception") && (CONFIG.worldofdarkness.attributeSettings == "20th")) {
                                item.system.isactive = true;
                            }
                            else if ((item.system.settingtype == "wits") && (CONFIG.worldofdarkness.attributeSettings == "5th")) {
                                item.system.isactive = true;
                            }	
                            else {
                                item.system.isactive = true;
                            }				
                        }
                        else if ((actorData.system.shapes.lupus.isactive) && (item.system.parentid == "lupus")) {
                            if ((item.system.settingtype == "perception") && (CONFIG.worldofdarkness.attributeSettings == "20th")) {
                                item.system.isactive = true;
                            }
                            else if ((item.system.settingtype == "wits") && (CONFIG.worldofdarkness.attributeSettings == "5th")) {
                                item.system.isactive = true;
                            }
                            else {
                                item.system.isactive = true;
                            }
                        }
                        else  {
                            if (((actorData.system.shapes.glabro.isactive) && (item.system.parentid == "glabro")) ||
                                    ((actorData.system.shapes.crinos.isactive) && (item.system.parentid == "crinos")) ||
                                    ((actorData.system.shapes.hispo.isactive) && (item.system.parentid == "hispo")) ||
                                    ((actorData.system.shapes.lupus.isactive) && (item.system.parentid == "lupus"))) {
                                item.system.isactive = true;
                            }						
                        }
                    }
                }
            }
        }
        catch (err) {
            err.message = `Failed _handleWerewolfCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;
	}

    async _handleMageCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

        try {
            actorData.system.advantages.arete.roll = parseInt(actorData.system.advantages.arete.permanent);
            actorData.system.paradox.roll = parseInt(actorData.system.paradox.temporary) + parseInt(actorData.system.paradox.permanent);
    
            let areteMax = parseInt(actorData.system.advantages.arete.permanent);
    
            if (areteMax < 5) {
                areteMax = 5;
            }
    
            for (const sphere in actorData.system.spheres) {
                actorData.system.spheres[sphere].max = areteMax;
            }
        }
        catch (err) {
            err.message = `Failed _handleMageCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;
	}

    async _handleChangelingCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

        try {
            // glamour
            if (actorData.system.advantages.glamour.permanent > actorData.system.advantages.glamour.max) {
                actorData.system.advantages.glamour.permanent = actorData.system.advantages.glamour.max;
            }

            if (actorData.system.advantages.glamour.permanent < actorData.system.advantages.glamour.temporary) {
                actorData.system.advantages.glamour.temporary = actorData.system.advantages.glamour.permanent;
            }

            // nightmare
            if (actorData.system.advantages.nightmare.temporary > actorData.system.advantages.nightmare.max) {
                actorData.system.advantages.nightmare.temporary = actorData.system.advantages.nightmare.max;
            }

            // banality
            if (actorData.system.advantages.banality.permanent > actorData.system.advantages.banality.max) {
                actorData.system.advantages.banality.permanent = actorData.system.advantages.banality.max;
            }

            let advantageRollSetting = true;

            try {
                advantageRollSetting = CONFIG.worldofdarkness.rollSettings;
            } 
            catch (e) {
                advantageRollSetting = true;
            }

            if (advantageRollSetting) {
                actorData.system.advantages.glamour.roll = actorData.system.advantages.glamour.permanent; 			
                actorData.system.advantages.banality.roll = actorData.system.advantages.banality.permanent;
            }
            else {
                actorData.system.advantages.glamour.roll = actorData.system.advantages.glamour.permanent > actorData.system.advantages.glamour.temporary ? actorData.system.advantages.glamour.temporary : actorData.system.advantages.glamour.permanent; 
                actorData.system.advantages.banality.roll = actorData.system.advantages.banality.permanent > actorData.system.advantages.banality.temporary ? actorData.system.advantages.banality.temporary : actorData.system.advantages.banality.permanent;
            }

            actorData.system.advantages.nightmare.roll = actorData.system.advantages.nightmare.temporary;
        }
        catch (err) {
            err.message = `Failed _handleChangelingCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;		
	}

	async _handleHunterCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

        try {
            let primary = actorData.system.primaryvirtue;

            if (primary == "wod.advantages.virtue.mercy") {
                primary = "mercy";
            }
            else if (primary == "wod.advantages.virtue.vision") {
                primary = "vision";
            }
            else if (primary == "wod.advantages.virtue.zeal") {
                primary = "zeal";
            }
    
            // virtues
            if (primary != "") {			
                if (actorData.system.advantages.virtues.mercy.permanent > actorData.system.advantages.virtues[primary].permanent) {
                    actorData.system.advantages.virtues.mercy.permanent = actorData.system.advantages.virtues[primary].permanent;
                }
    
                if (actorData.system.advantages.virtues.mercy.spent > actorData.system.advantages.virtues.mercy.permanent) {
                    actorData.system.advantages.virtues.mercy.spent = actorData.system.advantages.virtues.mercy.permanent;
                }
    
                if (actorData.system.advantages.virtues.vision.permanent > actorData.system.advantages.virtues[primary].permanent) {
                    actorData.system.advantages.virtues.vision.permanent = actorData.system.advantages.virtues[primary].permanent;
                }
    
                if (actorData.system.advantages.virtues.vision.spent > actorData.system.advantages.virtues.vision.permanent) {
                    actorData.system.advantages.virtues.vision.spent = actorData.system.advantages.virtues.vision.permanent;
                }
    
                if (actorData.system.advantages.virtues.zeal.permanent > actorData.system.advantages.virtues[primary].permanent) {
                    actorData.system.advantages.virtues.zeal.permanent = actorData.system.advantages.virtues[primary].permanent;
                }
    
                if (actorData.system.advantages.virtues.zeal.spent > actorData.system.advantages.virtues.zeal.permanent) {
                    actorData.system.advantages.virtues.zeal.spent = actorData.system.advantages.virtues.zeal.permanent;
                }
            }
            else {
                console.warn("WoD | _handleHunterCalculations - Primary virtue not selected.");
            }
            
            actorData.system.advantages.virtues.mercy.roll = parseInt(actorData.system.advantages.virtues.mercy.permanent);
            actorData.system.advantages.virtues.vision.roll = parseInt(actorData.system.advantages.virtues.vision.permanent);
            actorData.system.advantages.virtues.zeal.roll = parseInt(actorData.system.advantages.virtues.zeal.permanent);		
        }
        catch (err) {
            err.message = `Failed _handleHunterCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;		
	}

	async _handleDemonCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

        try {
            // faith
            if (actorData.system.settings.hasfaith) {
                if (actorData.system.advantages.faith.permanent > actorData.system.advantages.faith.max) {
                    actorData.system.advantages.faith.permanent = actorData.system.advantages.faith.max;
                }
                
                if (actorData.system.advantages.faith.permanent < actorData.system.advantages.faith.temporary) {
                    actorData.system.advantages.faith.temporary = actorData.system.advantages.faith.permanent;
                }

                actorData.system.advantages.faith.roll = parseInt(actorData.system.advantages.faith.permanent);	
            } 

            // torment
            if (actorData.system.settings.hastorment) {
                if (actorData.system.advantages.torment.permanent > actorData.system.advantages.torment.max) {
                    actorData.system.advantages.torment.permanent = actorData.system.advantages.torment.max;
                }

                if (actorData.system.advantages.torment.temporary > actorData.system.advantages.torment.max) {
                    actorData.system.advantages.torment.temporary = actorData.system.advantages.torment.max;
                }
            }
        }
        catch (err) {
            err.message = `Failed _handleDemonCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;		
	}

	async _handleMummyCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

        try {
            // balance
            if (actorData.system.settings.hasbalance) {
                actorData.system.advantages.balance.roll = parseInt(actorData.system.advantages.balance.permanent);	
            } 
        }
        catch (err) {
            err.message = `Failed _handleMummyCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;
		
	}

    async _handleWraithCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

       if (actorData.system.advantages.corpus.permanent > actorData.system.advantages.corpus.max) {
            actorData.system.advantages.corpus.permanent = actorData.system.advantages.corpus.max;
        }
        
        if (actorData.system.advantages.corpus.permanent < actorData.system.advantages.corpus.temporary) {
            // has to check the health levels
            if ((actorData.system.health.damage.corpus.bashing + actorData.system.health.damage.corpus.lethal + actorData.system.health.damage.corpus.aggravated) > actorData.system.advantages.corpus.permanent) {
                let diff = actorData.system.advantages.corpus.temporary - actorData.system.advantages.corpus.permanent;

                if ((actorData.system.health.damage.corpus.bashing > 0) && (diff > 0)) {
                    if (actorData.system.health.damage.corpus.bashing >= diff) {
                        actorData.system.health.damage.corpus.bashing -= diff;
                        diff = 0;                        
                    }
                    else {
                        diff -= actorData.system.health.damage.corpus.bashing;
                        actorData.system.health.damage.corpus.bashing = 0;
                    }
                }
                if ((actorData.system.health.damage.corpus.lethal > 0) && (diff > 0)) {
                    if (actorData.system.health.damage.corpus.lethal >= diff) {
                        actorData.system.health.damage.corpus.lethal -= diff;
                        diff = 0;                        
                    }
                    else {
                        diff -= actorData.system.health.damage.corpus.lethal;
                        actorData.system.health.damage.corpus.lethal = 0;
                    }
                }
                if ((actorData.system.health.damage.corpus.aggravated > 0) && (diff > 0)) {
                    if (actorData.system.health.damage.corpus.aggravated >= diff) {
                        actorData.system.health.damage.corpus.aggravated -= diff;
                        diff = 0;                        
                    }
                    else {
                        diff -= actorData.system.health.damage.corpus.aggravated;
                        actorData.system.health.damage.corpus.aggravated = 0;
                    }
                }
            }

            actorData.system.advantages.corpus.temporary = actorData.system.advantages.corpus.permanent;
        }

        return actorData;
    }

    async _handleExaltedCalculations(actorData) {
        if (actorData.type == "PC") {
            return actorData;
        }

        try {
            actorData.system.advantages.essence.roll = actorData.system.advantages.essence.permanent; 
        }
        catch (err) {
            err.message = `Failed _handleExaltedCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;
    }

    // Securing bonus items needs still to be handled here even by PC actors
    async _setItems() {        
        const actor = this;

        const items = actor?.items || [];

        // bonus item correctly active if connected item has changed active status
        const bonuses = items.filter(item => item.type === "Bonus" && item.system.parentid != -1);
        for (const bonus of bonuses) {
            const parentItem = await actor.getEmbeddedDocument("Item", bonus.system.parentid);
            // e.g Werewolf bonus
            if (parentItem == undefined) {
                continue;
            }

            if (parentItem.system.isactive != bonus.system.isactive) {
                const item = await actor.getEmbeddedDocument("Item", bonus._id);
                let bonusData = foundry.utils.duplicate(item);
                bonusData.system.isactive = parentItem.system.isactive;
                await item.update(bonusData);
            }
        }

        // secondary skills to correct max value.
        const abilities = items.filter(item => item.type === "Ability" || (item.type === "Trait" && (item.system.type === "wod.types.talentsecondability" || item.system.type === "wod.types.skillsecondability" || item.system.type === "wod.types.knowledgesecondability")));
        for (const ability of abilities) {
            if (ability.system.max != parseInt(actor.system.settings.abilities.defaultmaxvalue)) {
                const item = await actor.getEmbeddedDocument("Item", ability._id);
                let itemData = foundry.utils.duplicate(item);
                itemData.system.max = parseInt(actor.system.settings.abilities.defaultmaxvalue)
                await item.update(itemData);
            }
        }

        const powers = items.filter(item => item.type == "Power");
        
        // Update powers based on secondaryabilityid
        const updates = [];
        for (const power of powers) {
            let needsUpdate = false;
            let itemData = foundry.utils.duplicate(power);
            
            if (power.system.secondaryabilityid === "") {
                // If secondaryabilityid is empty, set max to defaultmaxvalue
                if (power.system.max != parseInt(actor.system.settings.powers.defaultmaxvalue)) {
                    itemData.system.max = parseInt(actor.system.settings.powers.defaultmaxvalue);
                    needsUpdate = true;
                }
            } else {
                // If secondaryabilityid contains something, set value and max to 0
                if ((power.system.value != 0) || (power.system.max != 0)) {
                    itemData.system.value = 0;
                    itemData.system.max = 0;
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                updates.push(itemData);
            }
        }
        
        // Perform all updates in a single batch
        if (updates.length > 0) {
            await actor.updateEmbeddedDocuments("Item", updates);
        }
    }

    // Function to sort out the correct visible name of the Actor's renown
    GetShifterRenownName(type, renown) {
        renown = renown.toLowerCase();

        let newtext = renown;

        try {
            
            type = type.toLowerCase();

            if (renown.toLowerCase() == "glory") {
                newtext = "wod.advantages.glory";
            }
            if (renown.toLowerCase() == "honor") { 
                newtext = "wod.advantages.honor";
            }
            if (renown.toLowerCase() == "wisdom") { 
                newtext = "wod.advantages.wisdom";
            }

            if (type == "wod.bio.werewolf.blackspiraldancer") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.power";
                }
                if (renown.toLowerCase() == "wisdom") { 
                    newtext = "wod.advantages.cunning";
                }
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.infamy";
                }
            }

            if (type == "bastet") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.ferocity";
                }
                if (renown.toLowerCase() == "wisdom") { 
                    newtext = "wod.advantages.cunning";
                }
            }
            if (type == "ajaba") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.ferocity";
                }
                if (renown.toLowerCase() == "wisdom") { 
                    newtext = "wod.advantages.cunning";
                }
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.obligation";
                }
            }
            if (type == "ananasi") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.obedience";
                }
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.cunning";
                }
            }
            if (type == "gurahl") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.honor";
                }
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.succor";
                }
            }
            if (type == "kitsune") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.chie";
                }
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.toku";
                }
                if (renown.toLowerCase() == "wisdom") { 
                    newtext = "wod.advantages.kagayaki";
                }
            }
            if (type == "nuwisha") {
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.humor";
                }
                if (renown.toLowerCase() == "wisdom") { 
                    newtext = "wod.advantages.cunning";
                }
            }
            if (type == "ratkin") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.infamy";
                }
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.obligation";
                }
                if (renown.toLowerCase() == "wisdom") { 
                    newtext = "wod.advantages.cunning";
                }
            }
            
            if (type == "rokea") {
                if (renown.toLowerCase() == "glory") { 
                    newtext = "wod.advantages.valor";
                }
                if (renown.toLowerCase() == "honor") { 
                    newtext = "wod.advantages.harmony";
                }
                if (renown.toLowerCase() == "wisdom") { 
                    newtext = "wod.advantages.innovation";
                }
            }
        }
        catch {

        }

        return newtext;
    }

    // Function to get the correct name of the Actor's rank
    GetShifterRank() {
        try {
            const rank = parseInt(this.system.renown.rank);

            if (this.type == CONFIG.worldofdarkness.sheettype.werewolf) {
                if (rank == 0) return game.i18n.localize("wod.advantages.ranknames.garou.rank0");
                if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.garou.rank1");
                if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.garou.rank2");
                if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.garou.rank3");
                if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.garou.rank4");
                if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.garou.rank5");
                if (rank == 6) return game.i18n.localize("wod.advantages.ranknames.garou.rank6");
            }
            if (this.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
                if (this.system.changingbreed == "Bastet") {
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.bastet.rank1");
                    if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.bastet.rank2");
                    if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.bastet.rank3");
                    if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.bastet.rank4");
                    if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.bastet.rank5");
                }
                if (this.system.changingbreed == "Corax") {
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.corax.rank1");
                    if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.corax.rank2");
                    if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.corax.rank3");
                    if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.corax.rank4");
                    if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.corax.rank5");
                }
                if (this.system.changingbreed == "Gurahl") {
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank1");
                    if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank2");
                    if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank3");
                    if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank4");
                    if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.gurahl.rank5");
                }
                if (this.system.changingbreed == "Kitsune") {
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank1");
                    if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank2");
                    if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank3");
                    if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank4");
                    if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.kitsune.rank5");
                }
                if (this.system.changingbreed == "Mokole") {
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.mokole.rank1");
                    if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.mokole.rank2");
                    if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.mokole.rank3");
                    if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.mokole.rank4");
                    if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.mokole.rank5");
                }
                if (this.system.changingbreed == "Nagah") {
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.nagah.rank0");
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.nagah.rank1");
                    if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.nagah.rank2");
                    if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.nagah.rank3");
                    if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.nagah.rank4");
                    if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.nagah.rank5");
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.nagah.rank6");
                }
                if (this.system.changingbreed == "Ratkin") {
                    if (rank == 1) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank1");
                    if (rank == 2) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank2");
                    if (rank == 3) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank3");
                    if (rank == 4) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank4");
                    if (rank == 5) return game.i18n.localize("wod.advantages.ranknames.ratkin.rank5");
                }
            }      
        }
        catch
        {

        }
        
        return "";
    }  
    
    ShowTokenImage(actor, shapeid, image) {
        if (actor == undefined) {
            return false;
        }
        if (actor.type !== "PC") {
            return false;
        }
        
        const shapeform = actor.items.find(item => item.type === "Trait" && item.system.type === "wod.types.shapeform" && item._id === shapeid);

        if ((shapeform.system[image] === undefined) || (shapeform.system[image] === "") || (shapeform.system[image] == "icons/svg/mystery-man.svg")) {
            return false;
        }

        return true;
    }

    async _keepSheetValuesCorrect(actor) {
        const essencepoolMax = await _calculteMaxEssencepool(actor.system.settings.variant, parseInt(actor.system.advantages.essence.permanent));
        const essencepoolSpending = await _calculteMaxEssencepoolSpend(actor.system.settings.variant, parseInt(actor.system.advantages.essence.permanent));
    
        // essence pool
        actor.system.advantages.essencepool.max = essencepoolMax;
        actor.system.advantages.essencepool.perturn = essencepoolSpending;
    
        if (actor.system.advantages.essencepool.temporary > essencepoolMax) {
            actor.system.advantages.essencepool.temporary = essencepoolMax;
        }	

        return actor;
    }
}

async function _calculteMaxEssencepool(variant, essence) {
    let poolMax = 0;

    if ((variant == "solar") || (variant == "abyssal") || (variant == "infernal")) {
        if (essence == 1) {
            return 10;
        }
        if (essence == 2) {
            return 12;
        }
        if (essence == 3) {
            return 15;
        }
        if (essence == 4) {
            return 17;
        }
        if (essence == 5) {
            return 20;
        }
    }
    else if ((variant == "lunar") || (variant == "sidereal") || (variant == "alchemical")) {
        if (essence == 1) {
            return 8;
        }
        if (essence == 2) {
            return 10;
        }
        if (essence == 3) {
            return 12;
        }
        if (essence == 4) {
            return 14;
        }
        if (essence == 5) {
            return 15;
        }
    }
    else if (variant == "dragon") {
        if (essence == 1) {
            return 5;
        }
        if (essence == 2) {
            return 6;
        }
        if (essence == 3) {
            return 7;
        }
        if (essence == 4) {
            return 8;
        }
        if (essence == 5) {
            return 10;
        }
    }
    else if (variant == "liminal") {
        if (essence == 1) {
            return 6;
        }
        if (essence == 2) {
            return 8;
        }
        if (essence == 3) {
            return 10;
        }
        if (essence == 4) {
            return 11;
        }
        if (essence == 5) {
            return 12;
        }
    }

    return poolMax;
}

async function _calculteMaxEssencepoolSpend(variant, essence) {
    let essenceSpending = 0;

    if ((variant == "solar") || (variant == "abyssal") || (variant == "infernal")) {
        return essence;
    }
    else if ((variant == "lunar") || (variant == "sidereal") || (variant == "alchemical")) {
        essenceSpending = essence;

        if (essence == 4) {
            return 3;
        }
        if (essence == 5) {
            return 4;
        }
    }
    else if (variant == "dragon") {
        essenceSpending = essence;

        if (essence == 2) {
            return 1;
        }
        if ((essence == 3) || (essence == 4)) {
            return 2;
        }
        if (essence == 5) {
            return 3;
        }
    }
    else if (variant == "liminal") {
        essenceSpending = essence;

        if (essence == 3) {
            return 2;
        }
        if ((essence == 4) || (essence == 5)) {
            return 3;
        }
    }

    return essenceSpending;
}