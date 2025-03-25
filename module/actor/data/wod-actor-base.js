import { calculateTotals } from "../../scripts/totals.js";
import CombatHelper from "../../scripts/combat-helpers.js";
import CreateHelper from "../../scripts/create-helpers.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class WoDActor extends Actor {
    /**
   * Augment the basic actor data with additional dynamic data.
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
        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this._prepareCharacterData(actorData);
    }

  /**
   * Prepare Character type specific data
   */
    _prepareCharacterData(actorData) {
        let listData = [];
        actorData.listData = listData;
    }

    /**
     * @override
     * Handle data that happens before the creation of a new item document
     */
    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);

        if (data.type == CONFIG.worldofdarkness.sheettype.mortal) {
            await CreateHelper.SetMortalAbilities(this, CONFIG.worldofdarkness.defaultMortalEra);            
        }
        if (data.type == CONFIG.worldofdarkness.sheettype.vampire) {
            await CreateHelper.SetVampireAbilities(this, CONFIG.worldofdarkness.defaultVampireEra);
        }
        if (data.type == CONFIG.worldofdarkness.sheettype.werewolf) {
            await CreateHelper.SetWerewolfAbilities(this, CONFIG.worldofdarkness.defaultWerewolfEra);				
            await CreateHelper.CreateShape(this, game.data.system.version);
        }    
        if (data.type == CONFIG.worldofdarkness.sheettype.changeling) {
            await CreateHelper.SetChangelingAbilities(this);    
        }
        if (data.type == CONFIG.worldofdarkness.sheettype.demon) {
            await CreateHelper.SetDemonAbilities(this);
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

        try {
            let data = foundry.utils.duplicate(this);

            if (!data.system.settings.iscreated) {
                if (data.type == CONFIG.worldofdarkness.sheettype.mortal) {
                    data.system.settings.iscreated = true;		
                    data.system.settings.version = game.data.system.version;
                    data.system.settings.era = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultMortalEra];
                    
                    data = await CreateHelper.SetAbilities(data, "mortal", CONFIG.worldofdarkness.defaultMortalEra);                
                    data = await CreateHelper.SetMortalAttributes(data);
            
                    console.log(`Create ${CONFIG.worldofdarkness.sheettype.mortal}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.creature) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;

                    data = await CreateHelper.SetCreatureAbilities(data);
                    data = await CreateHelper.SetMortalAttributes(data);
                    data = await CreateHelper.SetCreatureAttributes(data);

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.creature}`);
                }	
                if (data.type == CONFIG.worldofdarkness.sheettype.werewolf) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;
                    data.system.settings.era = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultWerewolfEra];
                    data.system.settings.variant = "general";
                    data.system.settings.isshapecreated = true;

                    data = await CreateHelper.SetAbilities(data, "werewolf", CONFIG.worldofdarkness.defaultWerewolfEra);
                    data = await CreateHelper.SetMortalAttributes(data);				
                    data = await CreateHelper.SetWerewolfAttributes(data);	

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.werewolf}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.vampire) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;
                    data.system.settings.era = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultVampireEra];

                    data = await CreateHelper.SetAbilities(data, "vampire", CONFIG.worldofdarkness.defaultVampireEra);                
                    data = await CreateHelper.SetMortalAttributes(data);
                    data = await CreateHelper.SetVampireAttributes(data);		

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.vampire}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.mage) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;
                    data.system.settings.era = CONFIG.worldofdarkness.era[CONFIG.worldofdarkness.defaultMageEra];
                    data.system.settings.variant = "general";
                    
                    data = await CreateHelper.SetAbilities(data, "mage", CONFIG.worldofdarkness.defaultMageEra);
                    data = await CreateHelper.SetMortalAttributes(data);
                    data = await CreateHelper.SetMageAttributes(data);
            
                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.mage}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.changeling) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;

                    data = await CreateHelper.SetAbilities(data, "changeling", "modern");                
                    data = await CreateHelper.SetMortalAttributes(data);    
                    data = await CreateHelper.SetChangelingAttributes(data);	
                    
                    console.log(`Create ${CONFIG.worldofdarkness.sheettype.changeling}`);
                }            
                if (data.type == CONFIG.worldofdarkness.sheettype.mummy) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;	
                    data.system.settings.variant = "general";
            
                    data = await CreateHelper.SetAbilities(data, "mummy", "modern");
                    data = await CreateHelper.SetMortalAttributes(data);
                    data = await CreateHelper.SetMummyAttributes(data);        
            
                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.mummy}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.wraith) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;

                    data = await CreateHelper.SetAbilities(data, "wraith", "modern");
                    data = await CreateHelper.SetMortalAttributes(data);    
                    data = await CreateHelper.SetWraithAttributes(data);	

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.wraith}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.hunter) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;
                    data.system.settings.variant = "general";

                    data = await CreateHelper.SetAbilities(data, "hunter", "modern");
                    data = await CreateHelper.SetMortalAttributes(data);
                    data = await CreateHelper.SetHunterAttributes(data);	

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.hunter}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.demon) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;
                    data.system.settings.variant = "general";

                    data = await CreateHelper.SetAbilities(data, "demon", "modern");
                    data = await CreateHelper.SetMortalAttributes(data);
                    data = await CreateHelper.SetDemonAttributes(data);	

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.demon}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;

                    data = await CreateHelper.SetAbilities(data, "werewolf", CONFIG.worldofdarkness.defaultWerewolfEra);
                    data = await CreateHelper.SetMortalAttributes(data);	
                    // since no shifter type has been selected only set as werewolf so far			
                    data = await CreateHelper.SetWerewolfAttributes(data);

                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.changingbreed}`);
                }
                if (data.type == CONFIG.worldofdarkness.sheettype.exalted) {
                    data.system.settings.iscreated = true;
                    data.system.settings.version = game.data.system.version;	
            
                    data = await CreateHelper.SetAbilities(data, "exalted", "modern");
                    data = await CreateHelper.SetMortalAttributes(data);
                    data = await CreateHelper.SetExaltedAttributes(data);        
                    data = await this._keepSheetValuesCorrect(data);
            
                    console.log(`Creating ${CONFIG.worldofdarkness.sheettype.exalted}`);
                }
            }  

            await this.update(data);
        }
        catch (err) {
            err.message = `Failed _onCreate Actor ${data.name}: ${err.message}`;
            console.error(err);
        }    
    }

    async _onUpdate(updateData, options, user) {
        super._onUpdate(updateData, options, user);   

        const actor = await game.actors.get(updateData._id);

        // if no owner skip
        if (actor.permission < 3) {
            return;
        }

        updateData = foundry.utils.duplicate(actor);
         
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
        if ((CONFIG.worldofdarkness.attributeSettings == "5th") && (CONFIG.worldofdarkness.fifthEditionWillpowerSetting == "5th")) {
            updateData.system.advantages.willpower.permanent = parseInt(updateData.system.attributes.composure.value) + parseInt(updateData.system.attributes.resolve.value);
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

        if (updateData.type == CONFIG.worldofdarkness.sheettype.exalted) {
            updateData = await this._handleExaltedCalculations(updateData);
            updateData = await this._keepSheetValuesCorrect(updateData);
        }

        updateData = await this._setItems(actor, updateData);
        updateData = await this._handleWoundLevelCalculations(updateData);

        // attributes totals
        // needs to be run last as all items, bonuses and changes needs to be added FIRST before total values can be calculated.
        updateData = await calculateTotals(updateData);


        // movement needs the total dexterity and all active items to work correctly.
        updateData.system.movement = await CombatHelper.CalculateMovement(updateData);

        updateData.system.settings.isupdated = true;
        await actor.update(updateData);
    }

    async _setAbilityMaxValue(actorData) {
        if (actorData.type == CONFIG.worldofdarkness.sheettype.vampire) {
            return actorData;
        }

        try {
            if (!isNumber(actorData.system.settings.abilities.defaultmaxvalue)) {
                actorData.system.settings.abilities.defaultmaxvalue = 5;
            }
            if (!isNumber(actorData.system.settings.powers.defaultmaxvalue)) {
                actorData.system.settings.powers.defaultmaxvalue = 5;
            }

            for (const i in actorData.system.abilities) {
                if (actorData.system.abilities[i].max != actorData.system.settings.abilities.defaultmaxvalue) {
                    actorData.system.abilities[i].max = parseInt(actorData.system.settings.abilities.defaultmaxvalue);
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
                if (!isNumber(actorData.system.settings.powers.defaultmaxvalue)) {
                    actorData.system.settings.powers.defaultmaxvalue = 5;
                }
                if (!isNumber(actorData.system.settings.abilities.defaultmaxvalue)) {
                    actorData.system.settings.abilities.defaultmaxvalue = 5;
                }
            }
            else {
                const bloodpoolMax = await this._calculteMaxBlood(actorData.system.generation - actorData.system.generationmod);
                const bloodSpending = await this._calculteMaxBloodSpend(actorData.system.generation - actorData.system.generationmod);
                const traitMax = await this._calculteMaxTrait(actorData.system.generation - actorData.system.generationmod);
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

    async _calculteMaxBlood(selectedGeneration) {
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

    async _calculteMaxBloodSpend(selectedGeneration) {
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

    async _calculteMaxTrait(selectedGeneration) {
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
    
                // TODO fixa till
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

    async _handleExaltedCalculations(actorData) {
        try {
            actorData.system.advantages.essence.roll = actorData.system.advantages.essence.permanent; 
        }
        catch (err) {
            err.message = `Failed _handleExaltedCalculations Actor ${actorData.name}: ${err.message}`;
            console.error(err);
        }

        return actorData;
    }

    async _setItems(actor, actorData) {
        // bonus item correctly active if connected item has changed active status
        const bonuses = actorData.items.filter(item => item.type === "Bonus" && item.system.parentid != -1);
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

        // if a bonusitem's main item has changed active status
        const bonuslistItems = actorData.items.filter(item => item.system.bonuslist.length > 0);
        for (const bonuslistItem of bonuslistItems) {
            const item = await actor.getEmbeddedDocument("Item", bonuslistItem._id);
            let itemData = foundry.utils.duplicate(item);

            for (let i = 0; i <= itemData.system.bonuslist.length - 1; i++) {
                itemData.system.bonuslist[i].isactive = bonuslistItem.system.isactive;
            }

            await item.update(itemData);
        }

        if (actor.type != CONFIG.worldofdarkness.sheettype.vampire) {
            // secondary skills to correct max value.
            const abilities = actorData.items.filter(item => item.type === "Trait" && (item.system.type === "wod.types.talentsecondability" || item.system.type === "wod.types.skillsecondability" || item.system.type === "wod.types.knowledgesecondability"));
            for (const ability of abilities) {
                if (ability.system.max != parseInt(actorData.system.settings.abilities.defaultmaxvalue)) {
                    const item = await actor.getEmbeddedDocument("Item", ability._id);
                    let itemData = foundry.utils.duplicate(item);
                    itemData.system.max = parseInt(actorData.system.settings.abilities.defaultmaxvalue)
                    await item.update(itemData);
                }
            }

            const powers = actorData.items.filter(item => item.type == "Power");
            for (const power of powers) {
                if (power.system.max != parseInt(actorData.system.settings.powers.defaultmaxvalue)) {
                    const item = await actor.getEmbeddedDocument("Item", power._id);
                    let itemData = foundry.utils.duplicate(item);
                    itemData.system.max = parseInt(actorData.system.settings.powers.defaultmaxvalue);
                    await item.update(itemData);
                }
            }
        }

        return actorData;
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

function isNumber(data) {
	let value = parseInt(data);

	return !isNaN(parseFloat(value)) && !isNaN(value - 0);
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