import test from "node:test";
import assert from "node:assert/strict";

const actors = new Map();
globalThis.FormApplication = class {};
globalThis.CONFIG = {
    worldofdarkness: {
        sheettype: { changingbreed: "Changing Breed", werewolf: "Werewolf" },
        woundLevels: {},
        damageTypes: {}
    }
};
globalThis.game = {
    system: { version: "7.4.0" },
    i18n: { localize: key => key },
    actors: { get: id => actors.get(id) }
};
globalThis.foundry = {
    utils: { duplicate: actor => actor.toObject() }
};

const copy = value => structuredClone(value);
const helper = async () => (await import("../module/scripts/attribute-augmentation-helpers.js")).default;

function assignPath(object, path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const parent = keys.reduce((target, key) => target[key], object);
    parent[last] = value;
}

function makeItem(marker, value = 0, isactive = false, overrides = {}) {
    return {
        _id: overrides._id ?? "item-" + marker,
        type: overrides.type ?? "Bonus",
        name: overrides.name ?? marker,
        flags: { worldofdarkness: { attributeAugmentation: marker } },
        system: {
            type: "attribute_buff",
            settingtype: marker,
            parentid: "",
            version: "7.4.0",
            isremovable: false,
            value,
            isactive,
            bonuslist: [],
            ...overrides.system
        }
    };
}

function makeAdvantage(id = "bloodpool", isvisible = true, itemId = "advantage-" + id) {
    return {
        _id: itemId,
        type: "Advantage",
        name: id,
        system: { id, settings: { isvisible }, bonuslist: [] }
    };
}

class FakeActor {
    constructor(options = {}) {
        this._id = options.id ?? "actor-1";
        this.id = this._id;
        this.uuid = options.uuid ?? "Actor." + this.id;
        this.type = options.type ?? "PC";
        this.isOwner = options.isOwner ?? true;
        this.system = {
            settings: {
                variant: options.variant ?? "general",
                splat: options.splat ?? "vampire",
                isupdated: true,
                hasrage: false,
                usechimerical: false,
                soak: {
                    bashing: { isrollable: true },
                    lethal: { isrollable: true },
                    aggravated: { isrollable: false }
                }
            },
            attributes: {
                strength: { value: 3, bonus: 0, total: 3, label: "wod.attributes.strength" },
                dexterity: { value: 5, bonus: 0, total: 5, label: "wod.attributes.dexterity" },
                stamina: { value: 3, bonus: 0, total: 3, label: "wod.attributes.stamina" },
                wits: { value: 2, bonus: 0, total: 2, label: "wod.attributes.wits" }
            },
            soak: { bashing: 3, lethal: 3, aggravated: 0 },
            health: { damage: { woundpenalty: 0 } },
            conditions: { isignoringpain: false },
            initiative: { base: 7, bonus: 0, total: 7 },
            ...copy(options.system ?? {})
        };
        if (Object.hasOwn(options, "hasbloodpool")) {
            this.system.settings.hasbloodpool = options.hasbloodpool;
        }
        this.items = copy([
            ...(options.items ?? []),
            ...(options.bloodpoolItems ?? [makeAdvantage()])
        ]);
        this.calls = { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 };
        this.failActorUpdate = false;
        this.sheet = {
            rendered: false,
            render: () => { this.calls.render++; }
        };
        actors.set(this.id, this);
    }

    toObject() {
        return copy({ _id: this._id, type: this.type, system: this.system, items: this.items });
    }

    async createEmbeddedDocuments(type, documents) {
        assert.equal(type, "Item");
        this.calls.create++;
        const created = documents.map((document, index) => ({
            ...copy(document),
            _id: document._id ?? "created-" + (this.items.length + index + 1),
            system: { bonuslist: [], ...copy(document.system) }
        }));
        this.items.push(...created);
        return created;
    }

    async updateEmbeddedDocuments(type, updates) {
        assert.equal(type, "Item");
        this.calls.updateItems++;
        for (const update of updates) {
            const item = this.items.find(candidate => candidate._id === update._id);
            assert.ok(item);
            for (const [path, value] of Object.entries(update)) {
                if (path !== "_id") assignPath(item, path, value);
            }
        }
    }

    async deleteEmbeddedDocuments(type, ids) {
        assert.equal(type, "Item");
        this.calls.delete++;
        this.items = this.items.filter(item => !ids.includes(item._id));
    }

    async update(updates) {
        this.calls.updateActor++;
        if (this.failActorUpdate) throw new Error("actor persistence failed");
        if (this.concurrentBioChange) this.system.bio.note = "concurrent edit";
        for (const [path, value] of Object.entries(updates)) {
            assignPath(this, path, value);
        }
    }
}

test("ensure creates exactly three marked persistent Bonus items", async () => {
    const AttributeAugmentationHelper = await helper();
    assert.equal(AttributeAugmentationHelper.name, "AttributeAugmentationHelper");
    const actor = new FakeActor();
    const result = await AttributeAugmentationHelper.ensure(actor);
    const bonuses = actor.items.filter(item => item.type === "Bonus");
    assert.deepEqual(bonuses.map(item => item.flags.worldofdarkness.attributeAugmentation).sort(), [
        "dexterity", "stamina", "strength"
    ]);
    for (const item of bonuses) {
        assert.equal(item.type, "Bonus");
        assert.equal(item.system.type, "attribute_buff");
        assert.equal(item.system.settingtype, item.flags.worldofdarkness.attributeAugmentation);
        assert.equal(Object.hasOwn(item.flags.worldofdarkness, "bloodBuff"), false);
        assert.equal(item.system.parentid, "");
        assert.equal(item.system.version, "7.4.0");
        assert.equal(item.system.isremovable, false);
        assert.equal(item.system.value, 0);
        assert.equal(item.system.isactive, false);
    }
    assert.equal(actor.calls.create, 1);
    assert.equal(result.missing.length, 0);
});

