export function calculateTotals(actorData) {
	let toForm = getForm(actorData);

    // attributes totals
	for (const i in actorData.system.attributes) {
		let shift = {"type": i, "value": 0};

		if (actorData.type == CONFIG.wod.sheettype.werewolf) {
			shift = handleWerewolfShiftAttributeData(actorData.system.attributes[i].label, toForm);
		}
		if (actorData.type == "Changing Breed") {
			shift = getShiftAttributeBonus(actorData.system.attributes[i].label, toForm, actorData);
		}

		actorData.system.attributes[i].total = parseInt(actorData.system.attributes[i].value) + parseInt(actorData.system.attributes[i].bonus) + parseInt(shift.value);

		if ((actorData.type == CONFIG.wod.sheettype.werewolf) || (actorData.type == "Changing Breed")) {

			if (actorData.system.attributes[i].label == "wod.attributes.strength") {
				if (actorData.type == "Changing Breed") {
					if (actorData.system.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.lupus") {
							actorData.system.attributes[i].total = 0;
						}
					}
				}
			}

			if (actorData.system.attributes[i].label == "wod.attributes.stamina") {
				if (actorData.type == "Changing Breed") {
					if (actorData.system.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.lupus") {
							actorData.system.attributes[i].total = 0;
						}
					}
				}
			}

			if (actorData.system.attributes[i].label == "wod.attributes.manipulation") {
				if (actorData.type == "Changing Breed") {
					if ((actorData.system.changingbreed == "Ananasi") || (actorData.system.changingbreed == "Nagah")) {
						if (toForm == "wod.shapes.lupus") {
							actorData.system.attributes[i].total = 0;
						}
					}
				}
			}

			if (actorData.system.attributes[i].label == "wod.attributes.appearance") {
				if ((toForm == "wod.shapes.crinos") && ((actorData.system?.changingbreed != "Kitsune") && (actorData.system?.changingbreed != "Ratkin"))) {
					actorData.system.attributes[i].total = 0;
				}

				if (actorData.type == "Changing Breed") {
					if ((actorData.system.changingbreed == "Ajaba") && (toForm == "wod.shapes.hispo")) {
						actorData.system.attributes[i].total = 0;
					}

					if (actorData.system.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.glabro") {
							actorData.system.attributes[i].total = 0;
						}

						if (toForm == "wod.shapes.hispo") {
							actorData.system.attributes[i].total = 0;
						}

						if (toForm == "wod.shapes.lupus") {
							actorData.system.attributes[i].total = 0;
						}
					}
				}
			}
		}
	}    

	actorData.system.soak.bashing = 0;
	actorData.system.soak.lethal = 0;
	actorData.system.soak.aggravated = 0;

	if (actorData.system.settings.soak.bashing.isrollable) {
		actorData.system.soak.bashing = actorData.system.attributes.stamina.total;
	}
	if (actorData.system.settings.soak.lethal.isrollable) {
		actorData.system.soak.lethal = actorData.system.attributes.stamina.total;
	}
	if (actorData.system.settings.soak.aggravated.isrollable) {
		actorData.system.soak.aggravated = actorData.system.attributes.stamina.total;
	}

	actorData.system.initiative.base = parseInt(actorData.system.attributes.dexterity.total) + parseInt(actorData.system.attributes.wits.total);
	actorData.system.initiative.total = parseInt(actorData.system.initiative.base) + parseInt(actorData.system.initiative.bonus);

    return actorData;
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

	if (actor.system.changingbreed == "Mokolé") {
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
		// glöm inte vatten för dex etc...
		data = handleRokeaShiftAttributeData(attribute, presentForm);
	}

	return {"type": attribute, "value": data};
}

/* Here starts all the shifter table data */

function handleWerewolfShiftAttributeData(attribute, presentForm) {
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
}

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

	if (type == "Bagheera") {
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

	if (type == "Balam") {
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

	if (type == "Bubasti") {
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

	if (type == "Ceilican") {
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

	if (type == "Khan") { 
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
	if (type == "Pumonca") { 
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

	if (type == "Qualmi") { 
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

	if (type == "Simba") { 
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

	if (type == "Swara") { 
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
		if (type == "Champsa") {
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
		if (type == "Gharial") {
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
		if (type == "Halpatee") {
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
		if (type == "Karna") {
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
		if (type == "Makara") {
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
		if (type == "Ora") {
			if (attribute == "wod.attributes.stamina") {
				data = 2;
			}
			if (attribute == "wod.attributes.manipulation") {
				data = -4;
			}
		}
		if (type == "Paisa") {
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
		if (type == "Syrta") {
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
		if (type == "Unktehi") {
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
