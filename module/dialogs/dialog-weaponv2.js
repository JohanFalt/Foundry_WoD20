const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import CombatHelper from "../scripts/combat-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js";
import { DiceRoller } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

/**
 * Build view model from item and state. Defensive reads for item.system.attack, item.system.damage, item.system.mode.
 * When state is "damage" and attackResult is provided, extraSuccesses/numberoftargets/modename come from that
 * temporary object (no data written to item).
 * @param {Item} item - Weapon item (Melee Weapon or Ranged Weapon)
 * @param {"attack"|"damage"} state
 * @param {{ extraSuccesses: number, numberoftargets: number, modename: string }|null} [attackResult] - optional temp data from attack roll
 * @returns {Object} View model for template
 */
function buildViewModel(item, state, attackResult = null) {
    console.log("WoD DEBUG | buildViewModel called with state:", state, "and attackResult:", attackResult);

    const attack = item.system?.attack ?? {};
    const damage = item.system?.damage ?? {};
    const mode = item.system?.mode ?? {};
    const isRanged = item.type === "Ranged Weapon";

    if (state === "damage") {
        const damageType = damage.type ?? "";
        const extraSuccesses = attackResult != null ? (attackResult.extraSuccesses ?? 0) : 0;
        const numberoftargets = attackResult != null ? (attackResult.numberoftargets ?? 1) : 1;
        const modename = attackResult != null ? (attackResult.modename ?? "single") : "single";
        return {
            attributeValue: 0,
            attributeName: "",
            abilityValue: 0,
            abilityName: "",
            hasSpeciality: false,
            specialityText: "",
            name: item.name,
            weaponType: "Damage",
            _id: item._id,
            dice1: damage.attribute ?? "",
            dice2: "",
            bonus: parseInt(damage.bonus) || 0,
            dodgebonus: 0,
            accuracy: parseInt(damage.bonus) || 0,
            difficulty: 6,
            damageType,
            damageCode: damageType ? game.i18n.localize(CONFIG.worldofdarkness.damageTypes[damageType]) : "",
            hasburst: false,
            hasfullauto: false,
            hasspray: false,
            modename,
            numberoftargets,
            modebonus: 0,
            modedifficulty: 0,
            basedifficulty: 6,
            extraSuccesses,
            system: item.system?.description ?? "",
            canRoll: true,
            close: false,
            sheettype: "",
            useSpeciality: false,
            useWillpower: false
        };
    }

    // Attack state
    const difficulty = parseInt(item.system?.difficulty) ?? 6;
    const obj = {
        attributeValue: 0,
        attributeName: "",
        abilityValue: 0,
        abilityName: "",
        hasSpeciality: false,
        specialityText: "",
        _id: item._id,
        name: item.name,
        weaponType: isRanged ? "Ranged Weapon" : "Melee Weapon",
        dice1: attack.attribute ?? "",
        dice2: attack.ability ?? "",
        bonus: parseInt(attack.accuracy) || 0,
        dodgebonus: 0,
        difficulty,
        accuracy: parseInt(attack.accuracy) || 0,
        usedReducedDiff: false,
        hasburst: isRanged ? !!(mode.hasburst) : false,
        hasfullauto: isRanged ? !!(mode.hasfullauto) : false,
        hasspray: isRanged ? !!(mode.hasspray) : false,
        modename: "single",
        modebonus: 0,
        numberoftargets: 1,
        modedifficulty: 0,
        basedifficulty: difficulty,
        rollattack: !!attack.isrollable,
        rolldamage: !!damage.isrollable,
        system: item.system?.description ?? "",
        secondaryabilityid: (attack.ability === "custom" && attack.secondaryabilityid) ? attack.secondaryabilityid : "",
        canRoll: difficulty > -1,
        close: false,
        sheettype: "",
        useSpeciality: false,
        useWillpower: false
    };
    return obj;
}

export class DialogWeaponV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, item, state, attackResult = null) {
        super();
        this.actor = actor;
        this.item = item;
        this.weaponState = state;
        /** @type {{ extraSuccesses: number, numberoftargets: number, modename: string }|null} temporary data from attack roll, never saved to item */
        this.attackResult = attackResult;

        if (this.weaponState === "attack" && !(item.system?.attack?.isrollable)) {
            this.weaponState = "damage";
        }