test("two first-use clients request the same per-attribute IDs and preserve legacy IDs", async () => {
    const H = await helper();
    const idsByAttribute = async actor => {
        const create = actor.createEmbeddedDocuments.bind(actor);
        actor.createEmbeddedDocuments = async (type, data, options) => {
            assert.equal(options?.keepId, true);
            return create(type, data);
        };
        await H.changeValue(actor, "strength", 1);
        return Object.fromEntries(actor.items.filter(item => item.type === "Bonus").map(item =>
            [item.flags.worldofdarkness.attributeAugmentation, item._id]
        ));
    };
    const first = await idsByAttribute(new FakeActor());
    assert.deepEqual(await idsByAttribute(new FakeActor()), first);
    assert.equal(new Set(Object.values(first)).size, 3);
    for (const id of Object.values(first)) assert.match(id, /^[A-Za-z0-9]{16}$/);
    const legacy = new FakeActor({ items: [makeItem("strength", 1, true, { _id: "olderStrengthId1" })] });
    assert.deepEqual(await idsByAttribute(legacy), { ...first, strength: "olderStrengthId1" });
});

test("read reports missing items without writing", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    const state = AttributeAugmentationHelper.read(actor);
    assert.deepEqual(state.missing, ["strength", "dexterity", "stamina"]);
    assert.equal(state.attributes.dexterity.effectiveValue, 0);
    assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("read and mutations reject invalid actors", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const actor of [null, {}, { uuid: "", items: [] }]) {
        assert.throws(() => AttributeAugmentationHelper.read(actor), error => error.code === "INVALID_ACTOR");
        assert.throws(() => AttributeAugmentationHelper.ensure(actor), error => error.code === "INVALID_ACTOR");
    }
});

test("repeated and concurrent ensure creates no duplicate items", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await Promise.all([AttributeAugmentationHelper.ensure(actor), AttributeAugmentationHelper.ensure(actor), AttributeAugmentationHelper.ensure(actor)]);
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.items.filter(item => item.type === "Bonus").length, 3);
    assert.equal(actor.calls.create, 1);
});

test("a PC with a visible Blood Pool is eligible without legacy hasbloodpool", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    assert.equal(Object.hasOwn(actor.system.settings, "hasbloodpool"), false);
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.items.filter(item => item.type === "Bonus").length, 3);
});

test("rejection codes are precise and every rejected mutation makes zero writes", async () => {
    const AttributeAugmentationHelper = await helper();
    const cases = [
        { id: "non-pc", type: "Creature", hasbloodpool: true, expected: "NOT_PC" },
        { id: "non-owner", isOwner: false, expected: "NOT_OWNER" },
        { id: "earthbound", variant: "earthbound", expected: "VARIANT_EXCLUDED" },
        { id: "missing", bloodpoolItems: [], expected: "NO_BLOODPOOL" },
        { id: "legacy-only", hasbloodpool: true, bloodpoolItems: [], expected: "NO_BLOODPOOL" },
        { id: "hidden", bloodpoolItems: [makeAdvantage("bloodpool", false)], expected: "BLOODPOOL_HIDDEN" },
        { id: "faith-only", bloodpoolItems: [makeAdvantage("faith")], expected: "NO_BLOODPOOL" },
        { id: "essence-only", bloodpoolItems: [makeAdvantage("essence")], expected: "NO_BLOODPOOL" }
    ];
    for (const entry of cases) {
        const actor = new FakeActor(entry);
        const before = copy(actor.items);
        const operations = [
            () => AttributeAugmentationHelper.ensure(actor),
            () => AttributeAugmentationHelper.setValue(actor, "strength", 1),
            () => AttributeAugmentationHelper.changeValue(actor, "strength", 1)
        ];
        if (entry.expected === "NOT_PC" || entry.expected === "NOT_OWNER") {
            operations.push(() => AttributeAugmentationHelper.reset(actor));
        }
        for (const operation of operations) {
            await assert.rejects(operation(), error => error.code === entry.expected);
            assert.deepEqual(actor.items, before);
            assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
        }
    }
});

test("eligibility rejection priority follows the approved order", async () => {
    const AttributeAugmentationHelper = await helper();
    const cases = [
        { id: "priority-type", type: "Creature", isOwner: false, variant: "earthbound", bloodpoolItems: [], expected: "NOT_PC" },
        { id: "priority-owner", isOwner: false, variant: "earthbound", bloodpoolItems: [], expected: "NOT_OWNER" },
        { id: "priority-variant", variant: "earthbound", bloodpoolItems: [makeAdvantage("bloodpool", false)], expected: "VARIANT_EXCLUDED" },
        { id: "priority-missing", bloodpoolItems: [makeAdvantage("faith", false)], expected: "NO_BLOODPOOL" },
        { id: "priority-hidden", bloodpoolItems: [makeAdvantage("bloodpool", false)], expected: "BLOODPOOL_HIDDEN" }
    ];
    for (const entry of cases) {
        const actor = new FakeActor(entry);
        await assert.rejects(AttributeAugmentationHelper.ensure(actor), error => error.code === entry.expected);
    }
});

