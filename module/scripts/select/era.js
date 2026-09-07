/**
 * Era-related option lists and normalization.
 *
 * Two storage formats exist in the system:
 * - **Short key** (`"modern"`): used by splat items (`system.settings.era`) and PC actors after splat drop
 * - **Localization key** (`"wod.era.modern"`): used by weapons / equipment (`system.era`) and legacy actors
 *
 * - `getEraList()`: splat/PC era options (short keys).
 * - `getWeaponEraList()`: weapon sheet options (localization keys).
 * - `resolveWeaponEra()`: normalize either format → localization key for `system.era`.
 */

/**
 * Normalize an era value to the weapon/equipment format (`"wod.era.*"`).
 * Accepts short keys (`"modern"`), localization keys (`"wod.era.modern"`), or empty/unknown → modern.
 * @param {string} [era]
 * @returns {string}
 */
export function resolveWeaponEra(era) {
	const eras = CONFIG.worldofdarkness.era;
	const fallback = eras.modern;

	if (!era || typeof era !== "string") {
		return fallback;
	}

	if (eras[era]) {
		return eras[era];
	}

	if (Object.values(eras).includes(era)) {
		return era;
	}

	return fallback;
}

export function getEraList() {
	const eralist = [
		{
			value: "",
			label: `- ${game.i18n.localize("wod.labels.select")} -`
		}
	];

	for (const eraKey in CONFIG.worldofdarkness.era) {
		const eraValue = CONFIG.worldofdarkness.era[eraKey]; // e.g. "wod.era.modern"
		eralist.push({
			value: eraKey,
			label: game.i18n.localize(eraValue)
		});
	}

	return eralist;
}

export function getWeaponEraList() {
	const eralist = [
		{
			value: "",
			label: `- ${game.i18n.localize("wod.labels.select")} -`
		}
	];

	for (const eraKey in CONFIG.worldofdarkness.era) {
		const eraValue = CONFIG.worldofdarkness.era[eraKey]; // e.g. "wod.era.modern"
		eralist.push({
			value: eraValue,
			label: game.i18n.localize(eraValue)
		});
	}

	return eralist;
}

export function getWeaponConcealList(itemData) {
	const era = resolveWeaponEra(itemData?.system?.era);
	const isDarkEra =
		era === CONFIG.worldofdarkness.era.darkages ||
		era === CONFIG.worldofdarkness.era.classical ||
		era === CONFIG.worldofdarkness.era.livinggods;

	const labels = isDarkEra
		? {
				P: "wod.combat.weapon.conceal.pouch",
				J: "wod.combat.weapon.conceal.loose",
				T: "wod.combat.weapon.conceal.cloak",
				NA: "wod.combat.weapon.conceal.notbeconcealed"
			}
		: {
				P: "wod.combat.weapon.conceal.pocket",
				J: "wod.combat.weapon.conceal.jacket",
				T: "wod.combat.weapon.conceal.trenchcoat",
				NA: "wod.combat.weapon.conceal.na"
			};

	return [
		{ value: "", label: `- ${game.i18n.localize("wod.labels.select")} -` },
		{ value: "P", label: game.i18n.localize(labels.P) },
		{ value: "J", label: game.i18n.localize(labels.J) },
		{ value: "T", label: game.i18n.localize(labels.T) },
		{ value: "NA", label: game.i18n.localize(labels.NA) }
	];
}
