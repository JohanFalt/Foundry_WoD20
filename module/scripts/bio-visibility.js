/**
 * Bio tab visibility for PC actors.
 *
 * Each Bio field can be hidden from Limited players and/or Observers.
 * The GM and owners always see every field.
 *
 * A field is hidden for a viewer only when its flag is explicitly `false`.
 * A missing flag means visible, so existing actors keep their current look.
 *
 * Field ids:
 * - Fixed Bio fields use their name, e.g. "nature".
 * - Template fields (system.bio.splatfields) use "splat_<key>".
 *
 * Stored as `system.bio.visibility[fieldId] = { limited: boolean, observers: boolean }`.
 */

/** Fixed Bio fields that can be hidden, with their localization keys. */
export const BIO_FIXED_FIELDS = [
	{ id: "nature", label: "wod.bio.nature" },
	{ id: "demeanor", label: "wod.bio.demeanor" },
	{ id: "concept", label: "wod.bio.concept" },
	{ id: "derangement", label: "wod.bio.derangement" },
	{ id: "appearance", label: "wod.bio.appearance" },
	{ id: "background", label: "wod.bio.background" }
];

/** Viewers that can be restricted. GM and owners are never restricted. */
export const BIO_VIEWERS = ["limited", "observers"];

export function splatFieldId(key) {
	return `splat_${key}`;
}

/**
 * Returns the viewer type for the current user.
 * "full" for GM and owners, otherwise the Foundry permission level.
 */
export function getBioViewer({ isGM = false, isOwner = false, limited = false } = {}) {
	if (isGM || isOwner) return "full";
	return limited ? "limited" : "observers";
}

/** True unless the field is explicitly hidden for the viewer. */
export function isBioFieldVisible(visibility, fieldId, viewer) {
	if (viewer === "full") return true;
	return visibility?.[fieldId]?.[viewer] !== false;
}