test("one visible Blood Pool is sufficient alongside hidden duplicates", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ bloodpoolItems: [
        makeAdvantage("bloodpool", false, "hidden-bloodpool"),
        makeAdvantage("bloodpool", true, "visible-bloodpool")
    ] });
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.items.filter(item => item.type === "Bonus").length, 3);
});

test("unrelated bonuses and the manual attribute bonus are unchanged", async () => {
    const AttributeAugmentationHelper = await helper();
    const unrelated = makeItem("unknown", 5, true, { _id: "unrelated" });
    const unmarked = makeItem("dexterity", 9, true, { _id: "unmarked" });
    unmarked.flags = {};
    const actor = new FakeActor({ items: [unrelated, unmarked] });
    actor.system.attributes.dexterity.bonus = 4;
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    assert.deepEqual(actor.items.find(item => item._id === "unrelated"), unrelated);
    assert.deepEqual(actor.items.find(item => item._id === "unmarked"), unmarked);
    assert.equal(actor.system.attributes.dexterity.bonus, 4);
    assert.equal(actor.system.attributes.dexterity.total, 20);
});

test("read reports stored and effective values of an inactive item without writes", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("dexterity", 2, false)] });
    const state = AttributeAugmentationHelper.read(actor);
    assert.equal(state.attributes.dexterity.storedValue, 2);
    assert.equal(state.attributes.dexterity.effectiveValue, 0);
    assert.equal(state.attributes.dexterity.isactive, false);
    assert.equal(actor.items[0].system.isactive, false);
    assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("ensure preserves manual deactivation and stored value", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("dexterity", 2, false)] });
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.items[0].system.value, 2);
    assert.equal(actor.items[0].system.isactive, false);
});

test("setValue uses an absolute nonnegative value and activates only positive values", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.setValue(actor, "strength", 3);
    await AttributeAugmentationHelper.setValue(actor, "strength", 3);
    assert.equal(actor.items.filter(item => item.flags?.worldofdarkness?.attributeAugmentation).length, 3);
    const item = actor.items.find(item => item.flags?.worldofdarkness?.attributeAugmentation === "strength");
    assert.equal(item.system.value, 3);
    assert.equal(item.system.isactive, true);
    await AttributeAugmentationHelper.setValue(actor, "strength", 0);
    assert.equal(item.system.value, 0);
    assert.equal(item.system.isactive, false);
});

test("changeValue uses the fresh effective value and clamps at zero", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("dexterity", 2, false)] });
    await AttributeAugmentationHelper.changeValue(actor, "dexterity", 1);
    assert.equal(actor.items.filter(candidate => candidate.flags?.worldofdarkness?.attributeAugmentation).length, 3);
    let item = actor.items.find(candidate => candidate.flags?.worldofdarkness?.attributeAugmentation === "dexterity");
    assert.equal(item.system.value, 1);
    assert.equal(item.system.isactive, true);
    await AttributeAugmentationHelper.changeValue(actor, "dexterity", -4);
    assert.equal(item.system.value, 0);
    assert.equal(item.system.isactive, false);
});

test("cleanup remains available after Blood Pool loss without creating missing items", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const loss of ["hidden", "removed", "earthbound"]) {
        const actor = new FakeActor({ id: `cleanup-${loss}` });
        await AttributeAugmentationHelper.setValue(actor, "dexterity", 3);
        actor.items = actor.items.filter(item => item.flags?.worldofdarkness?.attributeAugmentation !== "stamina");
        if (loss === "hidden") actor.items.find(item => item.type === "Advantage").system.settings.isvisible = false;
        if (loss === "removed") actor.items = actor.items.filter(item => item.type !== "Advantage");
        if (loss === "earthbound") actor.system.settings.variant = "earthbound";
        const count = actor.items.length;
        await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
        await AttributeAugmentationHelper.changeValue(actor, "dexterity", -1);
        await AttributeAugmentationHelper.reset(actor);
        assert.equal(AttributeAugmentationHelper.read(actor).attributes.dexterity.effectiveValue, 0);
        assert.equal(actor.items.length, count);
        assert.equal(actor.items.some(item => item.flags?.worldofdarkness?.attributeAugmentation === "stamina"), false);
    }
});

test("eligible cleanup never creates missing Bonuses", async () => {
    const AttributeAugmentationHelper = await helper();
    const operations = [
        ["reset", actor => AttributeAugmentationHelper.reset(actor), 0],
        ["clear", actor => AttributeAugmentationHelper.setValue(actor, "strength", 0), 0],
        ["reduce", actor => AttributeAugmentationHelper.changeValue(actor, "strength", -1), 1],
        ["zero delta", actor => AttributeAugmentationHelper.changeValue(actor, "strength", 0), 2]
    ];
    for (const seeded of [false, true]) {
        for (const [name, operation, expected] of operations) {
            const actor = new FakeActor({
                id: `eligible-cleanup-${seeded}-${name}`,
                items: seeded ? [makeItem("strength", 2, true)] : []
            });
            await operation(actor);
            assert.equal(actor.calls.create, 0, `${name} with ${seeded ? "one" : "zero"} managed items`);
            const managed = actor.items.filter(item => item.flags?.worldofdarkness?.attributeAugmentation);
            assert.equal(managed.length, seeded ? 1 : 0);
            if (seeded) assert.equal(managed[0].system.value, expected);
        }
    }
});

test("eligibility loss during in-flight cleanup does not create Bonuses", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", 2, true)] });
    const original = actor.toObject.bind(actor);
    let hidden = false;
    actor.toObject = () => {
        const snapshot = original();
        if (!hidden) {
            hidden = true;
            actor.items.find(item => item.type === "Advantage").system.settings.isvisible = false;
        }
        return snapshot;
    };
    await AttributeAugmentationHelper.reset(actor);
    assert.equal(actor.calls.create, 0);
    assert.equal(actor.items.find(item => item._id === "item-strength").system.value, 0);
    assert.deepEqual(AttributeAugmentationHelper.read(actor).missing, ["dexterity", "stamina"]);
});

