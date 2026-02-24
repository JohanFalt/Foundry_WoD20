import BonusHelper from "./bonus-helpers.js";

export async function calculateTotals(updateData) {
	let toForm = getForm(updateData);

	const actor = await game.actors.get(updateData._id);

    // attributes totals
	for (const i in updateData.system.attributes) {
		let shift = {"type": i, "value": 0};

		if (updateData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
			shift = getShiftAttributeBonus(updateData.system.attributes[i].label, toForm, updateData);
		}

		updateData.system.attributes[i].total = parseInt(updateData.system.attributes[i].value) + parseInt(updateData.system.attributes[i].bonus) + parseInt(shift.value);

		//bonus attribute
		if (await BonusHelper.CheckAttributeBuff(updateData, i)) {
			const bonus = await BonusHelper.GetAttributeBuff(updateData, i);
			updateData.system.attributes[i].total += parseInt(bonus);
		}

		if ((updateData.type == CONFIG.worldofdarkness.sheettype.werewolf) || (updateData.type == CONFIG.worldofdarkness.sheettype.changingbreed)) {

			if (updateData.system.attributes[i].label == "wod.attributes.strength") {
				if (updateData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
					if (updateData.system.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.lupus") {
							updateData.system.attributes[i].total = 0;
						}
					}
				}
			}

			if (updateData.system.attributes[i].label == "wod.attributes.stamina") {
				if (updateData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
					if (updateData.system.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.lupus") {
							updateData.system.attributes[i].total = 0;
						}
					}
				}
			}

			if (updateData.system.attributes[i].label == "wod.attributes.manipulation") {
				if (updateData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
					if ((updateData.system.changingbreed == "Ananasi") || (updateData.system.changingbreed == "Nagah") || (updateData.system.changingbreed == "Camazotz")) {
						if (toForm == "wod.shapes.lupus") {
							updateData.system.attributes[i].total = 0;
						}
					}
				}
			}

			// TODO: This can be removed as all shapshifters has gotten fixed value as bonus.
			if (updateData.system.attributes[i].label == "wod.attributes.appearance") {
				if ((toForm == "wod.shapes.crinos") && ((updateData.system?.changingbreed != "Kitsune") && (updateData.system?.changingbreed != "Ratkin"))) {
					updateData.system.attributes[i].total = 0;
				}

				if (updateData.type == CONFIG.worldofdarkness.sheettype.changingbreed) {
					if (((updateData.system.changingbreed == "Ajaba") || (updateData.system?.changingbreed == "Grondr")) && (toForm == "wod.shapes.hispo")) {
						updateData.system.attributes[i].total = 0;
					}

					if (updateData.system.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.glabro") {
							updateData.system.attributes[i].total = 0;
						}

						if (toForm == "wod.shapes.hispo") {
							updateData.system.attributes[i].total = 0;
						}

						if (toForm == "wod.shapes.lupus") {
							updateData.system.attributes[i].total = 0;
						}
					}

					if (updateData.system.changingbreed == "Camazotz") {
						if (toForm == "wod.shapes.lupus") {
							updateData.system.attributes[i].total = 0;
						}
					}
				}
			}
		}

		//attribute fixed value, this needs to be after all other calculations
		if (await BonusHelper.CheckAttributeFixedValue(updateData, i)) {
			const bonus = await BonusHelper.GetFixedAttributeBuff(updateData, i);
			updateData.system.attributes[i].total = parseInt(bonus);
		}
	}    

	// fix rage stuff
	if (updateData.system.settings.hasrage) {
		let wererwolfrageSettings = true;

		try {
			wererwolfrageSettings = CONFIG.worldofdarkness.wererwolfrageSettings;
		} 
		catch (e) {
			wererwolfrageSettings = true;
		}

		if (wererwolfrageSettings) {
			if (updateData.system.advantages.rage.roll > updateData.system.advantages.willpower.roll) {
				const rageDiff = parseInt(updateData.system.advantages.rage.roll) - parseInt(updateData.system.advantages.willpower.roll);
	
				updateData.system.attributes.charisma.total = parseInt(updateData.system.attributes.charisma.total) - rageDiff;
				updateData.system.attributes.manipulation.total = parseInt(updateData.system.attributes.manipulation.total) - rageDiff;
			}
		}
	}

	updateData.system.soak.bashing = 0;
	updateData.system.soak.lethal = 0;
	updateData.system.soak.aggravated = 0;

	if (updateData.system.settings.soak.bashing.isrollable) {
		updateData.system.soak.bashing = updateData.system.attributes.stamina.total;
	}
	if (updateData.system.settings.soak.lethal.isrollable) {
		updateData.system.soak.lethal = updateData.system.attributes.stamina.total;
	}
	if (updateData.system.settings.soak.aggravated.isrollable) {
		updateData.system.soak.aggravated = updateData.system.attributes.stamina.total;
	}	

	/* If Changeling and Chimerical soak */
	let usechimerical = false;

	if (updateData.type === "PC") {
		usechimerical = updateData.system.settings.usechimerical;
	}
	else {
		usechimerical = updateData.system.settings.soak.chimerical != undefined;
	}

	if (usechimerical) {
		updateData.system.soak.chimerical.bashing = 0;
		updateData.system.soak.chimerical.lethal = 0;
		updateData.system.soak.chimerical.aggravated = 0;

		if (updateData.system.settings.soak.chimerical.bashing.isrollable) {
			updateData.system.soak.chimerical.bashing = updateData.system.attributes.stamina.total;
		}
		if (updateData.system.settings.soak.chimerical.lethal.isrollable) {
			updateData.system.soak.chimerical.lethal = updateData.system.attributes.stamina.total;
		}
		if (updateData.system.settings.soak.chimerical.aggravated.isrollable) {
			updateData.system.soak.chimerical.aggravated = updateData.system.attributes.stamina.total;
		}
	}	

	//bonus soak
	if (await BonusHelper.CheckSoakBuff(updateData)) {
		let bonus = await BonusHelper.GetSoakBuff(updateData, "all");
		const bashing = await BonusHelper.GetSoakBuff(updateData, "bashing");
		updateData.system.soak.bashing += parseInt(bonus+bashing);
		const lethal = await BonusHelper.GetSoakBuff(updateData, "lethal");
		updateData.system.soak.lethal += parseInt(bonus+lethal);
		const aggravated = await BonusHelper.GetSoakBuff(updateData, "aggravated");
		updateData.system.soak.aggravated += parseInt(bonus+aggravated);

		if (usechimerical) {
			updateData.system.soak.chimerical.bashing += parseInt(bonus+bashing);
			updateData.system.soak.chimerical.lethal += parseInt(bonus+lethal);
			updateData.system.soak.chimerical.aggravated += parseInt(bonus+aggravated);
		}
	}

	// armor
	if (actor !== undefined) {
		for (const i of actor?.items) {
			if ((i.type == "Armor") && (i.system?.isequipped)) {
				if (updateData.system.shapes == undefined) {
					updateData.system.soak.bashing += i.system.soak.bashing;
					updateData.system.soak.lethal += i.system.soak.lethal;
					updateData.system.soak.aggravated += i.system.soak.aggravated;
					updateData.system.attributes.dexterity.total += i.system.dexpenalty;

					/* If changeling */
					if (usechimerical) {
						updateData.system.soak.chimerical.bashing += i.system.soak.chimerical.bashing;
						updateData.system.soak.chimerical.lethal += i.system.soak.chimerical.lethal;
						updateData.system.soak.chimerical.aggravated += i.system.soak.chimerical.aggravated;
					}
				}
				/* If Werewolf or Changing breed */
				else {
					for (const form in updateData.system.shapes) {
						if (updateData.system.shapes[form].isactive) {
							let hasform = false;

							if (form == "homid") {
								hasform = i.system.forms.hashomid;
							}
							if (form == "glabro") {
								hasform = i.system.forms.hasglabro;
							}
							if (form == "crinos") {
								hasform = i.system.forms.hascrinos;
							}
							if (form == "hispo") {
								hasform = i.system.forms.hashispo;
							}
							if (form == "lupus") {
								hasform = i.system.forms.haslupus;
							}

							if (hasform) {
								updateData.system.soak.bashing += i.system.soak.bashing;
								updateData.system.soak.lethal += i.system.soak.lethal;
								updateData.system.soak.aggravated += i.system.soak.aggravated;
								updateData.system.attributes.dexterity.total += i.system.dexpenalty;

								break;
							}	
						}		
					}
				}
			}
		}
	}
	

	// health levels totals
	for (const i in CONFIG.worldofdarkness.woundLevels) {
		const bonus = await BonusHelper.GetHealthlevelsBuff(updateData, i);
		updateData.system.health[i].total = parseInt(updateData.system.health[i].value) + bonus;		
	}	

	if (updateData.system.settings.variant != "spirit") {
		// intitiative totals
		updateData.system.initiative.base = parseInt(updateData.system.attributes.dexterity.total) + parseInt(updateData.system.attributes.wits.total);

		let woundpenalty = parseInt(updateData.system.health.damage.woundpenalty);

		if (updateData.system.conditions.isignoringpain) {
			woundpenalty = 0;
		}

		updateData.system.initiative.total = parseInt(updateData.system.initiative.base) + parseInt(updateData.system.initiative.bonus) + woundpenalty;

		//bonus initiative
		if (await BonusHelper.CheckInitiativeBuff(updateData)) {
			const bonus = await BonusHelper.GetInitiativeBuff(updateData);
			updateData.system.initiative.total += parseInt(bonus);
		}
	}
	else {
		updateData.system.initiative.base = parseInt(updateData.system.advantages.willpower.permanent);
		updateData.system.initiative.total = parseInt(updateData.system.initiative.base) + parseInt(updateData.system.initiative.bonus);

		updateData.system.soak.bashing = parseInt(updateData.system.advantages.willpower.permanent);
		updateData.system.soak.lethal = parseInt(updateData.system.advantages.willpower.permanent);
		updateData.system.soak.aggravated = parseInt(updateData.system.advantages.willpower.permanent);
	}	

    return updateData;
}

