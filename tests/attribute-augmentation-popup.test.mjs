import test from "node:test";
import assert from "node:assert/strict";
class FakeApplicationV2 {
    constructor(options = {}) {
        this.options = options;
        this.listeners = new Map();
        this.renderCount = 0;
        this.rendered = false;
    }

    async _prepareContext() { return {}; }

    _onRender() {}

    async render({ force = false } = {}) {
        if (!this.rendered && !force) return this;
        this.rendered = true;
        this.renderCount++;
        this.lastContext = await this._prepareContext();
        return this;
    }

    addEventListener(name, listener) { this.listeners.set(name, listener); }

    async close() {
        this.rendered = false;
        this.listeners.get("close")?.();
        return this;
    }
}

globalThis.FormApplication = class {};
const hooks = new Map();
globalThis.Hooks = { on(name, listener) { hooks.set(name, listener); } };
globalThis.foundry = {
    applications: { api: {
        ApplicationV2: FakeApplicationV2,
        HandlebarsApplicationMixin: Base => Base
    } }
};
// Tests use the i18n keys as text.
globalThis.game = {
    user: { isGM: false },
    i18n: { localize: key => key, format: key => key },
    settings: { get: () => true }
};

const popupModule = async () => import("../module/ui/attribute-augmentation-popup.js");

test("other clients' document hooks refresh only the open popup for that Actor", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("remote", { items: [managedItem("strength", 3, true)] });
    const popup = await openAttributeAugmentation(source);
    assert.equal(popup.lastContext.rows[0].bonusLabel, "+3");
    const renders = popup.renderCount;
    await hooks.get("updateItem")({ parent: actor("unrelated") });
    assert.equal(popup.renderCount, renders);
    source.items[0].system.value = 0;
    await hooks.get("updateItem")({ parent: source });
    assert.equal(popup.lastContext.rows[0].bonusLabel, "0");
    source.system.attributes.strength.total = 4;
    await hooks.get("updateActor")(source);
    assert.equal(popup.lastContext.rows[0].total, 4);
    await popup.close();
    const closedCount = popup.renderCount;
    await hooks.get("createItem")({ parent: source });
    await hooks.get("deleteItem")({ parent: source });
    assert.equal(popup.renderCount, closedCount);
});

test("a pending write finishes without reopening a closed popup", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("closed-during-write");
    let finish;
    let started;
    const gate = new Promise(resolve => { finish = resolve; });
    const writing = new Promise(resolve => { started = resolve; });
    const helper = { read: () => observed(), changeValue: () => { started(); return gate; } };
    const popup = await openAttributeAugmentation(source, { helper });
    const action = popup.adjust("strength", 1);
    await writing;
    await popup.close();
    const next = await openAttributeAugmentation(source, { helper });
    finish();
    await action;
    assert.equal(popup.rendered, false);
    assert.equal(next.rendered, true);
    await next.close();
});

function actor(id = "test-actor", options = {}) {
    const items = options.items ?? [{
        _id: "blood-pool",
        type: "Advantage",
        system: { id: "bloodpool", settings: { isvisible: true } }
    }];
    let writes = 0;
    return {
        id, uuid: `Actor.${id}`, name: id, type: options.type ?? "PC",
        isOwner: options.isOwner ?? true, items,
        system: {
            settings: { variant: options.variant ?? "vampire" },
            attributes: {
                strength: { total: 3 }, dexterity: { total: 7 }, stamina: { total: 4 }
            }
        },
        get writes() { return writes; },
        createEmbeddedDocuments: async () => { writes++; },
        updateEmbeddedDocuments: async () => { writes++; },
        update: async () => { writes++; }
    };
}

test("opening the sheet Actor popup reads all three totals without persistent writes", async () => {
    const { openAttributeAugmentationFromSheet } = await popupModule();
    const source = actor();
    const before = structuredClone({ system: source.system, items: source.items });
    const popup = await openAttributeAugmentationFromSheet.call({ actor: source }, { preventDefault() {} });
    assert.equal(popup.actor, source);
    assert.deepEqual(popup.lastContext.rows.map(row => row.total), [3, 7, 4]);
    assert.deepEqual(popup.lastContext.rows.map(row => row.bonusLabel), ["0", "0", "0"]);
    assert.equal(source.writes, 0);
    assert.deepEqual({ system: source.system, items: source.items }, before);
    await popup.close();
});