test("ineligible Actor cannot increase or activate a managed bonus", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("dexterity", 2, false)], bloodpoolItems: [] });
    const before = actor.toObject();
    for (const operation of [
        () => AttributeAugmentationHelper.setValue(actor, "dexterity", 2),
        () => AttributeAugmentationHelper.changeValue(actor, "dexterity", 1)
    ]) {
        await assert.rejects(operation(), error => error.code === "NO_BLOODPOOL");
    }
    assert.deepEqual(actor.toObject(), before);
    assert.equal(actor.calls.create, 0);
    assert.equal(actor.calls.updateItems, 0);
});

test("negative change at zero effective value preserves inactive stored value", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("dexterity", 2, false)], bloodpoolItems: [] });
    await AttributeAugmentationHelper.changeValue(actor, "dexterity", -1);
    assert.equal(actor.items[0].system.value, 2);
    assert.equal(actor.calls.updateItems, 0);
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 0);
    assert.equal(actor.items[0].system.value, 0);
    assert.equal(actor.items[0].system.isactive, false);
});

test("reset clears all three values without deleting items", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength", 2, true), makeItem("dexterity", 3, true), makeItem("stamina", 4, false)
    ] });
    const ids = actor.items.map(item => item._id);
    await AttributeAugmentationHelper.reset(actor);
    assert.deepEqual(actor.items.map(item => item._id), ids);
    assert.ok(actor.items.filter(item => item.type === "Bonus").every(item =>
        item.system.value === 0 && item.system.isactive === false));
    assert.equal(actor.calls.delete, 0);
});

test("malformed marked item is rejected without repair or item writes", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", -2, true, {
        system: {
            type: "attribute_diff", settingtype: "dexterity", parentid: "foreign",
            version: "6.0.0", isremovable: true
        }
    })] });
    const before = actor.toObject();
    await assert.rejects(AttributeAugmentationHelper.ensure(actor), error => error.code === "CONFLICT");
    assert.deepEqual(actor.toObject(), before);
    assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("invalid stored value is not silently zeroed or replaced", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", -2, true)] });
    const before = actor.toObject();
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, "strength", 3), error => error.code === "CONFLICT");
    const item = actor.items.find(candidate => candidate.flags?.worldofdarkness?.attributeAugmentation === "strength");
    assert.equal(item.system.value, -2);
    assert.deepEqual(actor.toObject(), before);
});

test("system version drift does not rewrite healthy existing bonus items", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength"), makeItem("dexterity"), makeItem("stamina")
    ] });
    const oldVersion = game.system.version;
    game.system.version = "8.0.0";
    try {
        const result = await AttributeAugmentationHelper.ensure(actor);
        assert.equal(actor.calls.updateItems, 0);
        assert.ok(actor.items.filter(item => item.type === "Bonus").every(item => item.system.version === "7.4.0"));
        assert.equal(result.warnings.some(warning => warning.field === "version"), false);
        assert.equal(result.warnings.some(warning => warning.code === "INVALID_VERSION"), false);
    } finally {
        game.system.version = oldVersion;
    }
});

test("an invalid existing version is reported without a silent upgrade", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", 0, false, { system: { version: null } })] });
    const result = await AttributeAugmentationHelper.ensure(actor);
    const item = actor.items.find(candidate => candidate.flags?.worldofdarkness?.attributeAugmentation === "strength");
    assert.equal(item.system.version, null);
    assert.ok(result.warnings.some(warning => warning.code === "INVALID_VERSION" && warning.attribute === "strength"));
    assert.equal(actor.calls.updateItems, 0);
});

test("a non-version string is reported without changing it", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", 0, false, { system: { version: "old" } })] });
    const result = await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.items.find(item => item.flags?.worldofdarkness?.attributeAugmentation === "strength").system.version, "old");
    assert.ok(result.warnings.some(warning => warning.code === "INVALID_VERSION" && warning.attribute === "strength"));
    assert.equal(actor.calls.updateItems, 0);
});

test("even a clean zero duplicate is preserved and reported as a conflict", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength", 0, false, { _id: "z" }),
        makeItem("strength", 2, true, { _id: "a" })
    ] });
    const before = actor.toObject();
    await assert.rejects(AttributeAugmentationHelper.ensure(actor), error => error.code === "CONFLICT");
    assert.deepEqual(actor.toObject(), before);
    assert.equal(actor.calls.delete, 0);
});

test("unsafe zero duplicates block cleanup without discarding other effects", async () => {
    const AttributeAugmentationHelper = await helper();
    const cases = [
        { name: "wrong bonus type", system: { type: "initiative_buff" } },
        { name: "wrong attribute target", system: { settingtype: "dexterity" } },
        { name: "active zero", active: true },
        { name: "foreign nested effect", system: { bonuslist: [
            { type: "soak_buff", settingtype: "all", value: 2, isactive: true }
        ] } },
        { name: "foreign parent", system: { parentid: "foreign" } },
        { name: "missing bonuslist", system: { bonuslist: undefined } }
    ];
    for (const entry of cases) {
        const duplicate = makeItem("strength", 0, entry.active ?? false, {
            _id: "z", system: entry.system
        });
        const actor = new FakeActor({ id: entry.name, items: [
            makeItem("strength", 1, true, { _id: "a" }), duplicate
        ] });
        const before = copy(actor.items);
        await assert.rejects(AttributeAugmentationHelper.ensure(actor), error =>
            error.code === "CONFLICT" && error.conflicts.some(conflict => conflict.code === "BLOCKING_DUPLICATE"), entry.name);
        assert.deepEqual(actor.items, before, entry.name);
        assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 }, entry.name);
    }
});