function getForm(actorData) {
	let label = "wod.shapes.homid";

	if (actorData.system.shapes == undefined) {
		return label;
	}

	for (const i in actorData.system.shapes) {
		if (actorData.system.shapes[i].isactive) {
			 label = actorData.system.shapes[i].label;
			 return label;
		}			
	}

	return label;
}

function getShiftAttributeBonus(attribute, presentForm, actor) {
	let data = 0;

	if (actor.system.changingbreed == "Ajaba") {
		data = handleAjabaShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Ananasi") {
		data = handleAnanasiShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Bastet") {
		data = handleBastetShiftAttributeData(actor.system.tribe, attribute, presentForm);
	}

	if (actor.system.changingbreed == "Corax") {
		data = handleCoraxShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Gurahl") {
		data = handleGurahlShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Kitsune") {
		data = handleKitsuneShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Mokole") {
		data = handleMokoleShiftAttributeData(actor.system.tribe, attribute, presentForm);
	}

	if (actor.system.changingbreed == "Nagah") {
		data = handleNagahShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Nuwisha") {
		data = handleNuwishaShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Ratkin") {
		data = handleRatkinShiftAttributeData(actor.system.breed, attribute, presentForm);
	}

	if (actor.system.changingbreed == "Rokea") {
		data = handleRokeaShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Apis") {
		data = handleApisShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Camazotz") {
		data = handleCamazotzShiftAttributeData(attribute, presentForm);
	}

	if (actor.system.changingbreed == "Grondr") {
		data = handleGrondrShiftAttributeData(attribute, presentForm);
	}

	return {"type": attribute, "value": data};
}