function managedItem(attribute, value = 0, isactive = false) {
    return {
        _id: `managed-${attribute}`, type: "Bonus",
        flags: { worldofdarkness: { attributeAugmentation: attribute } },
        system: {
            type: "attribute_buff", settingtype: attribute, parentid: "", bonuslist: [],
            isremovable: false, version: "7.4.0", value, isactive
        }
    };
}

function observed(values = {}) {
    return {
        attributes: Object.fromEntries(["strength", "dexterity", "stamina"].map(attribute => {
            const value = values[attribute] ?? 0;
            return [attribute, { storedValue: value, effectiveValue: value, isactive: value > 0 }];
        })),
        missing: [], conflicts: [], warnings: []
    };
}

function adjustAction(popup, attribute, delta) {
    return popup.constructor.DEFAULT_OPTIONS.actions.adjust.call(
        popup, { preventDefault() {} }, { dataset: { attribute, delta: String(delta) } }
    );
}

function resetAction(popup) {
    return popup.constructor.DEFAULT_OPTIONS.actions.resetAll.call(popup, { preventDefault() {} });
}

test("visibility requires an owning PC and supports cleanup after Blood Pool loss", async () => {
    const { augmentationAccess } = await popupModule();
    assert.deepEqual(augmentationAccess(actor()), { showIcon: true, canIncrease: true });
    assert.equal(augmentationAccess(actor("other", { isOwner: false })).showIcon, false);
    assert.equal(augmentationAccess(actor("other", { type: "NPC" })).showIcon, false);
    const cleanup = actor("cleanup", { items: [managedItem("strength", 2, true)] });
    assert.deepEqual(augmentationAccess(cleanup), { showIcon: true, canIncrease: false });
    assert.equal(augmentationAccess(actor("empty", { items: [] })).showIcon, false);
    assert.equal(augmentationAccess(actor("earthbound", { variant: "earthbound" })).showIcon, false);
});

test("one click increases or decreases the sheet Actor immediately and keeps the popup open", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("changes");
    let snapshot = observed();
    const calls = [];
    const helper = {
        read: target => { assert.equal(target, source); return structuredClone(snapshot); },
        changeValue: async (target, attribute, delta) => {
            assert.equal(target, source);
            calls.push([attribute, delta]);
            snapshot = observed({ dexterity: snapshot.attributes.dexterity.effectiveValue + delta });
            source.system.attributes.dexterity.total = 7 + snapshot.attributes.dexterity.effectiveValue;
        }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    await popup.adjust("dexterity", 1);
    assert.deepEqual(calls, [["dexterity", 1]]);
    assert.equal(popup.lastContext.rows[1].bonusLabel, "+1");
    assert.equal(popup.lastContext.rows[1].total, 8);
    await popup.adjust("dexterity", -1);
    assert.deepEqual(calls, [["dexterity", 1], ["dexterity", -1]]);
    assert.equal(popup.lastContext.rows[1].bonusLabel, "0");
    assert.equal(popup.lastContext.rows[1].total, 7);
    assert.equal(popup.closed, undefined);
    await popup.close();
});

test("reset clears the observed managed values through the controller", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("reset", { items: [managedItem("strength", 2, true)] });
    let snapshot = observed({ strength: 2 });
    let resets = 0;
    const helper = {
        read: target => structuredClone(snapshot),
        reset: async target => {
            assert.equal(target, source);
            resets++;
            snapshot = observed();
            source.system.attributes.strength.total = 3;
        }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    await popup.resetAll();
    assert.equal(resets, 1);
    assert.equal(popup.lastContext.rows[0].bonusLabel, "0");
    assert.equal(popup.lastContext.rows[0].total, 3);
    await popup.close();
});

test("reset remains available to recalculate stale totals when managed values are zero", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("stale-zero", { items: [managedItem("strength")] });
    source.system.attributes.strength.total = 5;
    let resets = 0;
    const helper = {
        read: () => observed(),
        reset: async () => { resets++; source.system.attributes.strength.total = 3; }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    assert.equal(popup.lastContext.resetDisabled, false);
    await popup.resetAll();
    assert.equal(resets, 1);
    assert.equal(popup.lastContext.rows[0].total, 3);
    await popup.close();
});