test("reset preserves both orderings of a zero and nonzero duplicate", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const [canonicalValue, redundantValue] of [[0, 2], [2, 0]]) {
        const actor = new FakeActor({ id: `reset-${canonicalValue}-${redundantValue}`, items: [
            makeItem("strength", canonicalValue, canonicalValue > 0, { _id: "a" }),
            makeItem("strength", redundantValue, redundantValue > 0, { _id: "z" })
        ] });
        actor.system.attributes.strength.total = 5;
        const before = actor.toObject();
        await assert.rejects(AttributeAugmentationHelper.reset(actor), error => error.code === "CONFLICT");
        assert.deepEqual(actor.toObject(), before);
        assert.equal(actor.calls.delete, 0);
    }
});

test("nonzero duplicate remains a conflict for ensure, setValue, and changeValue", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const operation of [
        actor => AttributeAugmentationHelper.ensure(actor),
        actor => AttributeAugmentationHelper.setValue(actor, "strength", 3),
        actor => AttributeAugmentationHelper.changeValue(actor, "strength", 1)
    ]) {
        const actor = new FakeActor({ items: [
            makeItem("strength", 0, false, { _id: "a" }),
            makeItem("strength", 2, true, { _id: "z" })
        ] });
        const before = copy(actor.items);
        await assert.rejects(operation(actor), error => error.code === "CONFLICT");
        assert.deepEqual(actor.items, before);
        assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
    }
});

test("reset rejects unsafe duplicate groups before any item or actor write", async () => {
    const AttributeAugmentationHelper = await helper();
    const cases = [
        { name: "foreign effect", duplicate: { system: { bonuslist: [
            { type: "soak_buff", settingtype: "all", value: 2, isactive: true }
        ] } } },
        { name: "wrong type", duplicate: { system: { type: "attribute_diff" } } },
        { name: "wrong settingtype", duplicate: { system: { settingtype: "dexterity" } } },
        { name: "foreign parent", duplicate: { system: { parentid: "other" } } },
        { name: "invalid value", value: -1 },
        { name: "invalid active", active: "yes" },
        { name: "wrong document type", duplicate: { type: "Trait" } },
        { name: "unsafe canonical", value: 0, active: false, canonical: { system: { bonuslist: [
            { type: "soak_buff", settingtype: "all", value: 2, isactive: true }
        ] } } }
    ];
    for (const entry of cases) {
        const actor = new FakeActor({ id: entry.name, items: [
            makeItem("strength", 0, false, { _id: "a", ...entry.canonical }),
            makeItem("strength", entry.value ?? 2, entry.active ?? true, { _id: "z", ...entry.duplicate })
        ] });
        const before = copy(actor.items);
        await assert.rejects(AttributeAugmentationHelper.reset(actor), error => error.code === "CONFLICT", entry.name);
        assert.deepEqual(actor.items, before, entry.name);
        assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 }, entry.name);
    }
});

test("duplicate conflicts before any write or deletion", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength", 1, true, { _id: "a" }),
        makeItem("strength", 0, false, { _id: "z" })
    ] });
    await assert.rejects(AttributeAugmentationHelper.ensure(actor), error => error.code === "CONFLICT");
    assert.ok(actor.items.some(item => item._id === "z"));
    assert.equal(actor.calls.create, 0);
    assert.equal(actor.calls.delete, 0);
});

test("nonzero or invalid duplicate blocks all writes", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const value of [1, -1, NaN, "0"]) {
        const actor = new FakeActor({ id: "dup-" + String(value), items: [
            makeItem("strength", 0, false, { _id: "a" }),
            makeItem("strength", value, true, { _id: "b" })
        ] });
        await assert.rejects(AttributeAugmentationHelper.ensure(actor), error =>
            error.code === "CONFLICT" && error.conflicts.length > 0);
        assert.equal(actor.items.length, 3);
        assert.equal(actor.calls.create, 0);
        assert.equal(actor.calls.updateItems, 0);
        assert.equal(actor.calls.delete, 0);
    }
});

test("marked non-Bonus item blocks without partial repair", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", 0, false, { type: "Trait" })] });
    await assert.rejects(AttributeAugmentationHelper.ensure(actor), error => error.code === "CONFLICT");
    assert.equal(actor.calls.create, 0);
    assert.equal(actor.calls.updateItems, 0);
});

test("marked wrong type, target, parent, or foreign bonuslist is never retargeted", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const system of [
        { type: "initiative_buff" },
        { settingtype: "stamina" },
        { parentid: "foreign" },
        { bonuslist: [{ type: "soak_buff", settingtype: "all", value: 2, isactive: true }] }
    ]) {
        const actor = new FakeActor({ items: [makeItem("strength", 2, true, { system })] });
        const before = actor.toObject();
        await assert.rejects(AttributeAugmentationHelper.setValue(actor, "strength", 0), error => error.code === "CONFLICT");
        assert.deepEqual(actor.toObject(), before);
        assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
    }
});

