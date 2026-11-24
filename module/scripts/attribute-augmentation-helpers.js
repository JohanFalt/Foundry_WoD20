import BonusHelper from "./bonus-helpers.js";
import { calculateTotals } from "./totals.js";

const ATTRIBUTES = ["strength", "dexterity", "stamina"];
const BONUS_IDS = {
    strength: "wodAugStrength01",
    dexterity: "wodAugDexterity1",
    stamina: "wodAugStamina001"
};
const queues = new Map();
const validValue = value => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const validVersion = value => typeof value === "string" &&
    /^\d+(?:\.\d+){0,2}(?:[-+ ]?[A-Za-z][A-Za-z0-9.-]*)?$/.test(value);
const markerOf = item => item?.flags?.worldofdarkness?.attributeAugmentation;
const getPath = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
const findItem = (actor, id) => [...actor.items].find(item => item._id === id);
const fingerprint = item => JSON.stringify(item.toObject?.() ?? item);

function requireUnchanged(actor, before) {
    for (const [id, expected] of before) {
        const item = findItem(actor, id);
        if (!item || fingerprint(item) !== expected) {
            throw new AttributeAugmentationError("CONCURRENT_MODIFICATION", `Managed Bonus ${id} changed during the operation`);
        }
    }
}

// itemsApplied: true = at least one Item change verified locally; false = no Item write attempted;
// null = an Item write was attempted but its result is uncertain. After a partial
// failure, reread Actor and managed Items before retrying any relative change.
export class AttributeAugmentationError extends Error {
    constructor(code, message, { conflicts = [], warnings = [], cause, itemsApplied = false } = {}) {
        super(message);
        this.name = "AttributeAugmentationError";
        this.code = code;
        this.conflicts = conflicts;
        this.warnings = warnings;
        this.itemsApplied = itemsApplied;
        if (cause) this.cause = cause;
    }
}

function requireActor(actor) {
    if (!actor || typeof actor.uuid !== "string" || actor.uuid === "" || !actor.items) {
        throw new AttributeAugmentationError("INVALID_ACTOR", "A persisted Actor with a UUID and items is required");
    }
}

function requireOwnerPC(actor) {
    if (actor.type !== "PC") throw new AttributeAugmentationError("NOT_PC", "Augment Attributes requires a PC Actor");
    if (actor.isOwner !== true) throw new AttributeAugmentationError("NOT_OWNER", "Actor owner permission is required");
}

function eligibilityError(actor) {
    if (actor.system?.settings?.variant === "earthbound") {
        return new AttributeAugmentationError("VARIANT_EXCLUDED", "Earthbound Actors cannot use Augment Attributes");
    }
    const pools = [...actor.items].filter(item => item.type === "Advantage" && item.system?.id === "bloodpool");
    if (!pools.length) return new AttributeAugmentationError("NO_BLOODPOOL", "A Blood Pool Advantage is required");
    if (!pools.some(item => item.system?.settings?.isvisible === true)) {
        return new AttributeAugmentationError("BLOODPOOL_HIDDEN", "A visible Blood Pool Advantage is required");
    }
    return null;
}

function requireAttribute(attribute) {
    if (!ATTRIBUTES.includes(attribute)) {
        throw new AttributeAugmentationError("INVALID_ATTRIBUTE", "Augment Attributes supports strength, dexterity, and stamina");
    }
}

function requireNumber(value, absolute) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || (absolute && value < 0)) {
        throw new AttributeAugmentationError("INVALID_VALUE", "Augment Attributes value must be a safe integer");
    }
}

function enqueue(actor, task) {
    requireActor(actor);
    const previous = queues.get(actor.uuid) ?? Promise.resolve();
    const operation = previous.then(task);
    const settled = operation.then(() => undefined, () => undefined);
    queues.set(actor.uuid, settled);
    void settled.then(() => {
        if (queues.get(actor.uuid) === settled) queues.delete(actor.uuid);
    });
    return operation;
}