test("all mutation controls are disabled while a write is pending", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("pending");
    let finish;
    const gate = new Promise(resolve => { finish = resolve; });
    let calls = 0;
    const helper = {
        read: () => observed({ strength: calls > 0 ? 1 : 0 }),
        changeValue: async () => { calls++; await gate; }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    const operation = popup.adjust("strength", 1);
    await new Promise(resolve => setImmediate(resolve));
    const during = popup.lastContext;
    assert.equal(during.pending, true);
    assert.equal(during.resetDisabled, true);
    assert.ok(during.rows.every(row => row.increaseDisabled && row.decreaseDisabled));
    await popup.adjust("strength", 1);
    assert.equal(calls, 1);
    finish();
    await operation;
    assert.equal(popup.lastContext.pending, false);
    await popup.close();
});

test("rapid action clicks share one lock across delayed read, increase, decrease, and Reset", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("rapid-read");
    let snapshot = observed({ strength: 1 });
    let holdRead = false;
    let releaseRead;
    const readGate = new Promise(resolve => { releaseRead = resolve; });
    let releaseWrite;
    const writeGate = new Promise(resolve => { releaseWrite = resolve; });
    let holdWrite = true;
    let active = 0;
    let peak = 0;
    let resets = 0;
    const changes = [];
    const helper = {
        read: () => holdRead ? readGate : structuredClone(snapshot),
        changeValue: async (_actor, _attribute, delta) => {
            changes.push(delta);
            active++;
            peak = Math.max(peak, active);
            if (holdWrite) await writeGate;
            snapshot = observed({ strength: snapshot.attributes.strength.effectiveValue + delta });
            active--;
        },
        reset: async () => { resets++; }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    holdRead = true;
    const first = adjustAction(popup, "strength", 1);
    const lockedImmediately = popup.pending;
    const second = adjustAction(popup, "strength", 1);
    const decrease = adjustAction(popup, "strength", -1);
    const reset = resetAction(popup);
    await new Promise(resolve => setImmediate(resolve));
    const duringRead = popup.lastContext;
    holdRead = false;
    releaseRead(structuredClone(snapshot));
    await new Promise(resolve => setImmediate(resolve));
    holdWrite = false;
    releaseWrite();
    await Promise.all([first, second, decrease, reset]);
    assert.equal(lockedImmediately, true);
    assert.equal(duringRead.pending, true);
    assert.equal(duringRead.resetDisabled, true);
    assert.ok(duringRead.rows.every(row => row.increaseDisabled && row.decreaseDisabled));
    assert.deepEqual(changes, [1]);
    assert.equal(peak, 1);
    assert.equal(resets, 0);
    assert.equal(popup.lastContext.pending, false);
    assert.equal(popup.lastContext.rows[0].increaseDisabled, false);
    assert.equal(popup.lastContext.rows[0].decreaseDisabled, false);
    assert.equal(popup.lastContext.resetDisabled, false);
    await adjustAction(popup, "strength", 1);
    assert.deepEqual(changes, [1, 1]);
    await popup.close();
});

test("a rejected delayed read releases the shared action lock without writing", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("rejected-read");
    let holdRead = false;
    let rejectRead;
    const readGate = new Promise((_resolve, reject) => { rejectRead = reject; });
    let changes = 0;
    let resets = 0;
    const helper = {
        read: () => holdRead ? readGate : observed({ strength: 1 }),
        changeValue: async () => { changes++; },
        reset: async () => { resets++; }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    holdRead = true;
    const first = adjustAction(popup, "strength", 1);
    const lockedImmediately = popup.pending;
    const second = adjustAction(popup, "strength", 1);
    const reset = resetAction(popup);
    await new Promise(resolve => setImmediate(resolve));
    holdRead = false;
    rejectRead(Object.assign(new Error("Read failed"), { code: "CONFLICT" }));
    await Promise.all([first, second, reset]);
    assert.equal(lockedImmediately, true);
    assert.equal(changes, 0);
    assert.equal(resets, 0);
    assert.equal(popup.pending, false);
    assert.equal(popup.lastContext.error.code, "CONFLICT");
    assert.equal(popup.lastContext.rows[0].increaseDisabled, false);
    await adjustAction(popup, "strength", 1);
    assert.equal(changes, 1);
    await popup.close();
});

