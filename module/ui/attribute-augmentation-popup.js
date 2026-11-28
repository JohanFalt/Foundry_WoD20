import AttributeAugmentationHelper from "../scripts/attribute-augmentation-helpers.js";

const ATTRIBUTES = ["strength", "dexterity", "stamina"];
const openPopups = new Map();
function refreshActorPopup(actor) {
    const popup = openPopups.get(actor?.uuid);
    if (popup?.rendered && !popup.pending) return popup.render();
}
Hooks.on("updateActor", refreshActorPopup);
for (const event of ["createItem", "updateItem", "deleteItem"]) {
    Hooks.on(event, item => refreshActorPopup(item.parent));
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const KEY = "wod.attributeaugmentation.";
const t = (key, data) => data ? game.i18n.format(KEY + key, data) : game.i18n.localize(KEY + key);
const labelOf = attribute => game.i18n.localize(`wod.attributes.${attribute}`);

const UNAVAILABLE_CODES = ["NOT_PC", "NOT_OWNER", "NO_BLOODPOOL", "BLOODPOOL_HIDDEN", "VARIANT_EXCLUDED"];

function describeError(error) {
    const code = error?.code ?? "UNKNOWN_ERROR";
    const itemsApplied = Object.hasOwn(error ?? {}, "itemsApplied") ? error.itemsApplied : undefined;
    let message;
    switch (code) {
        case "CONFLICT":
            message = t("error.conflict");
            break;
        case "TOTALS_PERSISTENCE_FAILED":
        case "TOTALS_NOT_APPLIED":
            message = t("error.totalsnotsaved");
            break;
        case "CONCURRENT_MODIFICATION":
            message = t("error.concurrent");
            break;
        case "TOTALS_INVALID":
            message = t("error.totalsinvalid");
            break;
        default:
            message = UNAVAILABLE_CODES.includes(code) ? t("error.unavailable") : t("error.default");
    }
    if (itemsApplied === true) message += " " + t("error.applied");
    else if (itemsApplied === null) message += " " + t("error.uncertain");
    else if (itemsApplied === false) message += " " + t("error.notattempted");
    return { code, message, itemsApplied };
}

// Same priority as the PC sheet (getSplat): variantsheet -> splat -> game -> mortal.
export function augmentationSplat(actor) {
    const settings = actor?.system?.settings;
    const splat = String(settings?.variantsheet || settings?.splat || settings?.game || "mortal").toLowerCase();
    return splat === "changingbreed" ? "werewolf" : splat;
}

export function augmentationAccess(actor) {
    if (actor?.type !== "PC" || actor.isOwner !== true) {
        return { showIcon: false, canIncrease: false };
    }
    const items = [...(actor.items ?? [])];
    const hasBloodPool = actor.system?.settings?.variant !== "earthbound" && items.some(item =>
        item.type === "Advantage" && item.system?.id === "bloodpool" && item.system?.settings?.isvisible === true
    );
    const hasManagedItems = items.some(item =>
        typeof item.flags?.worldofdarkness?.attributeAugmentation === "string" &&
        ATTRIBUTES.includes(item.flags.worldofdarkness.attributeAugmentation)
    );
    return { showIcon: hasBloodPool || hasManagedItems, canIncrease: hasBloodPool };
}

export class AttributeAugmentationPopup extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, { helper = AttributeAugmentationHelper } = {}) {
        super({ id: `attribute-augmentation-${actor.id}` });
        this.actor = actor;
        this.helper = helper;
        this.pending = false;
        this.error = null;
        this.addEventListener("close", () => {
            if (openPopups.get(actor.uuid) === this) openPopups.delete(actor.uuid);
        }, { once: true });
    }

    static DEFAULT_OPTIONS = {
        id: "attribute-augmentation-{id}",
        classes: ["wod20", "wod-dialog", "attribute-augmentation-popup"],
        window: { title: "wod.attributeaugmentation.title", resizable: false },
        position: { width: 420, height: "auto" },
        actions: {
            close: function(event) {
                event?.preventDefault?.();
                return this.close();
            },
            adjust: function(event, target) {
                event?.preventDefault?.();
                return this.adjust(target.dataset.attribute, Number(target.dataset.delta));
            },
            resetAll: function(event) {
                event?.preventDefault?.();
                return this.resetAll();
            }
        }
    };

    static PARTS = {
        body: { template: "systems/worldofdarkness/templates/dialogs/attribute-augmentation-popup.hbs" }
    };

    async _prepareContext() {
        const context = await super._prepareContext();
        let state;
        let readError = null;
        try {
            state = this.helper.read(this.actor);
        } catch (error) {
            readError = describeError(error);
        }
        const access = augmentationAccess(this.actor);
        const conflicts = state?.conflicts ?? [];
        const blocked = this.pending || !access.showIcon || !!readError || conflicts.length > 0;
        const rows = ATTRIBUTES.map(attribute => {
            const managed = state?.attributes?.[attribute];
            const effectiveValue = managed?.effectiveValue ?? 0;
            const storedValue = managed?.storedValue ?? 0;
            return {
                attribute,
                label: labelOf(attribute),
                bonusLabel: managed ? (effectiveValue > 0 ? `+${effectiveValue}` : "0") : "—",
                storedLabel: managed && !managed.isactive && storedValue > 0 ? t("stored", { value: storedValue }) : "",
                total: this.actor.system?.attributes?.[attribute]?.total ?? null,
                totalLabel: this.actor.system?.attributes?.[attribute]?.total ?? "—",
                totalText: t("total", { total: this.actor.system?.attributes?.[attribute]?.total ?? "—" }),
                increaseDisabled: blocked || !access.canIncrease,
                decreaseDisabled: blocked || effectiveValue <= 0
            };
        });
        const notice = conflicts.length ? t("notice.conflict") :
            !access.canIncrease && access.showIcon ? t("notice.nobloodpool") : "";
        return {
            ...context,
            description: t("description"),
            rows,
            pending: this.pending,
            resetDisabled: blocked,
            notice,
            error: this.error ?? readError
        };
    }

    _onRender(context, options) {
        super._onRender(context, options);

        // Apply the same splat/font classes as the PC sheet so fonts and colours match.
        const classList = this.element.classList;
        const splat = augmentationSplat(this.actor);
        classList.add(splat);
        classList.add(splat + "Dialog");
        if ((game.settings.get("worldofdarkness", "useSplatFonts") === false) ||
            (this.actor.system?.settings?.usesplatfont === false)) {
            classList.add("noSplatFont");
        }
    }

    async adjust(attribute, delta) {
        if (this.pending || !ATTRIBUTES.includes(attribute) || (delta !== 1 && delta !== -1)) return;
        return this.#runOperation(async () => {
            const state = await this.helper.read(this.actor);
            const access = augmentationAccess(this.actor);
            if (!access.showIcon || state.conflicts.length) return false;
            if (delta > 0 && !access.canIncrease) return false;
            if (delta < 0 && state.attributes[attribute].effectiveValue <= 0) return false;
            await this.helper.changeValue(this.actor, attribute, delta);
            return true;
        });
    }

    async resetAll() {
        if (this.pending || !augmentationAccess(this.actor).showIcon) return;
        return this.#runOperation(async () => {
            const state = await this.helper.read(this.actor);
            if (state.conflicts.length || !augmentationAccess(this.actor).showIcon) return false;
            await this.helper.reset(this.actor);
            return true;
        });
    }

    async #runOperation(operation) {
        this.pending = true;
        try {
            await this.render();
            if (await operation()) this.error = null;
        } catch (error) {
            this.error = describeError(error);
        } finally {
            this.pending = false;
            // _prepareContext performs a fresh read of Actor totals and managed Items.
            if (this.rendered) await this.render();
        }
    }
}

export async function openAttributeAugmentation(actor, options = {}) {
    if (!augmentationAccess(actor).showIcon) return null;
    let popup = openPopups.get(actor.uuid);
    if (!popup) {
        popup = new AttributeAugmentationPopup(actor, options);
        openPopups.set(actor.uuid, popup);
    } else if (!popup.pending) popup.actor = actor;
    await popup.render({ force: true });
    return popup;
}

export async function openAttributeAugmentationFromSheet(event) {
    event?.preventDefault?.();
    return openAttributeAugmentation(this.actor);
}