        this.object = buildViewModel(this.item, this.weaponState, this.attackResult);
        this.options.window.title = this.actor.name;
    }

    static DEFAULT_OPTIONS = {
        id: "wod-weapon-dialog-v2",
        tag: "form",
        window: {
            title: "",
            resizable: true
        },
        classes: ["wod20", "wod-dialog", "weapon-dialog", "weapon-dialog-v2"],
        position: {
            width: 400,
            height: "auto"
        },
        actions: {
            setDifficulty: function (event, target) {
                const index = parseInt(target.value);
                if (Number.isNaN(index) || index < 0) return;
                this.object.difficulty = index + this.object.modedifficulty;
                this.object.canRoll = this.object.difficulty > -1;
                this._updateActiveButton(target, ".dialog-difficulty-button");
                this.render();
            },
            setNumberTargets: function (event, target) {
                const index = parseInt(target.value);
                if (Number.isNaN(index) || index < 0) return;
                this.object.numberoftargets = index;
                this._updateActiveButton(target, ".dialog-numbertargets-button");
                this.render();
            },
            setSecondaryAbility: async function (event, target) {
                const key = target.value;
                if (!key) return;
                const abilityItem = await this.actor.getEmbeddedDocument("Item", key);
                if (!abilityItem) return;
                this.object.abilityValue = parseInt(abilityItem.system.value);
                this.object.abilityName = abilityItem.system.label;
                this.object.secondaryabilityid = abilityItem._id;
                this._updateActiveButton(target, ".dialog-secondaryability-button");
                this.render();
            },
            setMode: function (event, target) {
                const key = target.value;
                this.object.modebonus = 0;
                this.object.modedifficulty = 0;
                if (!key) {
                    this._clearActive(".dialog-mode-button");
                    this.render();
                    return;
                }
                if (key === "single") {
                    this.object.modebonus = 0;
                    this.object.modedifficulty = 0;
                    this.object.numberoftargets = 1;
                } else if (key === "burst") {
                    this.object.modebonus = 3;
                    this.object.modedifficulty = 1;
                    this.object.numberoftargets = 1;
                } else if (key === "fullauto") {
                    this.object.modebonus = 10;
                    this.object.modedifficulty = 2;
                    this.object.numberoftargets = 1;
                } else if (key === "spray") {
                    this.object.modebonus = 10;
                    this.object.modedifficulty = 2;
                    this.object.numberoftargets = 1;
                }
                this.object.modename = key;
                this.object.difficulty = this.object.basedifficulty + this.object.modedifficulty;
                this.object.bonus = this.object.accuracy + this.object.modebonus;
                this._updateActiveButton(target, ".dialog-mode-button");
                this.render();
            },
            roll: async function (event, target) {
                this._readFormValues();
                if (this.object.close) {
                    this.close();
                    return;
                }
                this.object.canRoll = this.object.difficulty > -1;
                if (!this.object.canRoll) {
                    ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
                    return;
                }
                if (this.weaponState === "attack") {
                    await this._rollAttack();
                } else {
                    await this._rollDamage();
                }
            },
            close: function (event, target) {
                this.close();
            }
        }
    };

    static PARTS = {
        body: {
            template: "systems/worldofdarkness/templates/dialogs/dialog-weaponv2.hbs"
        }
    };

    _updateActiveButton(activeElement, selector) {
        const parent = this.element;
        if (!parent) return;
        const buttons = parent.querySelectorAll(selector);
        buttons.forEach((btn) => btn.classList.remove("active"));
        activeElement.classList.add("active");
    }

    _clearActive(selector) {
        if (!this.element) return;
        const buttons = this.element.querySelectorAll(selector);
        buttons.forEach((btn) => btn.classList.remove("active"));
    }

    _onRender() {
        super._onRender?.();
        if (this.element?.tagName === "FORM") {
            this.element.addEventListener("submit", (e) => e.preventDefault());
        }
    }

    _readFormValues() {
        const form = this.element;
        if (!form) return;
        this.object.useSpeciality = !!form.querySelector('[name="specialty"]')?.checked;
        this.object.useWillpower = !!form.querySelector('[name="useWillpower"]')?.checked;
        try {
            this.object.bonus = parseInt(form.querySelector('[name="bonus"]')?.value) || 0;
        } catch {
            this.object.bonus = 0;
        }
        try {
            this.object.dodgebonus = parseInt(form.querySelector('[name="dodgebonus"]')?.value) || 0;
        } catch {
            this.object.dodgebonus = 0;
        }
        if (this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && !this.object.usedReducedDiff) {
            this.object.difficulty -= parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = true;
        } else if (!this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && this.object.usedReducedDiff) {
            this.object.difficulty += parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = false;
        }
        this.object.canRoll = this.object.difficulty > -1;
    }

    async _prepareContext() {
        const data = await super._prepareContext();
        data.actorData = this.actor.system;
        data.config = CONFIG.worldofdarkness;
        data.state = this.weaponState;
        data.object = this.object;

        if (this.actor.type === "PC") {
            data.actorData.type = this.actor.system.settings.game;
            data.object.sheettype = (data.actorData.type || "").toLowerCase() + "Dialog";
            const abilities = Object.values(this.actor.system.abilities ?? {});
            data.config.meleeAbilities = (abilities
                .filter((a) => a.type === "Ability" && a.system?.settings?.isvisible && a.system?.settings?.ismeleeweapon))
                .sort((a, b) => game.i18n.localize(a.system?.label || "").localeCompare(game.i18n.localize(b.system?.label || "")));
            data.config.rangedAbilities = (abilities
                .filter((a) => a.type === "Ability" && a.system?.settings?.isvisible && a.system?.settings?.israngedweapon))
                .sort((a, b) => game.i18n.localize(a.system?.label || "").localeCompare(game.i18n.localize(b.system?.label || "")));
        } 
        else {
            data.actorData.type = this.actor.type;
            if (this.actor.system?.listdata?.meleeAbilities?.length > 0) data.config.meleeAbilities = this.actor.system.listdata.meleeAbilities;
            if (this.actor.system?.listdata?.rangedAbilities?.length > 0) data.config.rangedAbilities = this.actor.system.listdata.rangedAbilities;
            data.object.sheettype = data.actorData.type !== CONFIG.worldofdarkness.sheettype.changingbreed
                ? (data.actorData.type || "").toLowerCase() + "Dialog"
                : "werewolfDialog";
        }

        let actortype = (this.actor.type || "").toLowerCase();
        if (this.actor?.system?.settings?.splat) actortype = this.actor.system.settings.splat;
        if (!CONFIG.worldofdarkness.alwaysspeciality?.[actortype]) actortype = CONFIG.worldofdarkness.sheettype?.vampire?.toLowerCase() || "vampire";

        let attributeSpeciality = "";
        let abilitySpeciality = "";

        if (this.actor.system?.attributes && data.actorData.attributes?.[data.object.dice1]?.value != null) {
            data.object.attributeValue = parseInt(data.actorData.attributes[data.object.dice1].total) || 0;
            data.object.attributeName = game.i18n.localize(data.actorData.attributes[data.object.dice1].label || "");
            if (parseInt(data.actorData.attributes[data.object.dice1].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
                data.object.hasSpeciality = true;
                attributeSpeciality = data.actorData.attributes[data.object.dice1].speciality || "";
            }
        } 
        else if (data.actorData[data.object.dice1]?.roll != null) {
            data.object.attributeValue = parseInt(data.actorData[data.object.dice1].roll) || 0;
            data.object.attributeName = game.i18n.localize(data.actorData[data.object.dice1].label || "");
            if (this.actor.system?.[data.object.dice1]?.label === "wod.advantages.willpower" && CONFIG.worldofdarkness.attributeSettings === "5th") {
                if (parseInt(data.actorData.attributes?.composure?.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
                    data.object.hasSpeciality = true;
                    attributeSpeciality = data.actorData.attributes.composure.speciality || "";
                }
                if (parseInt(data.actorData.attributes?.resolve?.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel) && data.actorData.attributes?.resolve?.speciality) {
                    data.object.hasSpeciality = true;
                    if (attributeSpeciality) attributeSpeciality += ", ";
                    attributeSpeciality += data.actorData.attributes.resolve.speciality || "";
                }
            }
        }

        if (this.actor.type === "PC" && data.object.dice2 && this.actor.api) {
            const abilityItem = this.actor.api.getAbility(data.object.dice2);
            if (abilityItem) {
                data.object.abilityValue = parseInt(abilityItem.system.value) || 0;
                data.object.abilityName = game.i18n.localize(abilityItem.system.label || "");
                if (parseInt(abilityItem.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel) ||
                    (CONFIG.worldofdarkness.alwaysspeciality?.[actortype]?.includes(abilityItem.system.id))) {
                    data.object.hasSpeciality = true;
                    abilitySpeciality = abilityItem.system.speciality || "";
                }
            }
        } 
        else if (this.actor.system?.abilities && data.actorData.abilities?.[data.object.dice2]?.value != null) {
            data.object.abilityValue = parseInt(data.actorData.abilities[data.object.dice2].value) || 0;
            data.object.abilityName = (data.actorData.abilities[data.object.dice2].altlabel === "")
                ? game.i18n.localize(data.actorData.abilities[data.object.dice2].label || "")
                : (data.actorData.abilities[data.object.dice2].altlabel || "");
            if (parseInt(data.actorData.abilities[data.object.dice2].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel) ||
                CONFIG.worldofdarkness.alwaysspeciality?.[actortype]?.includes(data.actorData.abilities[data.object.dice2]._id)) {
                data.object.hasSpeciality = true;
                abilitySpeciality = data.actorData.abilities[data.object.dice2].speciality || "";
            }
        } 
        else if (data.object.dice2 === "custom" && data.object.secondaryabilityid) {
            const secItem = await this.actor.getEmbeddedDocument("Item", data.object.secondaryabilityid);
            if (secItem) {
                data.object.abilityValue = parseInt(secItem.system.value) || 0;
                data.object.abilityName = secItem.system.label || "";
                if (parseInt(secItem.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
                    data.object.hasSpeciality = true;
                    abilitySpeciality = secItem.system.speciality || "";
                }
            }
        }

        if (data.object.hasSpeciality) {
            data.object.specialityText = [attributeSpeciality, abilitySpeciality].filter(Boolean).join(", ");
        }

        if (await BonusHelper.CheckAttributeDiceBuff(this.actor, data.object.dice1)) {
            const bonus = await BonusHelper.GetAttributeDiceBuff(this.actor, data.object.dice1);
            data.object.attributeValue += parseInt(bonus) || 0;
        }
        if (await BonusHelper.CheckAbilityBuff(this.actor, data.object.dice2)) {
            const bonus = await BonusHelper.GetAbilityBuff(this.actor, data.object.dice2);
            data.object.abilityValue += parseInt(bonus) || 0;
        }

        this.object = data.object;
        return data;
    }

    async _rollAttack() {
        const o = this.object;
        let woundPenaltyVal = CombatHelper.ignoresPain(this.actor) ? 0 : (parseInt(this.actor.system?.health?.damage?.woundpenalty) || 0);
        const weaponRoll = new DiceRollContainer(this.actor);
        weaponRoll.attribute = o.dice1;
        weaponRoll.ability = o.dice2;
        weaponRoll.origin = "attack";
        weaponRoll.action = `${o.name} (${game.i18n.localize("wod.dialog.weapon.attack")})`;
        const template = [`${o.attributeName} (${o.attributeValue})`];

        if (o.abilityName) template.push(`${o.abilityName} (${o.abilityValue})`);
        if (o.modename === "burst") weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.usingburst"));
        if (o.modename === "fullauto") weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.usingauto"));
        if (o.modename === "spray") weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.usingspray"));

        let numDices = parseInt(o.attributeValue) + parseInt(o.abilityValue) + parseInt(o.bonus);
        let difficulty = o.difficulty;
        if (await BonusHelper.CheckAttackDiff(this.actor, o.weaponType)) {
            const mod = await BonusHelper.GetAttackDiff(this.actor, o.weaponType);
            difficulty += mod;
            weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.attackdiffchat") + ` ${mod}`);
        }
        if (await BonusHelper.CheckAttackBuff(this.actor, o.weaponType)) {
            const mod = await BonusHelper.GetAttackBuff(this.actor, o.weaponType);
            numDices += mod;
            weaponRoll.extraInfo.push(game.i18n.localize("wod.dialog.weapon.attackbonuschat") + ` ${mod}`);
        }

        weaponRoll.numDices = numDices;
        weaponRoll.difficulty = difficulty;
        weaponRoll.dicetext = template;
        weaponRoll.usewillpower = o.useWillpower;
        weaponRoll.woundpenalty = woundPenaltyVal;
        weaponRoll.bonus = parseInt(o.bonus);
        weaponRoll.systemText = o.system || "";
        weaponRoll.speciality = o.useSpeciality;
        weaponRoll.specialityText = o.useSpeciality ? (o.specialityText || "") : "";

        const item = await this.actor.getEmbeddedDocument("Item", o._id);

        if (!item) {
            console.log("WoD DEBUG | Item " + o._id + " not found on actor " + this.actor.name +" existing attack roll");
            return;
        }
        if (o.dice2 === "custom" && o.secondaryabilityid) {
            const itemData = foundry.utils.duplicate(item);
            itemData.system.attack.secondaryabilityid = o.secondaryabilityid;
            await item.update(itemData);
        }

        const numberOfSuccesses = await DiceRoller(weaponRoll);
        const damageRollable = item.system?.damage?.isrollable !== false;

        console.log("WoD DEBUG | Attack roll resulted in", numberOfSuccesses, "successes");

        if (damageRollable === true) {
            console.log("WoD DEBUG | Damage roll is set to be rolled after successful attack");
        }
        else {
            console.log("WoD DEBUG | Damage roll is not set to be rolled after successful attack");
            console.log("WoD DEBUG | Damage rollable value:", damageRollable);
        }

        if (numberOfSuccesses > 0 && damageRollable) {
            console.log("WoD DEBUG | Damage roll to be rolled");

            this.weaponState = "damage";
            this.attackResult = {
                extraSuccesses: numberOfSuccesses - 1,
                numberoftargets: o.numberoftargets,
                modename: o.modename
            };
            this.object = buildViewModel(this.item, this.weaponState, this.attackResult);
            await this.render();
        } else {
            console.log("WoD DEBUG | No damage roll to be rolled");
            this.close();
        }
    }

    async _rollDamage() {
        const o = this.object;
        let woundPenaltyVal = 0;

        if (CONFIG.worldofdarkness.usePenaltyDamage && !CombatHelper.ignoresPain(this.actor)) {
            woundPenaltyVal = parseInt(this.actor.system?.health?.damage?.woundpenalty) || 0;
        }

        const weaponRoll = new DiceRollContainer(this.actor);
        weaponRoll.origin = "damage";
        weaponRoll.action = `${o.name} (${game.i18n.localize("wod.dialog.weapon.damage")})`;
        weaponRoll.attribute = o.dice1;
        weaponRoll.ability = "";
        const template = [];

        if (o.attributeName) template.push(`${o.attributeName} (${o.attributeValue})`);
        if (o.abilityValue > 0) template.push(o.abilityValue);
        if (o.extraSuccesses > 0) template.push(o.extraSuccesses);

        weaponRoll.dicetext = template;
        weaponRoll.damageCode = o.damageCode ? `(${o.damageCode})` : undefined;
        weaponRoll.woundpenalty = CONFIG.worldofdarkness.usePenaltyDamage ? woundPenaltyVal : 0;
        weaponRoll.speciality = false;
        weaponRoll.systemText = "";

        if ((o.numberoftargets > 1) && (o.modename === "spray")) {
            console.log("WoD DEBUG | Spray attack with", o.numberoftargets, "targets");

            let numberTargets = o.numberoftargets;
            const maxnumberTargets = parseInt(o.extraSuccesses) + 1;
            if (numberTargets > maxnumberTargets) numberTargets = maxnumberTargets;
            const targetlist = [];
            const baseDice = parseInt(o.attributeValue) + parseInt(o.abilityValue) + parseInt(o.bonus) + parseInt(o.dodgebonus);
            for (let i = 0; i < numberTargets; i++) {
                targetlist.push({ numDices: baseDice });
            }
            let rolledSuccesses = maxnumberTargets - numberTargets;
            let list = 0;
            while (rolledSuccesses > 0) {
                targetlist[list].numDices += 1;
                rolledSuccesses--;
                list = list >= numberTargets - 1 ? 0 : list + 1;
            }
            let spraytext = game.i18n.localize("wod.dialog.weapon.sprayresult");
            spraytext = spraytext.replace("[0]", String(o.numberoftargets)).replace("[1]", String(numberTargets));
            weaponRoll.extraInfo.push(spraytext);
            weaponRoll.targetlist = targetlist;
            weaponRoll.difficulty = parseInt(o.difficulty) || 6;
            weaponRoll.bonus = parseInt(o.bonus) + parseInt(o.dodgebonus);
            await DiceRoller(weaponRoll);
        } 
        else {
            console.log("WoD DEBUG | Damage roll with", o.attributeValue, "attribute dice,", o.abilityValue, "ability dice,", o.bonus, "bonus, and", o.extraSuccesses, "extra successes");

            const numDices = parseInt(o.attributeValue) + parseInt(o.abilityValue) + parseInt(o.bonus) + parseInt(o.extraSuccesses);
            weaponRoll.numDices = numDices;
            weaponRoll.difficulty = parseInt(o.difficulty) || 6;
            weaponRoll.bonus = parseInt(o.bonus) + parseInt(o.dodgebonus);
            await DiceRoller(weaponRoll);
        }
        this.close();
    }
}