test("unknown marker is not adopted, repaired, or removed", async () => {
    const AttributeAugmentationHelper = await helper();
    const unknown = makeItem("other", 8, true, { _id: "unknown", system: { type: "other" } });
    const actor = new FakeActor({ items: [unknown] });
    await AttributeAugmentationHelper.ensure(actor);
    assert.deepEqual(actor.items.find(item => item._id === "unknown"), unknown);
    assert.equal(actor.items.length, 5);
});

test("array marker is not coerced into a managed attribute", async () => {
    const AttributeAugmentationHelper = await helper();
    const odd = makeItem("strength", 1, true, { _id: "array-marker" });
    odd.flags.worldofdarkness.attributeAugmentation = ["strength"];
    const actor = new FakeActor({ items: [odd] });
    const state = AttributeAugmentationHelper.read(actor);
    assert.ok(state.missing.includes("strength"));
    assert.deepEqual(state.conflicts, []);
    await AttributeAugmentationHelper.ensure(actor);
    assert.deepEqual(actor.items.find(item => item._id === "array-marker"), odd);
    assert.equal(actor.items.filter(item => item.flags?.worldofdarkness?.attributeAugmentation === "strength").length, 1);
});

test("no-op set, reset, and ensure avoid extra persistent writes", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.ensure(actor);
    actor.calls = { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 };
    await AttributeAugmentationHelper.setValue(actor, "strength", 0);
    await AttributeAugmentationHelper.reset(actor);
    await AttributeAugmentationHelper.ensure(actor);
    assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("invalid numeric input and attribute are rejected without writes", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    for (const value of [-1, 1.2, NaN, Infinity, "2"]) {
        await assert.rejects(AttributeAugmentationHelper.setValue(actor, "strength", value), error => error.code === "INVALID_VALUE");
    }
    for (const delta of [1.1, NaN, Infinity, "1"]) {
        await assert.rejects(AttributeAugmentationHelper.changeValue(actor, "strength", delta), error => error.code === "INVALID_VALUE");
    }
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, "wits", 1), error => error.code === "INVALID_ATTRIBUTE");
    assert.equal(actor.items.length, 1);
    assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("parallel increments are serialized by actor UUID", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await Promise.all(Array.from({ length: 10 }, () => AttributeAugmentationHelper.changeValue(actor, "strength", 1)));
    assert.equal(AttributeAugmentationHelper.read(actor).attributes.strength.effectiveValue, 10);
});

test("a rejected operation does not poison the actor queue", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    const rejected = AttributeAugmentationHelper.setValue(actor, "strength", -1);
    const accepted = AttributeAugmentationHelper.setValue(actor, "strength", 2);
    await assert.rejects(rejected);
    await accepted;
    assert.equal(AttributeAugmentationHelper.read(actor).attributes.strength.effectiveValue, 2);
});

test("item mutations recalculate and persist actual attribute and initiative totals", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    assert.equal(actor.system.attributes.dexterity.total, 7);
    assert.equal(actor.system.initiative.total, 9);
    assert.ok(actor.calls.updateActor > 0);
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 3);
    assert.equal(actor.system.attributes.dexterity.total, 8);
    assert.equal(actor.system.initiative.total, 10);
});

test("render failure after actor persistence cannot turn a successful set into a failure", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    actor.sheet.rendered = true;
    actor.sheet.render = () => { throw new Error("render failed"); };
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    assert.equal(actor.system.attributes.dexterity.total, 7);
    assert.equal(actor.system.initiative.total, 9);
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    assert.equal(actor.system.attributes.dexterity.total, 7);
    assert.equal(actor.items.find(item => item.flags?.worldofdarkness?.attributeAugmentation === "dexterity").system.value, 2);
});

test("actual calculateTotals ignores an inactive stored +2", async () => {
    const { calculateTotals } = await import("../module/scripts/totals.js");
    const actor = new FakeActor({ items: [makeItem("dexterity", 2, false)] });
    const calculated = await calculateTotals(actor.toObject());
    assert.equal(calculated.system.attributes.dexterity.total, 5);
    assert.equal(calculated.system.initiative.total, 7);
});

test("Stamina Augment Attributes propagates to persisted soak totals", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.setValue(actor, "stamina", 2);
    assert.equal(actor.system.attributes.stamina.total, 5);
    assert.deepEqual(actor.system.soak, { bashing: 5, lethal: 5, aggravated: 0 });
    const item = actor.items.find(candidate => candidate.flags?.worldofdarkness?.attributeAugmentation === "stamina");
    item.system.value = 4;
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.system.attributes.stamina.total, 7);
    assert.deepEqual(actor.system.soak, { bashing: 7, lethal: 7, aggravated: 0 });
});

test("safe large values work and unsafe projected totals cause no writes", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const value of [12, 100, 250, 1_000_000]) {
        const actor = new FakeActor({ id: `large-${value}` });
        await AttributeAugmentationHelper.setValue(actor, "strength", value);
        assert.equal(actor.system.attributes.strength.total, value + 3);
    }
    const maximum = new FakeActor({ id: "max-safe" });
    maximum.system.attributes.strength.value = 0;
    await AttributeAugmentationHelper.setValue(maximum, "strength", Number.MAX_SAFE_INTEGER);
    assert.equal(maximum.system.attributes.strength.total, Number.MAX_SAFE_INTEGER);

    const unsafe = new FakeActor({ id: "unsafe-total" });
    const before = unsafe.toObject();
    await assert.rejects(AttributeAugmentationHelper.setValue(unsafe, "strength", Number.MAX_SAFE_INTEGER),
        error => error.code === "TOTALS_INVALID");
    assert.deepEqual(unsafe.toObject(), before);
    assert.deepEqual(unsafe.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("actor persistence failure is surfaced and a later no-op retries totals", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.ensure(actor);
    actor.failActorUpdate = true;
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, "dexterity", 2), error =>
        error.code === "TOTALS_PERSISTENCE_FAILED" && error.itemsApplied === true);
    assert.equal(actor.system.attributes.dexterity.total, 5);
    assert.equal(AttributeAugmentationHelper.read(actor).attributes.dexterity.effectiveValue, 2);
    actor.failActorUpdate = false;
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.system.attributes.dexterity.total, 7);
    assert.equal(actor.system.initiative.total, 9);
});

