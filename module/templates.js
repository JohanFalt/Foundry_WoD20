/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
console.log("WoD | loading parts");

// Define template paths to load
const templatePaths = [
		// Actor Sheet Partials
		"systems/worldofdarkness/templates/actor/parts/profile-img.html",
		"systems/worldofdarkness/templates/actor/parts/navigation.html",
		"systems/worldofdarkness/templates/actor/parts/bio.html",
		"systems/worldofdarkness/templates/actor/parts/attributes.html",
		"systems/worldofdarkness/templates/actor/parts/attributes_spec.html",
		"systems/worldofdarkness/templates/actor/parts/abilities.html",
		"systems/worldofdarkness/templates/actor/parts/abilities_spec.html",
		"systems/worldofdarkness/templates/actor/parts/combat.html",
		"systems/worldofdarkness/templates/actor/parts/combat_natural.html",
		"systems/worldofdarkness/templates/actor/parts/combat_melee.html",
		"systems/worldofdarkness/templates/actor/parts/combat_ranged.html",
		"systems/worldofdarkness/templates/actor/parts/combat_armor.html",		
		"systems/worldofdarkness/templates/actor/parts/stats.html",
		
		"systems/worldofdarkness/templates/actor/parts/stats_rage.html",
		"systems/worldofdarkness/templates/actor/parts/stats_gnosis.html",
		"systems/worldofdarkness/templates/actor/parts/stats_willpower.html",
		"systems/worldofdarkness/templates/actor/parts/stats_health.html",
		"systems/worldofdarkness/templates/actor/parts/gear.html",
		"systems/worldofdarkness/templates/actor/parts/notes.html",
		"systems/worldofdarkness/templates/actor/parts/settings.html",

		"systems/worldofdarkness/templates/actor/parts/werewolf/stats_renown.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/shift.html",
		"systems/worldofdarkness/templates/actor/parts/werewolf/gift.html",

		"systems/worldofdarkness/templates/actor/parts/spirit/charms.html",

		// Item Sheet Partials
	];

	/* Load the template parts
		That function is part of foundry, not founding it here is normal
	*/
	return loadTemplates(templatePaths); // eslint-disable-line no-undef
};
