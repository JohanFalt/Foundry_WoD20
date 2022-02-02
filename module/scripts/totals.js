export function calculateTotals(actorData) {
	let toForm = getForm(actorData);

    // attributes totals
	for (const i in actorData.data.attributes) {
		const shift = handleWerewolfShiftAttributeData(actorData.data.attributes[i].label, toForm);
		actorData.data.attributes[i].total = actorData.data.attributes[i].value + shift.value;
	}    

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