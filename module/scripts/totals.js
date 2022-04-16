export function calculateTotals(actorData) {
	let toForm = getForm(actorData);

    // attributes totals
	for (const i in actorData.data.attributes) {
		const shift = handleWerewolfShiftAttributeData(actorData.data.attributes[i].label, toForm);
		actorData.data.attributes[i].total = parseInt(actorData.data.attributes[i].value) + parseInt(actorData.data.attributes[i].bonus) + parseInt(shift.value);

		if ((toForm == "wod.shapes.crinos") && (actorData.data.attributes[i].label == "wod.attributes.appearance")) {
			actorData.data.attributes[i].total = 0;
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

	// if (actorData.type == "Werewolf") {
	// 	console.log("WoD | calculate Werewolf totals");
	// 	actorData.data.soak.bashing = actorData.data.attributes.stamina.total;
	// 	actorData.data.soak.lethal = actorData.data.attributes.stamina.total;
	// 	actorData.data.soak.aggravated = actorData.data.attributes.stamina.total;
	// }
	// else {
	// 	actorData.data.soak.bashing = actorData.data.attributes.stamina.total;
	// 	actorData.data.soak.lethal = 0;
	// 	actorData.data.soak.aggravated = 0;
	// }

	actorData.data.initiative.base = parseInt(actorData.data.attributes.dexterity.total) + parseInt(actorData.data.attributes.wits.total);

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