test("relative increment reports partial persistence and recalculation does not increment again", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength"), makeItem("dexterity"), makeItem("stamina")] });
    actor.failActorUpdate = true;
    await assert.rejects(AttributeAugmentationHelper.changeValue(actor, "strength", 1), error =>
        error.code === "TOTALS_PERSISTENCE_FAILED" && error.itemsApplied === true);
    assert.equal(actor.items.find(item => item._id === "item-strength").system.value, 1);
    assert.equal(actor.system.attributes.strength.total, 3);
    actor.failActorUpdate = false;
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.items.find(item => item._id === "item-strength").system.value, 1);
    assert.equal(actor.system.attributes.strength.total, 4);
});

test("Actor totals failure after no Item write reports itemsApplied false", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength"), makeItem("dexterity"), makeItem("stamina")] });
    actor.system.attributes.strength.total = -1;
    actor.failActorUpdate = true;
    await assert.rejects(AttributeAugmentationHelper.ensure(actor), error =>
        error.code === "TOTALS_PERSISTENCE_FAILED" && error.itemsApplied === false);
    assert.equal(actor.calls.create, 0);
    assert.equal(actor.calls.updateItems, 0);
});

test("Item persistence failure stays distinct and reports uncertain application", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength"), makeItem("dexterity"), makeItem("stamina")] });
    actor.updateEmbeddedDocuments = async () => { throw new Error("Item update failed"); };
    await assert.rejects(AttributeAugmentationHelper.changeValue(actor, "strength", 1), error =>
        error.code === "PERSISTENCE_FAILED" && error.itemsApplied === null);
    assert.equal(actor.system.attributes.strength.total, 3);
});

test("verified creation followed by a failed Item update reports itemsApplied true", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength")] });
    actor.updateEmbeddedDocuments = async () => { throw new Error("Item update failed"); };
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, "strength", 2), error =>
        error.code === "PERSISTENCE_FAILED" && error.itemsApplied === true);
    assert.equal(actor.calls.create, 1);
    assert.equal(actor.items.filter(item => item.flags?.worldofdarkness?.attributeAugmentation).length, 3);
    assert.equal(actor.items.find(item => item._id === "item-strength").system.value, 0);
    assert.equal(actor.system.attributes.strength.total, 3);
});

test("ensure repairs stale totals after an external bonus edit without an item write", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    const item = actor.items.find(candidate => candidate.flags?.worldofdarkness?.attributeAugmentation === "dexterity");
    item.system.value = 4;
    actor.calls = { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 };
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.system.attributes.dexterity.total, 9);
    assert.equal(actor.system.initiative.total, 11);
    assert.equal(actor.calls.updateItems, 0);
    assert.equal(actor.calls.updateActor, 1);
});

test("same-value set repairs stale totals after an external bonus edit", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    const item = actor.items.find(candidate => candidate.flags?.worldofdarkness?.attributeAugmentation === "dexterity");
    item.system.value = 4;
    actor.calls = { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 };
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 4);
    assert.equal(actor.system.attributes.dexterity.total, 9);
    assert.equal(actor.system.initiative.total, 11);
    assert.equal(actor.calls.updateItems, 0);
    assert.equal(actor.calls.updateActor, 1);
});

test("ensure with current totals performs no persistent writes", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    actor.calls = { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 };
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.system.attributes.dexterity.total, 7);
    assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("no-item-write changeValue and reset still repair stale actor totals", async () => {
    const AttributeAugmentationHelper = await helper();
    for (const operation of [
        actor => AttributeAugmentationHelper.changeValue(actor, "dexterity", 0),
        actor => AttributeAugmentationHelper.reset(actor)
    ]) {
        const actor = new FakeActor();
        await AttributeAugmentationHelper.ensure(actor);
        actor.system.attributes.dexterity.total = 99;
        actor.system.initiative.total = 101;
        actor.calls = { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 };
        await operation(actor);
        assert.equal(actor.system.attributes.dexterity.total, 5);
        assert.equal(actor.system.initiative.total, 7);
        assert.equal(actor.calls.updateItems, 0);
        assert.equal(actor.calls.updateActor, 1);
    }
});

test("read reports malformed and duplicate items without claiming repair", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength", 0, false, { _id: "a", system: { parentid: "wrong" } }),
        makeItem("strength", 0, false, { _id: "b" })
    ] });
    const state = AttributeAugmentationHelper.read(actor);
    assert.ok(state.conflicts.some(conflict => conflict.code === "UNSAFE_MANAGED_ITEM"));
    assert.ok(state.conflicts.some(conflict => conflict.code === "BLOCKING_DUPLICATE"));
    assert.equal(actor.items.length, 3);
    await assert.rejects(AttributeAugmentationHelper.ensure(actor), error => error.code === "CONFLICT");
    assert.equal(actor.calls.updateItems, 0);
    assert.equal(actor.calls.delete, 0);
});