test("failed persistence releases the lock and displays observed values without retry", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("failed-persistence");
    let snapshot = observed({ strength: 1 });
    let releaseWrite;
    const writeGate = new Promise(resolve => { releaseWrite = resolve; });
    let changes = 0;
    let resets = 0;
    const helper = {
        read: () => structuredClone(snapshot),
        changeValue: async () => {
            changes++;
            await writeGate;
            snapshot = observed({ strength: 2 });
            throw Object.assign(new Error("Totals failed"), {
                code: "TOTALS_PERSISTENCE_FAILED", itemsApplied: true
            });
        },
        reset: async () => { resets++; }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    const first = adjustAction(popup, "strength", 1);
    const lockedImmediately = popup.pending;
    const second = adjustAction(popup, "strength", 1);
    const decrease = adjustAction(popup, "strength", -1);
    const reset = resetAction(popup);
    await new Promise(resolve => setImmediate(resolve));
    releaseWrite();
    await Promise.all([first, second, decrease, reset]);
    assert.equal(lockedImmediately, true);
    assert.equal(changes, 1);
    assert.equal(resets, 0);
    assert.equal(popup.pending, false);
    assert.equal(popup.lastContext.rows[0].bonusLabel, "+2");
    assert.equal(popup.lastContext.error.itemsApplied, true);
    assert.equal(popup.lastContext.rows[0].increaseDisabled, false);
    await popup.close();
});

test("partial persistence error rereads observed items and totals without retrying", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("partial");
    let snapshot = observed();
    let reads = 0;
    let changes = 0;
    const helper = {
        read: () => { reads++; return structuredClone(snapshot); },
        changeValue: async () => {
            changes++;
            snapshot = observed({ strength: 1 });
            throw Object.assign(new Error("Actor totals update failed"), {
                code: "TOTALS_PERSISTENCE_FAILED", itemsApplied: true
            });
        }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    await popup.adjust("strength", 1);
    assert.equal(changes, 1);
    assert.ok(reads >= 2);
    assert.equal(popup.lastContext.rows[0].bonusLabel, "+1");
    assert.equal(popup.lastContext.rows[0].total, 3);
    assert.equal(popup.lastContext.error.itemsApplied, true);
    assert.match(popup.lastContext.error.message, /totalsnotsaved/);
    await popup.close();
});

test("errors distinguish uncertain, absent, and applied Item writes", async () => {
    const { openAttributeAugmentation } = await popupModule();
    for (const [id, code, itemsApplied, expected] of [
        ["uncertain", "PERSISTENCE_FAILED", null, /error\.uncertain/],
        ["no-item-write", "TOTALS_PERSISTENCE_FAILED", false, /error\.notattempted/],
        ["applied", "TOTALS_PERSISTENCE_FAILED", true, /error\.applied/]
    ]) {
        const source = actor(id);
        const helper = {
            read: () => observed(),
            changeValue: async () => {
                throw Object.assign(new Error("write failed"), { code, itemsApplied });
            }
        };
        const popup = await openAttributeAugmentation(source, { helper });
        await popup.adjust("strength", 1);
        assert.equal(popup.lastContext.error.itemsApplied, itemsApplied);
        assert.match(popup.lastContext.error.message, expected);
        await popup.close();
    }
});

test("conflicting marked items explain the block without changing data", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("conflict", { items: [managedItem("strength", 2, true)] });
    const state = observed({ strength: 2 });
    state.conflicts = [{ code: "BLOCKING_DUPLICATE", attribute: "strength" }];
    let changes = 0;
    const helper = { read: () => state, changeValue: async () => { changes++; } };
    const popup = await openAttributeAugmentation(source, { helper });
    assert.match(popup.lastContext.notice, /notice\.conflict/);
    assert.equal(popup.lastContext.resetDisabled, true);
    assert.ok(popup.lastContext.rows.every(row => row.increaseDisabled && row.decreaseDisabled));
    await popup.adjust("strength", 1);
    assert.equal(changes, 0);
    await popup.close();
});