/* Here starts all the shifter table data */

/* function handleWerewolfShiftAttributeData(attribute, presentForm) {
	let data = {"type": attribute, "value": 0};

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 2};
		}
		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 2};
		}
		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -2};
		}
		if (attribute == "wod.attributes.appearance") {
			data = {"type": attribute, "value": -1};
		}
	}		
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 4};
		}
		if (attribute == "wod.attributes.dexterity") {
			data = {"type": attribute, "value": 1};
		}
		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 3};
		}
		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -3};
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 3};
		}
		if (attribute == "wod.attributes.dexterity") {
			data = {"type": attribute, "value": 2};
		}
		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 3};
		}
		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -3};
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = {"type": attribute, "value": 1};
		}
		if (attribute == "wod.attributes.dexterity") {
			data = {"type": attribute, "value": 2};
		}
		if (attribute == "wod.attributes.stamina") {
			data = {"type": attribute, "value": 2};
		}
		if (attribute == "wod.attributes.manipulation") {
			data = {"type": attribute, "value": -3};
		}
	}

	return data;
} */

function handleAjabaShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 1;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -1;
		}
		if (attribute == "wod.attributes.appearance") {
			data = -3;
		}
	}	
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 4;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = 1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
	}

	return data;
}

function handleAnanasiShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -1;
		}
	}	
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = 4;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.dexterity") {
			data = 5;
		}
	}

	return data;
}

function handleBastetShiftAttributeData(type, attribute, presentForm) {
	let data = 0;

	if (type == "wod.bio.tribename.bagheera") {
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}	
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
	}

	if (type == "wod.bio.tribename.balam") {
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}		
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -4;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -4;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
	}

	if (type == "wod.bio.tribename.bubasti") {
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.dexterity") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}		
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
	}

	if (type == "wod.bio.tribename.ceilican") {
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}		
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = -1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
	}

	if (type == "wod.bio.tribename.khan") { 
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}		
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
	}
	if (type == "wod.bio.tribename.pumonca") { 
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}	
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
	}

	if (type == "wod.bio.tribename.qualmi") { 
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}	
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
		}
	}

	if (type == "wod.bio.tribename.simba") { 
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}	
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.strength") {
				data = 4;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
		}
	}

	if (type == "wod.bio.tribename.swara") { 
		if (presentForm == "wod.shapes.glabro")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -1;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
		}	
		if (presentForm == "wod.shapes.crinos")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 3;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.hispo")
		{
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (presentForm == "wod.shapes.lupus")
		{
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
	}

	return data;
}

function handleCoraxShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 1;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
		if (attribute == "wod.attributes.perception") {
			data = 3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = -1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.perception") {
			data = 4;
		}
	}

	return data;
}

function handleGurahlShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
		if (attribute == "wod.attributes.appearance") {
			data = -2;
		}
	}		
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 5;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = -1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 5;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = 4;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = -2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 4;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}

	return data;
}

function handleKitsuneShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 1;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -1;
		}
	}		
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -1;
		}
		if (attribute == "wod.attributes.perception") {
			data = 1;
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.dexterity") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
		if (attribute == "wod.attributes.perception") {
			data = 1;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.dexterity") {
			data = 4;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -1;
		}
		if (attribute == "wod.attributes.perception") {
			data = 2;
		}
	}

	return data;
}

function handleMokoleShiftAttributeData(type, attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 4;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = -1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 4;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (type == "wod.bio.varnaname.champsa") {
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = -2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -4;
			}
		}
		if (type == "wod.bio.varnaname.gharial") {
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = -1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -4;
			}
		}
		if (type == "wod.bio.varnaname.halpatee") {
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = -1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (type == "wod.bio.varnaname.karna") {
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = -2;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -4;
			}
		}
		if (type == "wod.bio.varnaname.makara") {
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (type == "wod.bio.varnaname.ora") {
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -4;
			}
		}
		if (type == "wod.bio.varnaname.paisa") {
			if (attribute == "wod.attributes.strength") {
				data = 2;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = -1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
		}
		if (type == "wod.bio.varnaname.syrta") {
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = -1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 3;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
		if (type == "wod.bio.varnaname.unktehi") {
			if (attribute == "wod.attributes.strength") {
				data = -1;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -3;
			}
		}
	}

	return data;
}

function handleNagahShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
		if (attribute == "wod.attributes.appearance") {
			data = -2;
		}
	}		
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = -1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 1;
		}
	}

	return data;
}

function handleNuwishaShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = 1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -1;
		}
	}		
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.dexterity") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}

	return data;
}

function handleRatkinShiftAttributeData(breed, attribute, presentForm) {
	let data = 0;
	
	if (presentForm == "wod.shapes.crinos")
	{
		if (breed == "Metis") {
			if (attribute == "wod.attributes.strength") {
				data = 3;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 1;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
			if (attribute == "wod.attributes.perception") {
				data = 1;
			}
		}
		else {
			if (attribute == "wod.attributes.strength") {
				data = 1;
			}
			if (attribute == "wod.attributes.dexterity") {
				data = 4;
			}
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -2;
			}
			if (attribute == "wod.attributes.appearance") {
				data = -1;
			}
			if (attribute == "wod.attributes.perception") {
				data = 1;
			}
		}		
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = -1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.perception") {
			data = 3;
		}
	}

	return data;
}

function handleRokeaShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
		if (attribute == "wod.attributes.appearance") {
			data = -2;
		}
	}	
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = -1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -4;
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = 4;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -4;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 3;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -4;
		}
	}
	
	return data;
}

function handleApisShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 5;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 4;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	
	return data;
}

function handleCamazotzShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -1;
		}
		if (attribute == "wod.attributes.appearance") {
			data = -1;
		}
		if (attribute == "wod.attributes.perception") {
			data = 2;
		}
	}	
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 1;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
		if (attribute == "wod.attributes.perception") {
			data = 3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = -1;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.perception") {
			data = 3;
		}
	}
	
	return data;
}

function handleGrondrShiftAttributeData(attribute, presentForm) {
	let data = 0;

	if (presentForm == "wod.shapes.glabro")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 2;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -2;
		}
		if (attribute == "wod.attributes.appearance") {
			data = -2;
		}
	}	
	if (presentForm == "wod.shapes.crinos")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 4;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -4;
		}
	}
	if (presentForm == "wod.shapes.hispo")
	{
		if (attribute == "wod.attributes.strength") {
			data = 3;
		}
		if (attribute == "wod.attributes.dexterity") {
			data = 1;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
	}
	if (presentForm == "wod.shapes.lupus")
	{
		if (attribute == "wod.attributes.strength") {
			data = 2;
		}
		if (attribute == "wod.attributes.stamina") {
			data = 3;
		}
		if (attribute == "wod.attributes.manipulation") {
			data = -3;
		}
		if (attribute == "wod.attributes.perception") {
			data = 1;
		}
	}
	
	return data;
}