test("read preserves the raw invalid stored value while reporting zero effective value", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", null, true)] });
    const state = AttributeAugmentationHelper.read(actor);
    assert.equal(state.attributes.strength.storedValue, null);
    assert.equal(state.attributes.strength.effectiveValue, 0);
    assert.equal(actor.items[0].system.value, null);
});

test("narrow actor persistence preserves an unrelated concurrent edit", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    actor.system.bio = { note: "before" };
    actor.concurrentBioChange = true;
    await AttributeAugmentationHelper.setValue(actor, "dexterity", 2);
    assert.equal(actor.system.bio.note, "concurrent edit");
    assert.equal(actor.system.attributes.dexterity.total, 7);
});

test("value and active state are submitted together on each effective change", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength", 2, false), makeItem("dexterity"), makeItem("stamina")
    ] });
    const original = actor.updateEmbeddedDocuments.bind(actor);
    const payloads = [];
    actor.updateEmbeddedDocuments = async (type, updates) => {
        payloads.push(...copy(updates));
        return original(type, updates);
    };
    await AttributeAugmentationHelper.setValue(actor, "strength", 2);
    await AttributeAugmentationHelper.setValue(actor, "strength", 3);
    await AttributeAugmentationHelper.setValue(actor, "strength", 0);
    assert.equal(payloads.length, 3);
    for (const payload of payloads) {
        assert.ok(Object.hasOwn(payload, "system.value"));
        assert.ok(Object.hasOwn(payload, "system.isactive"));
    }
});

test("cancelled Item and Actor writes report explicit retryable failures", async () => {
    const AttributeAugmentationHelper = await helper();
    const noCreate = new FakeActor({ id: "no-create" });
    noCreate.createEmbeddedDocuments = async () => [];
    await assert.rejects(AttributeAugmentationHelper.ensure(noCreate), error => error.code === "NOT_APPLIED");
    assert.equal(noCreate.items.length, 1);

    const noItemUpdate = new FakeActor({ id: "no-item-update" });
    await AttributeAugmentationHelper.ensure(noItemUpdate);
    noItemUpdate.updateEmbeddedDocuments = async () => [];
    await assert.rejects(AttributeAugmentationHelper.setValue(noItemUpdate, "dexterity", 2),
        error => error.code === "NOT_APPLIED");
    assert.equal(noItemUpdate.system.attributes.dexterity.total, 5);

    const noActorUpdate = new FakeActor({ id: "no-actor-update" });
    await AttributeAugmentationHelper.ensure(noActorUpdate);
    noActorUpdate.update = async () => noActorUpdate;
    await assert.rejects(AttributeAugmentationHelper.setValue(noActorUpdate, "dexterity", 2),
        error => error.code === "TOTALS_NOT_APPLIED");
    assert.equal(AttributeAugmentationHelper.read(noActorUpdate).attributes.dexterity.effectiveValue, 2);
    assert.equal(noActorUpdate.system.attributes.dexterity.total, 5);
});

test("a managed item retargeted during creation is not overwritten", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [makeItem("strength", 1, true)] });
    const create = actor.createEmbeddedDocuments.bind(actor);
    actor.createEmbeddedDocuments = async (type, documents) => {
        const result = await create(type, documents);
        actor.items.find(item => item._id === "item-strength").system.type = "initiative_buff";
        return result;
    };
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, "strength", 2), error =>
        error.code === "CONCURRENT_MODIFICATION");
    const retargeted = actor.items.find(item => item._id === "item-strength");
    assert.equal(retargeted.system.type, "initiative_buff");
    assert.equal(retargeted.system.value, 1);
    assert.equal(actor.calls.updateItems, 0);
});

test("eligibility lost during projection blocks an increase before item writes", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength"), makeItem("dexterity"), makeItem("stamina")
    ] });
    const original = actor.toObject.bind(actor);
    let changed = false;
    actor.toObject = () => {
        const snapshot = original();
        if (!changed) {
            changed = true;
            actor.items.find(item => item.type === "Advantage").system.settings.isvisible = false;
        }
        return snapshot;
    };
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, "strength", 2),
        error => error.code === "BLOODPOOL_HIDDEN");
    assert.equal(actor.calls.create, 0);
    assert.equal(actor.calls.updateItems, 0);
    assert.equal(actor.calls.updateActor, 0);
    assert.equal(actor.items.find(item => item._id === "item-strength").system.value, 0);
});

test("set and change reject a missing attribute without creating items", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor();
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, undefined, 2),
        error => error.code === "INVALID_ATTRIBUTE");
    await assert.rejects(AttributeAugmentationHelper.changeValue(actor, undefined, 2),
        error => error.code === "INVALID_ATTRIBUTE");
    assert.deepEqual(actor.calls, { create: 0, updateItems: 0, delete: 0, updateActor: 0, render: 0 });
});

test("a concurrent calculated source edit is reported and later recalculated", async () => {
    const AttributeAugmentationHelper = await helper();
    const actor = new FakeActor({ items: [
        makeItem("strength"), makeItem("dexterity"), makeItem("stamina")
    ] });
    const original = actor.update.bind(actor);
    let changed = false;
    actor.update = async updates => {
        if (!changed) {
            changed = true;
            actor.system.attributes.strength.value = 8;
        }
        return original(updates);
    };
    await assert.rejects(AttributeAugmentationHelper.setValue(actor, "strength", 2),
        error => error.code === "CONCURRENT_MODIFICATION");
    assert.equal(actor.items.find(item => item._id === "item-strength").system.value, 2);
    assert.equal(actor.system.attributes.strength.total, 5);
    await AttributeAugmentationHelper.ensure(actor);
    assert.equal(actor.system.attributes.strength.total, 10);
});