test("a failed action read shows an error and does not start a write", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("read-error");
    let reads = 0;
    let changes = 0;
    const helper = {
        read: () => {
            // The pending render and the action each inspect the Actor.
            if ([2, 3].includes(++reads)) {
                throw Object.assign(new Error("Cannot inspect managed items"), { code: "CONFLICT" });
            }
            return observed();
        },
        changeValue: async () => { changes++; }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    await popup.adjust("strength", 1);
    assert.equal(changes, 0);
    assert.equal(popup.lastContext.error.code, "CONFLICT");
    await popup.close();
});

test("lost eligibility disables increase but permits decrease and reset for an owner", async () => {
    const { openAttributeAugmentation } = await popupModule();
    game.user.isGM = false;
    const source = actor("lost-pool", { items: [managedItem("strength", 2, true)] });
    let snapshot = observed({ strength: 2 });
    let increases = 0;
    let decreases = 0;
    let resets = 0;
    const helper = {
        read: () => structuredClone(snapshot),
        changeValue: async (_actor, _attribute, delta) => {
            if (delta > 0) increases++;
            else { decreases++; snapshot = observed({ strength: 1 }); }
        },
        reset: async () => { resets++; snapshot = observed(); }
    };
    const popup = await openAttributeAugmentation(source, { helper });
    assert.equal(popup.lastContext.rows[0].increaseDisabled, true);
    assert.equal(popup.lastContext.rows[0].decreaseDisabled, false);
    assert.equal(popup.lastContext.resetDisabled, false);
    await popup.adjust("strength", 1);
    await popup.adjust("strength", -1);
    await popup.resetAll();
    assert.deepEqual([increases, decreases, resets], [0, 1, 1]);
    await popup.close();
});

test("repeated icon activation reuses one popup and one action invocation", async () => {
    const { openAttributeAugmentation, AttributeAugmentationPopup } = await popupModule();
    const source = actor("single-popup");
    let changes = 0;
    const helper = {
        read: () => observed(),
        changeValue: async () => { changes++; }
    };
    const first = await openAttributeAugmentation(source, { helper });
    const second = await openAttributeAugmentation(source, { helper });
    assert.equal(first, second);
    await AttributeAugmentationPopup.DEFAULT_OPTIONS.actions.adjust.call(
        first, { preventDefault() {} }, { dataset: { attribute: "strength", delta: "1" } }
    );
    assert.equal(changes, 1);
    await first.close();
    const third = await openAttributeAugmentation(source, { helper });
    assert.notEqual(third, first);
    await third.close();
});

test("reopening a popup uses the current sheet Actor document for the same UUID", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const firstActor = actor("reopened");
    const newSheetActor = actor("reopened");
    newSheetActor.system.attributes.dexterity.total = 11;
    const helper = { read: () => observed() };
    const first = await openAttributeAugmentation(firstActor, { helper });
    const reopened = await openAttributeAugmentation(newSheetActor);
    assert.equal(reopened, first);
    assert.equal(reopened.actor, newSheetActor);
    assert.equal(reopened.lastContext.rows[1].total, 11);
    await reopened.close();
});

test("popup uses the same splat priority as the PC sheet", async () => {
    const { augmentationSplat } = await popupModule();
    const withSettings = settings => ({ system: { settings } });
    assert.equal(augmentationSplat(withSettings({ variantsheet: "Demon", splat: "mortal", game: "vampire" })), "demon");
    assert.equal(augmentationSplat(withSettings({ variantsheet: "", splat: "Hunter", game: "mortal" })), "hunter");
    assert.equal(augmentationSplat(withSettings({ game: "Vampire" })), "vampire");
    assert.equal(augmentationSplat(withSettings({ splat: "changingbreed" })), "werewolf");
    assert.equal(augmentationSplat(withSettings({})), "mortal");
});

test("rendering adds the splat class to the popup window", async () => {
    const { openAttributeAugmentation } = await popupModule();
    const source = actor("splat-class");
    source.system.settings.variantsheet = "demon";
    const popup = await openAttributeAugmentation(source);
    const classes = new Set();
    popup.element = { classList: { add: name => classes.add(name) } };
    popup._onRender({}, {});
    assert.ok(classes.has("demon"));
    assert.ok(!classes.has("noSplatFont"));
    await popup.close();
});
