export function calculateTotals(actorData) {
	let toForm = getForm(actorData);

    // attributes totals
	for (const i in actorData.data.attributes) {
		let shift = {"type": i, "value": 0};

		if (actorData.type == "Werewolf") {
			shift = handleWerewolfShiftAttributeData(actorData.data.attributes[i].label, toForm);
		}
		if (actorData.type == "Changing Breed") {
			shift = getShiftAttributeBonus(actorData.data.attributes[i].label, toForm, actorData);
		}

		actorData.data.attributes[i].total = parseInt(actorData.data.attributes[i].value) + parseInt(actorData.data.attributes[i].bonus) + parseInt(shift.value);

		if ((actorData.type == "Werewolf") || (actorData.type == "Changing Breed")) {

			if (actorData.data.attributes[i].label == "wod.attributes.strength") {
				if (actorData.type == "Changing Breed") {
					if (actorData.data.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.lupus") {
							actorData.data.attributes[i].total = 0;
						}
					}
				}
			}

			if (actorData.data.attributes[i].label == "wod.attributes.stamina") {
				if (actorData.type == "Changing Breed") {
					if (actorData.data.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.lupus") {
							actorData.data.attributes[i].total = 0;
						}
					}
				}
			}

			if (actorData.data.attributes[i].label == "wod.attributes.manipulation") {
				if (actorData.type == "Changing Breed") {
					if ((actorData.data.changingbreed == "Ananasi") || (actorData.data.changingbreed == "Nagah")) {
						if (toForm == "wod.shapes.lupus") {
							actorData.data.attributes[i].total = 0;
						}
					}
				}
			}

			if (actorData.data.attributes[i].label == "wod.attributes.appearance") {
				if ((toForm == "wod.shapes.crinos") && ((actorData.data?.changingbreed != "Kitsune") && (actorData.data?.changingbreed != "Ratkin"))) {
					actorData.data.attributes[i].total = 0;
				}

				if (actorData.type == "Changing Breed") {
					if ((actorData.data.changingbreed == "Ajaba") && (toForm == "wod.shapes.hispo")) {
						actorData.data.attributes[i].total = 0;
					}

					if (actorData.data.changingbreed == "Ananasi") {
						if (toForm == "wod.shapes.glabro") {
							actorData.data.attributes[i].total = 0;
						}

						if (toForm == "wod.shapes.hispo") {
							actorData.data.attributes[i].total = 0;
						}

						if (toForm == "wod.shapes.lupus") {
							actorData.data.attributes[i].total = 0;
						}
					}
				}
			}
		}
	}    

	actorData.data.soak.bashing = 0;
	actorData.data.soak.lethal = 0;
	actorData.data.soak.aggravated = 0;

	if (actorData.data.settings.soak.bashing.roll) {
		actorData.data.soak.bashing = actorData.data.attributes.stamina.total;
	}
	if (actorData.data.settings.soak.lethal.roll) {
		actorData.data.soak.lethal = actorData.data.attributes.stamina.total;
	}
	if (actorData.data.settings.soak.aggravated.roll) {
		actorData.data.soak.aggravated = actorData.data.attributes.stamina.total;
	}

	actorData.data.initiative.base = parseInt(actorData.data.attributes.dexterity.total) + parseInt(actorData.data.attributes.wits.total);
	actorData.data.initiative.total = parseInt(actorData.data.initiative.base) + parseInt(actorData.data.initiative.bonus);

    return actorData;
}

function getForm(actorData) {
	let label = "wod.shapes.homid";

	if (actorData.data.shapes == undefined) {
		return label;
	}

	for (const i in actorData.data.shapes) {
		if (actorData.data.shapes[i].active) {
			 label = actorData.data.shapes[i].label;
			 return label;
		}			
	}

	return label;
}

function getShiftAttributeBonus(attribute, presentForm, actor) {
	let data = 0;

	if (actor.data.changingbreed == "Ajaba") {
		data = handleAjabaShiftAttributeData(attribute, presentForm);
	}

	if (actor.data.changingbreed == "Ananasi") {
		data = handleAnanasiShiftAttributeData(attribute, presentForm);
	}

	if (actor.data.changingbreed == "Bastet") {
		data = handleBastetShiftAttributeData(actor.data.tribe, attribute, presentForm);
	}

	if (actor.data.changingbreed == "Corax") {
		data = handleCoraxShiftAttributeData(attribute, presentForm);
	}

	if (actor.data.changingbreed == "Gurahl") {
		data = handleGurahlShiftAttributeData(attribute, presentForm);
	}

	if (actor.data.changingbreed == "Kitsune") {
		data = handleKitsuneShiftAttributeData(attribute, presentForm);
	}

	if (actor.data.changingbreed == "Mokolé") {
		data = handleMokoleShiftAttributeData(actor.data.tribe, attribute, presentForm);
	}

	if (actor.data.changingbreed == "Nagah") {
		data = handleNagahShiftAttributeData(attribute, presentForm);
	}

	if (actor.data.changingbreed == "Nuwisha") {
		data = handleNuwishaShiftAttributeData(attribute, presentForm);
	}

	if (actor.data.changingbreed == "Ratkin") {
		data = handleRatkinShiftAttributeData(actor.data.breed, attribute, presentForm);
	}

	if (actor.data.changingbreed == "Rokea") {
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
