import { databio } from "../assets/data/sheet/bio.js";
import { dataability } from "../assets/data/sheet/ability.js";
import { databiotab } from "../assets/data/sheet/biotab.js";
import { datapowertab } from "../assets/data/sheet/powertab.js";

import BonusHelper from "./scripts/bonus-helpers.js";
import ItemHelper from "./scripts/item-helpers.js";
import Functions from "./functions.js";

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

	// Define template paths to load
	const templatePaths = [
		// PC Actor Sheet Partials - .hbs files		
		"systems/worldofdarkness/templates/actor/parts/navigation.hbs",
			"systems/worldofdarkness/templates/actor/parts/macro_icons.hbs",
			"systems/worldofdarkness/templates/actor/parts/navigation_lock.hbs",
		"systems/worldofdarkness/templates/actor/parts/bio.hbs",
			"systems/worldofdarkness/templates/actor/parts/bio_splatfields.hbs",
			"systems/worldofdarkness/templates/actor/parts/bio_splatboxes.hbs",
		"systems/worldofdarkness/templates/actor/parts/stats.hbs",
			"systems/worldofdarkness/templates/actor/parts/stats_attributes.hbs",
			"systems/worldofdarkness/templates/actor/parts/stats_abilities.hbs",
			"systems/worldofdarkness/templates/actor/parts/stats_advantages.hbs",
			"systems/worldofdarkness/templates/actor/parts/stats_virtue.hbs",	
			"systems/worldofdarkness/templates/actor/parts/stats_renown.hbs",	
			"systems/worldofdarkness/templates/actor/parts/stats_quintessence.hbs",
			"systems/worldofdarkness/templates/actor/parts/stats_groupedadvantages.hbs",
		"systems/worldofdarkness/templates/actor/parts/powers.hbs",
			"systems/worldofdarkness/templates/actor/parts/power_listmainpower.hbs",
			"systems/worldofdarkness/templates/actor/parts/power_listpower.hbs",
			"systems/worldofdarkness/templates/actor/parts/power_shapes.hbs",
			"systems/worldofdarkness/templates/actor/parts/power_spheres.hbs",
		"systems/worldofdarkness/templates/actor/parts/combat.hbs",
			"systems/worldofdarkness/templates/actor/parts/combat_natural.hbs",
			"systems/worldofdarkness/templates/actor/parts/combat_melee.hbs",
			"systems/worldofdarkness/templates/actor/parts/combat_ranged.hbs",
			"systems/worldofdarkness/templates/actor/parts/combat_armor.hbs",
			"systems/worldofdarkness/templates/actor/parts/combat_conditions.hbs",
			"systems/worldofdarkness/templates/actor/parts/combat_movement.hbs",
		"systems/worldofdarkness/templates/actor/parts/gear.hbs",
		"systems/worldofdarkness/templates/actor/parts/feature.hbs",
		"systems/worldofdarkness/templates/actor/parts/feature_item.hbs",
		"systems/worldofdarkness/templates/actor/parts/effects.hbs",		
		"systems/worldofdarkness/templates/actor/parts/stats_health.hbs",

		// PC Actor Sheet Partials - .html files
		//"systems/worldofdarkness/templates/actor/parts/power_listpower.html",

		// PC and Legacy Actor Sheet Partials - .hbs files
		"systems/worldofdarkness/templates/actor/parts/description.hbs",
		"systems/worldofdarkness/templates/actor/parts/list_icons.hbs",

		

		// Legacy Actor Sheet Partials - .html files
		"systems/worldofdarkness/templates/actor/parts/profile-img.html",
		"systems/worldofdarkness/templates/actor/parts/navigation.html",		
		"systems/worldofdarkness/templates/actor/parts/bio.html",		
		"systems/worldofdarkness/templates/actor/parts/attributes.html",		
		"systems/worldofdarkness/templates/actor/parts/abilities.html",
		"systems/worldofdarkness/templates/actor/parts/combat.html",
		"systems/worldofdarkness/templates/actor/parts/power.html",
		"systems/worldofdarkness/templates/actor/parts/conditions.html",			// TODO - Seperate file?
		"systems/worldofdarkness/templates/actor/parts/movement.html",				// TODO - Seperate file?
		"systems/worldofdarkness/templates/actor/parts/macro_icons.html",
		"systems/worldofdarkness/templates/actor/parts/combat_natural.html",
		"systems/worldofdarkness/templates/actor/parts/combat_melee.html",
		"systems/worldofdarkness/templates/actor/parts/combat_ranged.html",
		"systems/worldofdarkness/templates/actor/parts/combat_armor.html",		
		"systems/worldofdarkness/templates/actor/parts/stats.html",		
		"systems/worldofdarkness/templates/actor/parts/creature/stats.html",
		"systems/worldofdarkness/templates/actor/parts/stats_virtue.html",		
		"systems/worldofdarkness/templates/actor/parts/hunter/stats_virtue.html",
		"systems/worldofdarkness/templates/actor/parts/demon/forms.html",
		"systems/worldofdarkness/templates/actor/parts/stats_health.html",
		"systems/worldofdarkness/templates/actor/parts/stats_health_old.html",		// TODO - should be removed or reworked in future
		"systems/worldofdarkness/templates/actor/parts/gear.html",
		"systems/worldofdarkness/templates/actor/parts/notes.html",
		"systems/worldofdarkness/templates/actor/parts/effect.html",
		"systems/worldofdarkness/templates/actor/parts/settings.html",
		"systems/worldofdarkness/templates/actor/parts/settings_attribute.html",
		"systems/worldofdarkness/templates/actor/parts/settings_abilities.html",
		"systems/worldofdarkness/templates/actor/parts/settings_combat.html",
		"systems/worldofdarkness/templates/actor/parts/settings_power.html",
		"systems/worldofdarkness/templates/actor/parts/settings_sheet.html",
		
		// Vampire
		"systems/worldofdarkness/templates/actor/parts/vampire/bio_vampire_background.html",		
		"systems/worldofdarkness/templates/actor/parts/vampire/disciplines.html",
		"systems/worldofdarkness/templates/actor/parts/mainpower_list.html",
		"systems/worldofdarkness/templates/actor/parts/power_list.html",

		// Mage
		"systems/worldofdarkness/templates/actor/parts/mage/bio_mage_background.html",		
		"systems/worldofdarkness/templates/actor/parts/mage/stats_arete.html",			// TODO - should use the new stat function
		"systems/worldofdarkness/templates/actor/parts/mage/stats_quintessence.html",	
		"systems/worldofdarkness/templates/actor/parts/mage/magic.html",
		"systems/worldofdarkness/templates/actor/parts/mage/resonance.html",
		"systems/worldofdarkness/templates/actor/parts/mage/rotes.html",
		"systems/worldofdarkness/templates/actor/parts/mage/spheres.html",
		"systems/worldofdarkness/templates/actor/parts/mage/focus.html",

		// Werewolf
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_werewolf_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_ajaba_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_ananasi_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_bastet_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_corax_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_gurahl_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_kitsune_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_mokole_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_nagah_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_nuwisha_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_ratkin_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_rokea_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_apis_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_camazotz_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/bio_grondr_background.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_nagah_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/combat_active.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_ajaba.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_ananasi.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_bastet.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_corax.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_gurahl.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_kitsune.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_mokole.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_nagah.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_nuwisha.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_ratkin.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_rokea.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift.html",		
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_apis.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_camazotz.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift_grondr.html",	
		"systems/worldofdarkness/templates/actor/parts/gifts.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/gift.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/rites.html",

		// Changeling
		"systems/worldofdarkness/templates/actor/parts/changeling/bio_changeling_background.html",				
		"systems/worldofdarkness/templates/actor/parts/changeling/dreaming.html",

		// Hunter
		"systems/worldofdarkness/templates/actor/parts/hunter/bio_hunter_background.html",		
		"systems/worldofdarkness/templates/actor/parts/hunter/edges.html",

		// Demon
		"systems/worldofdarkness/templates/actor/parts/demon/bio_demon_background.html",	
		"systems/worldofdarkness/templates/actor/parts/demon/lores.html",

		// Wraith
		"systems/worldofdarkness/templates/actor/parts/wraith/bio_wraith_background.html",
		"systems/worldofdarkness/templates/actor/parts/wraith/shadow.html",
		"systems/worldofdarkness/templates/actor/parts/wraith/death.html",

		// Mummy
		"systems/worldofdarkness/templates/actor/parts/mummy/bio_mummy_background.html",

		// Exalted
		"systems/worldofdarkness/templates/actor/parts/exalted/bio_exalted_background.html",
		"systems/worldofdarkness/templates/actor/parts/exalted/exalted_charms.html",

		// Orpheus
		"systems/worldofdarkness/templates/actor/parts/variant/bio_orpheus_background.html",	

		// Sorcerer
		"systems/worldofdarkness/templates/actor/parts/variant/bio_sorcerer_background.html",		
		"systems/worldofdarkness/templates/actor/parts/variant/stats_quintessence.html",	
		
		// Creature
		"systems/worldofdarkness/templates/actor/parts/creature/charms.html",		
		"systems/worldofdarkness/templates/actor/parts/creature/power.html",

		// Item Sheet Partials - .hbs files
		"systems/worldofdarkness/templates/items/parts/description.hbs",

		// Item Sheet Partials
		"systems/worldofdarkness/templates/sheets/parts/power_rollable.html",
		"systems/worldofdarkness/templates/sheets/parts/power_description.html",
		"systems/worldofdarkness/templates/sheets/parts/item_bonus.html"		
	];

	/* Load the template parts */
	return foundry.applications.handlebars.loadTemplates(templatePaths);
};

export function SetupAbilities()
{
    try {        
		let importData = dataability;
		// let fileData = await fetch(`systems/worldofdarkness/assets/data/ability.json`).then((response) => response.json());
		// Object.assign(importData, fileData);

		return importData;		
    } catch(err) {
		err.message = `Failed Setup ability: ${err.message}`;
        console.error(err);
        return
    }
}

export function SetupBio()
{
    try {        
		let importData = databio;
		return importData;		
    } catch(err) {
		err.message = `Failed Setup bio: ${err.message}`;
        console.error(err);
        return
    }
}

// PC
export function SetupBioTab()
{
    try {        
		let importData = databiotab;
		return importData;		
    } catch(err) {
		err.message = `Failed Setup bio: ${err.message}`;
        console.error(err);
        return
    }
}

// PC
export function SetupPowerTab()
{
    try {        
		let importData = datapowertab;
		return importData;		
    } catch(err) {
		err.message = `Failed Setup power: ${err.message}`;
        console.error(err);
        return
    }
}
