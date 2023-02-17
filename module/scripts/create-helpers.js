export default class CreateHelper {
    
    static async SetMortalAbilities(actor) {
		console.log('WoD | Set Mortal Abilities');

		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}	

	static async SetMortalVictorianAbilities(actor) {
		console.log('WoD | Set Mortal Abilities Victorian');

		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static async SetMortalDarkagesAbilities(actor) {
		console.log('WoD | Set Mortal Abilities Dark Ages');

		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static async SetVampireAbilities(actor) {	
		console.log('WoD | Set Vampire Abilities');
		
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {

			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.finance") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}				
		}
	}

	static async SetVampireVictorianAbilities(actor) {	
		console.log('WoD | Set Vampire Abilities Victorian');
		
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {

			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.finance") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}				
		}
	}

	static async SetVampireDarkagesAbilities(actorCopy, actor) {	
		console.log('WoD | Set Vampire Abilities Dark Ages');
		
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actorCopy.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actorCopy.system.abilities.talent[talent].isvisible = false;
			}			
		}

		let itemData = {
			name: "Legerdemain",
			type: "Trait",
			system: {
				label: "Legerdemain",
				type: "wod.types.talentsecondability",
				max: parseInt(actor.system.settings.abilities.defaultmaxvalue)
			}
		};
		await actor.createEmbeddedDocuments("Item", [itemData]);

		for (const skill in CONFIG.wod.skills) {

			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actorCopy.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actorCopy.system.abilities.skill[skill].isvisible = false;
			}			
		}

		itemData = {
			name: "Archery",
			type: "Trait",
			system: {
				label: "Archery",
				type: "wod.types.skillsecondability",
				max: parseInt(actor.system.settings.abilities.defaultmaxvalue)
			}
		};
		await actor.createEmbeddedDocuments("Item", [itemData]);

		itemData = {
			name: "Commerce",
			type: "Trait",
			system: {
				label: "Commerce",
				type: "wod.types.skillsecondability",
				max: parseInt(actor.system.settings.abilities.defaultmaxvalue)
			}
		};
		await actor.createEmbeddedDocuments("Item", [itemData]);

		itemData = {
			name: "Ride",
			type: "Trait",
			system: {
				label: "Ride",
				type: "wod.types.skillsecondability",
				max: parseInt(actor.system.settings.abilities.defaultmaxvalue)
			}
		};
		await actor.createEmbeddedDocuments("Item", [itemData]);

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics")) {
				actorCopy.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actorCopy.system.abilities.knowledge[knowledge].isvisible = false;
			}				
		}

		itemData = {
			name: "Hearth wisdom",
			type: "Trait",
			system: {
				label: "Hearth wisdom",
				type: "wod.types.knowledgesecondability",
				max: parseInt(actor.system.settings.abilities.defaultmaxvalue)
			}
		};
		await actor.createEmbeddedDocuments("Item", [itemData]);
	
		itemData = {
			name: "Sensschal",
			type: "Trait",
			system: {
				label: "Sensschal",
				type: "wod.types.knowledgesecondability",
				max: parseInt(actor.system.settings.abilities.defaultmaxvalue)
			}
		};
		await actor.createEmbeddedDocuments("Item", [itemData]);

		itemData = {
			name: "Theology",
			type: "Trait",
			system: {
				label: "Theology",
				type: "wod.types.knowledgesecondability",
				max: parseInt(actor.system.settings.abilities.defaultmaxvalue)
			}
		};
		await actor.createEmbeddedDocuments("Item", [itemData]);
	}	

	static async SetMageAbilities(actor) {	
		console.log('WoD | Set Mage Abilities');
		
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}	
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.martialarts") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.meditation") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.research") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}	
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.cosmology") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.esoterica") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}						
		}
	}

	static async SetMageVictorianAbilities(actor) {	
		console.log('WoD | Set Mage Abilities Victorian');
		
		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.art") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}	
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.martialarts") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.meditation") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.research") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}	
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.cosmology") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.esoterica") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}						
		}
	}

	static async SetWerewolfAbilities(actor) {	
		console.log('WoD | Set Werewolf Abilities');
		
		for (const talent in CONFIG.wod.talents) {
			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership")	|| 
					(actor.system.abilities.talent[talent].label == "wod.abilities.primalurge") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny")	|| 
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {
			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||	
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") ||	
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult")	|| 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.rituals") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static async SetWerewolfDarkagesAbilities(actor) {		
		console.log('WoD | Set Werewolf Abilities Dark Ages');

		for (const talent in CONFIG.wod.talents) {
			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership")	|| 
					(actor.system.abilities.talent[talent].label == "wod.abilities.primalurge") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny")	|| 
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") || 
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {
			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||	
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") ||	
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult")	|| 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.rituals") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static async SetChangelingAbilities(actor) {
		console.log('WoD | Set Changeling Abilities');

		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.kenning") ||
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.larceny") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.enigmas") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.gremayre") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.technology")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static async SetHunterAbilities(actor) {
		console.log('WoD | Set Hunter Abilities');

		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.dodge") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intuition") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.demolitions") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.security") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.bureaucracy") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.finance") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.linguistics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.research") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static async SetDemonAbilities(actor) {
		console.log('WoD | Set Demon Abilities');

		for (const talent in CONFIG.wod.talents) {

			if ((actor.system.abilities.talent[talent].label == "wod.abilities.alertness") ||	
					(actor.system.abilities.talent[talent].label == "wod.abilities.athletics") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.awareness") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.brawl") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.dodge") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.empathy") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.expression") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intimidation") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.intuition") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.leadership") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.streetwise") || 
					(actor.system.abilities.talent[talent].label == "wod.abilities.subterfuge")) {
				actor.system.abilities.talent[talent].isvisible = true;
			}
			else {
				actor.system.abilities.talent[talent].isvisible = false;
			}			
		}

		for (const skill in CONFIG.wod.skills) {
			
			if ((actor.system.abilities.skill[skill].label == "wod.abilities.animalken") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.craft") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.demolitions") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.drive") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.etiquette") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.firearms") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.melee") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.performance") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.security") ||	
					(actor.system.abilities.skill[skill].label == "wod.abilities.stealth") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.survival") ||
					(actor.system.abilities.skill[skill].label == "wod.abilities.technology")) {
				actor.system.abilities.skill[skill].isvisible = true;
			}
			else {
				actor.system.abilities.skill[skill].isvisible = false;
			}			
		}

		for (const knowledge in CONFIG.wod.knowledges) {

			if ((actor.system.abilities.knowledge[knowledge].label == "wod.abilities.academics") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.computer") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.finance") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.investigation") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.law") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.linguistics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.medicine") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.occult") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.politics") || 
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.religion") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.research") ||
					(actor.system.abilities.knowledge[knowledge].label == "wod.abilities.science")) {
				actor.system.abilities.knowledge[knowledge].isvisible = true;
			}
			else {
				actor.system.abilities.knowledge[knowledge].isvisible = false;
			}		
		}
	}

	static async SetCreatureAbilities(actor) {
		console.log('WoD | Set Creature Abilities');

		for (const talent in CONFIG.wod.talents) {
			actor.system.abilities.talent[talent].isvisible = false;
		}

		for (const skill in CONFIG.wod.skills) {
			actor.system.abilities.skill[skill].isvisible = false;
		}

		for (const knowledge in CONFIG.wod.knowledges) {
			actor.system.abilities.knowledge[knowledge].isvisible = false;
		}		
	}
	
	static async SetMortalAttributes(actor) {
		console.log('WoD | Set Mortal Attributes');

		let willpower = -1;

		for (const attribute in actor.system.attributes) {
			actor.system.attributes[attribute].isvisible = true;
		}

		if (CONFIG.wod.attributeSettings == "20th") {
			actor.system.attributes.composure.isvisible = false;
			actor.system.attributes.resolve.isvisible = false;
			actor.system.advantages.willpower.permanent = 0;
		}
		else if (CONFIG.wod.attributeSettings == "5th") {
			actor.system.attributes.appearance.isvisible = false;
			actor.system.attributes.perception.isvisible = false;
			actor.system.advantages.willpower.permanent = 2;
		}
	
		if (CONFIG.wod.rollSettings) {
			willpower = actor.system.advantages.willpower.permanent; 
		}
		else {
			willpower = actor.system.advantages.willpower.permanent > actor.system.advantages.willpower.temporary ? actor.system.advantages.willpower.temporary : actor.system.advantages.willpower.permanent; 
		}
	
		actor.system.advantages.willpower.roll = willpower;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.haswillpower = true;
	}

	static async SetVampireAttributes(actor) {
		console.log('WoD | Set Vampire Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.haspath = true;
		actor.system.settings.hasbloodpool = true;		
		actor.system.settings.hasvirtue = true;

		actor.system.settings.powers.hasdisciplines = true;
	}

	static async SetWerewolfAttributes(actor) {
		console.log('WoD | Set Werewolf Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;

		actor.system.settings.hasrage = true;
		actor.system.settings.hasgnosis = true;

		actor.system.settings.powers.hasgifts = true;
	}

	static async SetShifterAttributes(actor, type) {
		console.log('WoD | Set Shifter Attributes');

		this.SetWerewolfAttributes(actor);

		if ((type == "Ananasi") || (type == "Nuwisha")) {
			actor.system.settings.hasrage = false;
		}
		if (type == "Ananasi") {
			actor.system.settings.hasbloodpool = true;
		}
	}

	static async SetMageAttributes(actor) {
		console.log('WoD | Set Mage Attributes');

		actor.system.advantages.arete.permanent = 1;
		actor.system.advantages.arete.roll = 1;

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;
	}

	static async SetChangelingAttributes(actor) {
		console.log('WoD | Set Changeling Attributes');

		actor.system.settings.soak.chimerical.bashing.isrollable = true;
		actor.system.settings.soak.chimerical.lethal.isrollable = true;
		actor.system.settings.soak.chimerical.aggravated.isrollable = false;
		
		actor.system.settings.hasglamour = true;
		actor.system.settings.hasbanality = true;

		actor.system.settings.powers.hasarts = true;
	}

	static async SetHunterAttributes(actor) {
		console.log('WoD | Set Hunter Attributes');

		actor.system.settings.hasconviction = true;
		actor.system.settings.hasvirtue = true;

		actor.system.settings.powers.hasedges = true;
	}

	static async SetDemonAttributes(actor) {
		console.log('WoD | Set Demon Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.hasvirtue = true;
		actor.system.settings.hasfaith = true;
		actor.system.settings.hastorment = true;
		
		actor.system.settings.powers.haslores = true;
	}

	static async SetCreatureAttributes(actor) {
		console.log('WoD | Set Creature Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = false;
		actor.system.settings.soak.aggravated.isrollable = false;

		actor.system.settings.powers.haspowers = true;
	}

	static async SetSpiritAttributes(actor) {
		console.log('WoD | Set Spirit Attributes');

		actor.system.settings.soak.bashing.isrollable = true;
		actor.system.settings.soak.lethal.isrollable = true;
		actor.system.settings.soak.aggravated.isrollable = true;
	}
}