function managedItemConflict(item, attribute) {
    const system = item.system;
    return item.type !== "Bonus" || system?.type !== "attribute_buff" ||
        system.settingtype !== attribute || system.parentid !== "" ||
        !Array.isArray(system.bonuslist) || system.bonuslist.length !== 0 ||
        system.isremovable !== false || !validValue(system.value) ||
        typeof system.isactive !== "boolean";
}

function inspect(actor) {
    const groups = Object.fromEntries(ATTRIBUTES.map(attribute => [attribute, []]));
    for (const item of actor.items) {
        const marker = markerOf(item);
        if (typeof marker === "string" && Object.hasOwn(groups, marker)) groups[marker].push(item);
    }
    const canonical = {};
    const missing = [];
    const conflicts = [];
    const warnings = [];
    const attributes = {};
    for (const attribute of ATTRIBUTES) {
        const group = groups[attribute];
        if (!group.length) missing.push(attribute);
        if (group.length > 1) {
            conflicts.push({ code: "BLOCKING_DUPLICATE", attribute, itemIds: group.map(item => item._id) });
        }
        for (const item of group) {
            if (managedItemConflict(item, attribute)) {
                conflicts.push({ code: "UNSAFE_MANAGED_ITEM", attribute, itemId: item._id });
            }
            if (!validVersion(item.system?.version)) {
                warnings.push({ code: "INVALID_VERSION", attribute, itemId: item._id, field: "version" });
            }
        }
        const item = group[0];
        if (item) canonical[attribute] = item;
        const storedValue = item ? item.system?.value : 0;
        const isactive = item?.system?.isactive === true;
        attributes[attribute] = {
            storedValue,
            effectiveValue: isactive && validValue(storedValue) ? storedValue : 0,
            isactive
        };
    }
    return { canonical, missing, conflicts, warnings, attributes };
}

function targetValues(scan, request) {
    const desired = {};
    if (request.kind === "set") desired[request.attribute] = request.value;
    if (request.kind === "change") {
        const effective = scan.attributes[request.attribute].effectiveValue;
        if (request.value > 0 || effective > 0) {
            const target = Math.max(0, effective + request.value);
            if (!validValue(target)) throw new AttributeAugmentationError("TOTALS_INVALID", "Augment Attributes target is unsafe");
            desired[request.attribute] = target;
        }
    }
    if (request.kind === "reset") {
        for (const attribute of ATTRIBUTES) desired[attribute] = 0;
    }
    return desired;
}

function itemUpdates(scan, desired) {
    const updates = [];
    for (const [attribute, value] of Object.entries(desired)) {
        const item = scan.canonical[attribute];
        if (!item) continue;
        const active = value > 0;
        if (item.system.value !== value || item.system.isactive !== active) {
            updates.push({ _id: item._id, "system.value": value, "system.isactive": active });
        }
    }
    return updates;
}

async function createItemData(attribute, value) {
    const name = game.i18n.localize("wod.attributes.bonus." + attribute);
    const data = await BonusHelper.CreateAttributeBuff("", name, attribute, value, value > 0, game.system.version);
    data._id = BONUS_IDS[attribute];
    data.flags = { worldofdarkness: { attributeAugmentation: attribute } };
    data.system.isremovable = false;
    data.system.bonuslist = [];
    return data;
}

function projectedActor(actor, updates, creations) {
    const snapshot = foundry.utils.duplicate(actor);
    if (!Array.isArray(snapshot.items)) {
        throw new AttributeAugmentationError("TOTALS_INVALID", "Actor items cannot be projected");
    }
    for (const update of updates) {
        const item = snapshot.items.find(candidate => candidate._id === update._id);
        if (!item) throw new AttributeAugmentationError("CONCURRENT_MODIFICATION", "Managed Bonus disappeared before calculation");
        item.system.value = update["system.value"];
        item.system.isactive = update["system.isactive"];
    }
    snapshot.items.push(...creations);
    return snapshot;
}

