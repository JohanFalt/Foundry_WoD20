/**
 * Builders for plain actor and item data shaped like the system's documents.
 *
 * Actors are plain objects so they behave like `foundry.utils.duplicate(actor)`,
 * which is what the system passes to calculateTotals. Use `actorDocument()` for
 * code that calls `items.get()` or `actor.update()`.
 */

export const ATTRIBUTE_KEYS = [
    "strength", "dexterity", "stamina",
    "charisma", "manipulation", "appearance",
    "perception", "intelligence", "wits"
];

export const WOUND_LEVELS = ["bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"];

/**
 * @param {object} [overrides] - Fields merged into the defaults at the top level.
 * @returns {object} A PC actor with attributes, health track, soak and settings.
 */
export function createPcActor(overrides = {}) {
    const id = overrides._id ?? "actor-pc";
    const base = {
        _id: id,
        id,
        uuid: `Actor.${id}`,
        name: "Test PC",
        type: "PC",
        isOwner: true,
        items: [],
        system: {
            attributes: Object.fromEntries(ATTRIBUTE_KEYS.map(key => [key, {
                label: `wod.attributes.${key}`,
                value: 2,
                bonus: 0,
                total: 2,
                max: 5
            }])),
            health: {
                ...Object.fromEntries(WOUND_LEVELS.map(level => [level, {
                    value: 1,
                    total: 1,
                    penalty: 0
                }])),
                damage: { bashing: 0, lethal: 0, aggravated: 0, woundpenalty: 0, woundlevel: "" }
            },
            initiative: { base: 0, bonus: 0, total: 0 },
            conditions: { isignoringpain: false, isfrenzy: false },
            soak: { bashing: 0, lethal: 0, aggravated: 0 },
            settings: {
                variant: "",
                variantsheet: "",
                splat: "vampire",
                game: "vampire",
                dicesetting: "",
                usesplatfont: true,
                usechimerical: false,
                hasrage: false,
                haslores: false,
                hastorment: false,
                hasshapes: false,
                hasspheres: false,
                soak: {
                    bashing: { isrollable: true },
                    lethal: { isrollable: false },
                    aggravated: { isrollable: false }
                }
            }
        }
    };

    return mergeDeep(base, withoutKey(overrides, "_id"));
}

/**
 * Builds a Bonus item in the shape used by bonus-helpers.js.
 *
 * @param {object} options
 * @param {string} options.type - Bonus subtype, for example "attribute_buff" or "soak_buff".
 * @param {number} options.value
 * @param {boolean} [options.isactive=true]
 * @param {string} [options.settingtype] - Attribute, damage type or health level the bonus targets.
 * @param {object[]} [options.bonuslist]
 * @param {string} [options._id]
 */
export function createBonus({ type, value, isactive = true, settingtype = "", bonuslist = [], _id = `bonus-${type}-${settingtype}` }) {
    return {
        _id,
        type: "Bonus",
        name: `${type} ${settingtype}`.trim(),
        system: {
            type,
            value,
            isactive,
            settingtype,
            parentid: "",
            bonuslist,
            isremovable: true,
            version: "7.4.0"
        }
    };
}

/**
 * Builds an Advantage item (for example Blood Pool, Willpower or Corpus).
 */
export function createAdvantage({ id, permanent = 0, temporary = 0, isvisible = true, _id = `adv-${id}` }) {
    return {
        _id,
        type: "Advantage",
        name: id,
        system: {
            id,
            permanent,
            temporary,
            settings: { isvisible }
        }
    };
}

/**
 * Builds an Ability item for PC actors.
 */
export function createAbility({ id, label, type = "wod.types.talentability", isfavorited = false, isvisible = true, _id = `ability-${id}` }) {
    return {
        _id,
        type: "Ability",
        name: label ?? id,
        system: {
            id,
            label: label ?? id,
            type,
            isfavorited,
            settings: { isfavorited, isvisible }
        }
    };
}

/**
 * Returns a plain actor with an `items.get()` helper and an `update()` that
 * merges changes into `system`. This is the shape used by live documents.
 *
 * @param {object} actor - Output of createPcActor().
 * @param {(changes: object) => void} [onUpdate] - Called with each update payload.
 */
export function actorDocument(actor, onUpdate = () => {}) {
    const items = actor.items;
    Object.defineProperty(items, "get", {
        value: id => items.find(item => item._id === id),
        enumerable: false
    });
    Object.defineProperty(actor, "update", {
        value: async changes => {
            onUpdate(changes);
            for (const [path, value] of Object.entries(changes)) {
                setPath(actor, path, value);
            }
            return actor;
        },
        enumerable: false
    });
    return actor;
}

function setPath(object, path, value) {
    const keys = path.split(".");
    let target = object;
    for (const key of keys.slice(0, -1)) {
        target = target[key] ??= {};
    }
    target[keys.at(-1)] = value;
}

function withoutKey(object, key) {
    const { [key]: _ignored, ...rest } = object;
    return rest;
}

function mergeDeep(target, source) {
    for (const [key, value] of Object.entries(source)) {
        if (isPlainObject(value) && isPlainObject(target[key])) {
            mergeDeep(target[key], value);
        }
        else {
            target[key] = value;
        }
    }
    return target;
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