function requireSafeTotals(calculated) {
    const invalid = [];
    const check = (path, value) => {
        if (!Number.isSafeInteger(value)) invalid.push({ code: "UNSAFE_TOTAL", path, value });
    };
    for (const [attribute, data] of Object.entries(calculated.system.attributes)) {
        check("system.attributes." + attribute + ".total", data?.total);
    }
    for (const field of ["base", "total"]) check("system.initiative." + field, calculated.system.initiative?.[field]);
    for (const damage of ["bashing", "lethal", "aggravated"]) {
        check("system.soak." + damage, calculated.system.soak?.[damage]);
        if (calculated.system.settings.usechimerical) {
            check("system.soak.chimerical." + damage, calculated.system.soak?.chimerical?.[damage]);
        }
    }
    const health = calculated.system.health ?? {};
    for (const level of new Set([
        ...Object.keys(CONFIG.worldofdarkness.woundLevels),
        ...Object.entries(health).filter(([, value]) => value && Object.hasOwn(value, "total")).map(([level]) => level)
    ])) {
        check("system.health." + level + ".total", health[level]?.total);
    }
    if (invalid.length) {
        throw new AttributeAugmentationError("TOTALS_INVALID", "Calculated Actor totals are not safe integers", { conflicts: invalid });
    }
}

async function calculateSafeTotals(snapshot) {
    let calculated;
    try {
        calculated = await calculateTotals(snapshot);
    } catch (cause) {
        throw new AttributeAugmentationError("TOTALS_INVALID", "Actor totals could not be calculated", { cause });
    }
    requireSafeTotals(calculated);
    return calculated;
}

function addChanged(changes, path, actor, value) {
    if (value !== undefined && getPath(actor, path) !== value) changes[path] = value;
}

function totalChanges(actor, calculated) {
    const changes = {};
    for (const [attribute, data] of Object.entries(calculated.system.attributes)) {
        addChanged(changes, "system.attributes." + attribute + ".total", actor, data.total);
    }
    for (const damage of ["bashing", "lethal", "aggravated"]) {
        addChanged(changes, "system.soak." + damage, actor, calculated.system.soak?.[damage]);
        if (calculated.system.settings.usechimerical) {
            addChanged(changes, "system.soak.chimerical." + damage, actor,
                calculated.system.soak?.chimerical?.[damage]);
        }
    }
    for (const [level, data] of Object.entries(calculated.system.health)) {
        if (data && Object.hasOwn(data, "total")) {
            addChanged(changes, "system.health." + level + ".total", actor, data.total);
        }
    }
    for (const field of ["base", "total"]) {
        addChanged(changes, "system.initiative." + field, actor, calculated.system.initiative?.[field]);
    }
    if (Object.keys(changes).length) addChanged(changes, "system.settings.isupdated", actor, false);
    return changes;
}

async function persistTotals(actor) {
    const calculated = await calculateSafeTotals(foundry.utils.duplicate(actor));
    const changes = totalChanges(actor, calculated);
    if (Object.keys(changes).length) {
        try {
            await actor.update(changes);
        } catch (cause) {
            throw new AttributeAugmentationError("TOTALS_PERSISTENCE_FAILED", "Augment Attributes Actor totals could not be persisted", { cause });
        }
        for (const [path, expected] of Object.entries(changes)) {
            if (getPath(actor, path) !== expected) {
                throw new AttributeAugmentationError("TOTALS_NOT_APPLIED", `Actor update did not apply ${path}`);
            }
        }
    }
    const actual = await calculateSafeTotals(foundry.utils.duplicate(actor));
    if (Object.keys(totalChanges(actor, actual)).length) {
        throw new AttributeAugmentationError("CONCURRENT_MODIFICATION", "Actor calculation inputs changed during persistence; recalculate and retry");
    }
}

async function perform(actor, request) {
    requireOwnerPC(actor);
    if (request.kind === "set" || request.kind === "change") requireAttribute(request.attribute);
    if (request.kind === "set") requireNumber(request.value, true);
    if (request.kind === "change") requireNumber(request.value, false);

    const scan = inspect(actor);
    if (scan.conflicts.length) {
        throw new AttributeAugmentationError("CONFLICT", "Marked Augment Attributes items require manual review", {
            conflicts: scan.conflicts, warnings: scan.warnings
        });
    }
    const desired = targetValues(scan, request);
    const eligibility = eligibilityError(actor);
    const current = request.attribute === undefined ? null : scan.attributes[request.attribute];
    const target = request.attribute === undefined ? undefined : desired[request.attribute];
    const needsEligibility = request.kind === "ensure" ||
        (target !== undefined && target > current.effectiveValue) ||
        (target > 0 && !current.isactive);
    if (needsEligibility && eligibility) throw eligibility;

    const updates = itemUpdates(scan, desired);
    const beforeItems = new Map(Object.values(scan.canonical).map(item => [item._id, fingerprint(item)]));
    const creations = await Promise.all((needsEligibility ? scan.missing : []).map(attribute =>
        createItemData(attribute, desired[attribute] ?? 0)
    ));
    await calculateSafeTotals(projectedActor(actor, updates, creations));

    let itemWriteAttempted = false;
    let itemsApplied = false;
    try {
        requireOwnerPC(actor);
        if (needsEligibility) {
            const currentEligibility = eligibilityError(actor);
            if (currentEligibility) throw currentEligibility;
        }
        requireUnchanged(actor, beforeItems);
        if (creations.length) {
            itemWriteAttempted = true;
            await actor.createEmbeddedDocuments("Item", creations, { keepId: true });
            requireUnchanged(actor, beforeItems);
            for (const data of creations) {
                const attribute = markerOf(data);
                const matches = [...actor.items].filter(item => markerOf(item) === attribute);
                if (matches.length !== 1 || managedItemConflict(matches[0], attribute) ||
                    matches[0].system.value !== data.system.value ||
                    matches[0].system.isactive !== data.system.isactive) {
                    throw new AttributeAugmentationError("NOT_APPLIED", `Augment Attributes ${attribute} creation did not apply`);
                }
            }
            itemsApplied = true;
        }
        if (updates.length) {
            requireUnchanged(actor, beforeItems);
            itemWriteAttempted = true;
            await actor.updateEmbeddedDocuments("Item", updates);
            for (const update of updates) {
                const item = findItem(actor, update._id);
                const attribute = ATTRIBUTES.find(name => scan.canonical[name]?._id === update._id);
                if (!item || markerOf(item) !== attribute || managedItemConflict(item, attribute) ||
                    item.system?.value !== update["system.value"] ||
                    item.system?.isactive !== update["system.isactive"]) {
                    throw new AttributeAugmentationError("NOT_APPLIED", `Augment Attributes ${update._id} update did not apply`);
                }
            }
            itemsApplied = true;
        }
    } catch (cause) {
        const applied = itemsApplied ? true : itemWriteAttempted ? null : false;
        if (cause instanceof AttributeAugmentationError) {
            cause.itemsApplied = applied;
            throw cause;
        }
        throw new AttributeAugmentationError("PERSISTENCE_FAILED", "Augment Attributes item changes could not be persisted", {
            cause, itemsApplied: applied
        });
    }
    try {
        await persistTotals(actor);
    } catch (cause) {
        if (cause instanceof AttributeAugmentationError) cause.itemsApplied = itemsApplied;
        throw cause;
    }
    return AttributeAugmentationHelper.read(actor);
}

export default class AttributeAugmentationHelper {
    static read(actor) {
        requireActor(actor);
        const state = inspect(actor);
        return { attributes: state.attributes, missing: state.missing,
            conflicts: state.conflicts, warnings: state.warnings };
    }

    static ensure(actor) {
        return enqueue(actor, () => perform(actor, { kind: "ensure" }));
    }

    static setValue(actor, attribute, absoluteValue) {
        return enqueue(actor, () => perform(actor, { kind: "set", attribute, value: absoluteValue }));
    }

    static changeValue(actor, attribute, delta) {
        return enqueue(actor, () => perform(actor, { kind: "change", attribute, value: delta }));
    }

    static reset(actor) {
        return enqueue(actor, () => perform(actor, { kind: "reset" }));
    }
}
