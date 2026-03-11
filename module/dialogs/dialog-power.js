import { DiceRoller } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

import CombatHelper from "../scripts/combat-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js";

export class BasePower {
    constructor(item) {
        this.attributeValue = 0;
        this.attributeName = "";

        this.abilityValue = 0;
        this.abilityName = "";

        this.hasSpeciality = false;
        this.specialityText = "";

        this._id = item["_id"];
        this.name = item["name"];
        //this.type = item["type"];
        this.type = item.system["type"];
        this.dice1 = item.system["dice1"];
        this.dice2 = item.system["dice2"];
        this.bonus = parseInt(item.system["bonus"]);
        this.difficulty = parseInt(item.system["difficulty"]);
        this.description = item.system["description"];
        this.system = item.system["details"];

        if (this.dice1 === "custom") {
            this.secondaryabilityid = item.system["secondaryabilityid"];
        } else if (this.dice2 === "custom") {
            this.secondaryabilityid = item.system["secondaryabilityid"];
        }

        this.usedReducedDiff = false;
        this.canRoll = this.difficulty > -1;
        this.close = false;

        // Let subclasses define this
        this.sheettype = "mortalDialog";
    }
}

export class Gift extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "werewolfDialog";
    }
}

export class Charm extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "spiritDialog";
    }
}

export class Power extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "creatureDialog";
    }
}

export class DisciplinePower extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "vampireDialog";
    }
}

export class PathPower extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "vampireDialog";
    }
}

export class RitualPower extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "vampireDialog";
    }
}

export class ArtPower extends BasePower {
    constructor(item) {
        super(item);

        this.parentid = item.system["parentid"];

        if (item.system["arttype"] == "") {
            this.arttype = game.i18n.localize("wod.dialog.power.notset");
        }
        else {
            this.arttype = item.system["arttype"];
            this.selectedarttype = "";

            if (this.arttype != "wod.labels.both") {
                this.selectedarttype = this.arttype;
            }
        } 

        this.dice1 = "art";
        this.dice2 = "realm";
        this.bonus = 0;
        this.difficulty = 8;

        if (this.dice1 === "custom") {
            this.secondaryabilityid = this.dice1 == "custom" ? item.system["secondaryabilityid"] : "";
        }
        else if (this.dice2 === "custom") {
            this.secondaryabilityid = this.dice2 == "custom" ? item.system["secondaryabilityid"] : "";
        }

        this.selectedRealms = [];
        this.isUnleashing = false;
        this.nightmareReplace = 0;
        this.maxnightmareDice = 0;

        this.sheettype = "changelingDialog";
    }

    _lowestRank() {
        let lowestRank = 99;
        let affinitySelected = false;
        let difficultRealm = false;
        let realmMod = 0;
        
        this.difficulty = 8;

        for (const realm of this.selectedRealms) {
            if ((realm.label != "wod.realms.scene") && (realm.label != "wod.realms.time") && (realm.isselected)) {
                if (lowestRank > realm.value) {
                    lowestRank = realm.value;
                }                
            }
            if ((realm.isaffinity) && (realm.isselected)) {
                affinitySelected = true;
            }
            if (((realm.label == "wod.realms.scene") || (realm.label == "wod.realms.time")) && (realm.isselected)) {
                difficultRealm = true;
                realmMod += 1;
            }
        }

        if ((affinitySelected) || (difficultRealm)) {
            if (affinitySelected) {
                this.difficulty -= 1;
            }
            if (difficultRealm) {
                this.difficulty += realmMod;
            }
        }

        this.difficulty -= this.nightmareReplace;

        if (lowestRank == 99) {
            lowestRank = 0;
        }

        return lowestRank;
    }
}

export class EdgePower extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "hunterDialog";
    }
}

export class LorePower extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "demonDialog";
    }
}

export class ArcanoiPower extends BasePower {
    constructor(item) {
        super(item);

        this.parentid = item.system["parentid"];

        this.sheettype = "wraithDialog";
    }
}

export class HekauPower extends BasePower {
    constructor(item) {
        super(item);

        this.parentid = item.system["parentid"];

        this.sheettype = "mummyDialog";
    }
}

export class NuminaPower extends BasePower {
    constructor(item) {
        super(item);

        this.parentid = item.system["parentid"];

        this.sheettype = "mageDialog";
    }
}

export class Horror extends BasePower {
    constructor(item) {
        super(item);

        this.sheettype = "wraithDialog";
    }
}

export class ExaltedPower extends BasePower {
    constructor(item) {
        super(item);

        this.parentid = item.system["parentid"];

        this.sheettype = "exaltedDialog";
    }
}

export class DialogPower extends FormApplication {
    constructor(actor, power) {
        super(power, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;
        this.isDialog = true;

        if (this.actor.system.settings.powers.hasarts) {
            this.object.selectedRealms = this.actor.system.listdata.powers.arts.realms;

            for (const realm of this.object.selectedRealms) {
                realm.isselected = false;
            }
        }
        
        this.options.title = `${this.actor.name}`;
    }


    /**
        * Extend and override the default options used by the WoD Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["wod20 wod-dialog power-dialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-power.hbs",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    async getData() {
        const data = super.getData();

        // Use objects to allow modification in helper functions
        const attributeSpeciality = { value: "" };
        const abilitySpeciality = { value: "" };

        data.actorData = this.actor.system;
        data.config = CONFIG.worldofdarkness;     

        if (this.actor.type == "PC") {
            //data.config.powerAbilities = [];

            const abilities = Object.values(this.actor.system.abilities ?? {});

            data.config.powerAbilities = abilities
                                .filter(item => item.type === "Ability" && item.system.settings.isvisible && item.system.settings.ispower)
                                .sort((a, b) => game.i18n.localize(a.system.label).localeCompare(game.i18n.localize(b.system.label)));
        }
        else {
            data.config.powerAbilities = this.actor.system.listdata.powerAbilities; 
        }        
        
        const actortype = this._getActorType();

        // Handle dice1 (attribute/primary dice)
        if ((this.actor.type == "PC") && (data.object.dice1 == "path")) {
            await this._handleDice1PathPC(data);
        }
        else if ((this.actor.type != "PC") && (data.object.dice1 == "path")) {
            this._handleDice1PathLegacy(data);
        }                    
        else if (data.object.dice1 == "custom") {
            await this._handleDice1Custom(data, abilitySpeciality);
        }
        else if ((data.object.dice1 == "art") && (data.object.type == "wod.types.artpower")) {
            await this._handleDice1Art(data);
        }
        else if ((this.actor.system?.attributes != undefined) && (this.actor.system.attributes[data.object.dice1]?.value != undefined)) {
            await this._handleDice1Attribute(data, attributeSpeciality);
        }
            else if ((this.actor.type == "PC") && this.actor.api && data.object.dice1 && data.object.dice1 !== "") {
                const abilityItem = this.actor.api.getAbility(data.object.dice1);
                if (abilityItem) {
                    this._handleDice1AbilityPC(data, actortype, abilitySpeciality);
                }
            }
        else if ((this.actor.system?.abilities != undefined) && (this.actor.system.abilities[data.object.dice1]?.value != undefined)) {
            this._handleDice1AbilityLegacy(data, actortype, attributeSpeciality);
        }
        else if ((this.actor.type == "PC") && ((this.actor.system?.advantages != undefined) && (this.actor.system.advantages[data.object.dice1]?.system?.roll != undefined))) {
            this._handleDice1AdvantagePC(data, attributeSpeciality);
        }
        else if (this.actor.system.advantages[data.object.dice1]?.roll != undefined) {
            this._handleDice1AdvantageLegacy(data, attributeSpeciality);
        }
        else if ((this.actor.type == "PC") && (this.actor.system?.advantages != undefined) && (this.actor.system.advantages[data.object.dice1]?.system?.group === "virtue") && (this.actor.system.advantages[data.object.dice1]?.system?.roll != undefined)) {
            this._handleDice1VirtuePC(data);
        }
        else if ((this.actor.system.advantages.virtues != undefined) && (this.actor.system.advantages.virtues[data.object.dice1]?.roll != undefined)) {
            this._handleDice1VirtueLegacy(data);
        }

        // Handle dice2 (ability/secondary dice)
        if (data.object.dice2 != "") {
            if (data.object.dice2 == "path") {
                this._handleDice2Path(data);
            }
            else if (data.object.dice2 == "custom") {
                await this._handleDice2Custom(data, abilitySpeciality);
            }
            else if ((data.object.dice2 == "realm") && (data.object.type == "wod.types.artpower")) {
                this._handleDice2Realm(data);
            }
            else if ((this.actor.system?.attributes != undefined) && (this.actor.system.attributes[data.object.dice2]?.value != undefined)) {
                await this._handleDice2Attribute(data, abilitySpeciality);
            }
            else if ((this.actor.type == "PC") && this.actor.api && data.object.dice2 && data.object.dice2 !== "") {
                const abilityItem = this.actor.api.getAbility(data.object.dice2);
                if (abilityItem) {
                    this._handleDice2AbilityPC(data, actortype, abilitySpeciality);
                }
            }
            else if ((this.actor.system?.abilities != undefined) && (this.actor.system.abilities[data.object.dice2]?.value != undefined)) {
                this._handleDice2AbilityLegacy(data, actortype, abilitySpeciality);
            }
            else if ((this.actor.type == "PC") && (this.actor.system?.advantages != undefined) && (this.actor.system.advantages[data.object.dice2]?.system?.group === "virtue") && (this.actor.system.advantages[data.object.dice2]?.system?.roll != undefined)) {
                this._handleDice2VirtuePC(data);
            }
            else if ((this.actor.system.advantages.virtues != undefined) && (this.actor.system.advantages.virtues[data.object.dice2]?.roll != undefined)) {
                this._handleDice2VirtueLegacy(data);
            }
        }
        // Handle Arcanoi, Hekau, or Numina power types (uses parent power value as ability)
        else if ((data.object.type == "wod.types.arcanoipower") || (data.object.type == "wod.types.hekaupower") || (data.object.type == "wod.types.numinapower")) {
            await this._handleArcanoiHekauNumina(data);
        }

        // Combine specialities and apply final calculations
        data.object.specialityText = this._combineSpecialityText(data, attributeSpeciality.value, abilitySpeciality.value);
        this._handleNightmareDice(data);
        await this._applyAbilityBuffs(data);

        return data;
    }

    /**
     * Get actor type for speciality checks
     * @returns {string} Actor type (vampire, mage, etc.)
     */
    _getActorType() {
        let actortype = this.actor.type.toLowerCase();

        if (this.actor?.system?.settings?.splat !== undefined) {
            actortype = this.actor.system.settings.splat;
        }

        if (CONFIG.worldofdarkness.alwaysspeciality[actortype] == undefined) {
            actortype = CONFIG.worldofdarkness.sheettype.vampire.toLowerCase();
        }

        return actortype;
    }

    /**
     * Handle dice1 when it's a Path
     * @param {Object} data - Dialog data object
     */
    _handleDice1PathPC(data) {
        if (this.actor.system.advantages.path?.system?.label === "custom") {
            data.object.attributeName = this.actor.system.advantages.path?.custom;
        }
        else {
            data.object.attributeName = game.i18n.localize(this.actor.system.advantages.path?.system?.label);
        }
        data.object.attributeValue = parseInt(this.actor.system.advantages.path?.system?.roll ?? 0);
    }

    /**
     * Handle dice1 when it's a Path
     * @param {Object} data - Dialog data object
     */
    _handleDice1PathLegacy(data) {
        if (this.actor.system.advantages.path?.label === "custom") {
            data.object.attributeName = this.actor.system.advantages.path?.custom;
        }
        else {
            data.object.attributeName = game.i18n.localize(this.actor.system.advantages.path?.label);
        }
        data.object.attributeValue = parseInt(this.actor.system.advantages.path?.roll ?? 0);
    }

    /**
     * Handle dice1 when it's a custom secondary ability
     * @param {Object} data - Dialog data object
     * @param {string} abilitySpeciality - Reference to ability speciality string
     * @returns {Promise<void>}
     */
    async _handleDice1Custom(data, abilitySpeciality) {
        if (this.object.secondaryabilityid != "") {
            const item = await this.actor.getEmbeddedDocument("Item", this.object.secondaryabilityid);

            if (!item) {
                return;
            }

            this.object.attributeValue = parseInt(item.system.value);
            this.object.attributeName = item.system.label;

            if (parseInt(item.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
                data.object.hasSpeciality = true;
                abilitySpeciality.value = item.system.speciality;
            }
        }
    }

    /**
     * Handle dice1 when it's an Art (Changeling)
     * @param {Object} data - Dialog data object
     * @returns {Promise<void>}
     */
    async _handleDice1Art(data) {
        if (!this.object.isUnleashing) {
            const art = await this.actor.getEmbeddedDocument("Item", data.object.parentid);
            data.object.attributeValue = art.system.value;
            data.object.attributeName = art.name;
        }
        else {
            data.object.attributeValue = parseInt(this.actor.system.advantages.glamour.roll);
            data.object.attributeName = game.i18n.localize(this.actor.system.advantages.glamour.label);
            data.object.difficulty = 7;
        }
    }

    /**
     * Handle dice1 when it's an Attribute
     * @param {Object} data - Dialog data object
     * @param {string} attributeSpeciality - Reference to attribute speciality string
     * @returns {Promise<void>}
     */
    async _handleDice1Attribute(data, attributeSpeciality) {
        data.object.attributeValue = parseInt(this.actor.system.attributes[data.object.dice1].total);
        data.object.attributeName = game.i18n.localize(this.actor.system.attributes[data.object.dice1].label);

        if (parseInt(this.actor.system.attributes[data.object.dice1].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
            data.object.hasSpeciality = true;
            attributeSpeciality.value = this.actor.system.attributes[data.object.dice1].speciality;
        }

        if (await BonusHelper.CheckAttributeDiceBuff(this.actor, data.object.dice1)) {
            let bonus = await BonusHelper.GetAttributeDiceBuff(this.actor, data.object.dice1);
            data.object.attributeValue += parseInt(bonus);
        }
    }

    /**
     * Handle dice1 when it's an Ability (PC actors)
     * @param {Object} data - Dialog data object
     * @param {string} actortype - Actor type
     * @param {string} abilitySpeciality - Reference to ability speciality string
     */
    _handleDice1AbilityPC(data, actortype, abilitySpeciality) {
        if (!data.object.dice1 || data.object.dice1 === "" || !this.actor.api) {
            return;
        }
        const abilityItem = this.actor.api.getAbility(data.object.dice1);
        if (!abilityItem) {
            return;
        }

        data.object.abilityValue = parseInt(abilityItem.system.value);
        data.object.abilityName = game.i18n.localize(abilityItem.system.label);

        if ((parseInt(abilityItem.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) || 
            (CONFIG.worldofdarkness.alwaysspeciality[actortype].includes(abilityItem.system.id))) {
            data.object.hasSpeciality = true;
            abilitySpeciality.value = abilityItem.system.speciality;
        }
    }

    /**
     * Handle dice1 when it's an Ability (Legacy actors)
     * @param {Object} data - Dialog data object
     * @param {string} actortype - Actor type
     * @param {string} attributeSpeciality - Reference to attribute speciality string
     */
    _handleDice1AbilityLegacy(data, actortype, attributeSpeciality) {
        data.object.attributeValue = parseInt(this.actor.system.abilities[data.object.dice1].value);

        if (this.actor.system.abilities[data.object.dice1] == undefined) {
            data.object.attributeName = game.i18n.localize(this.actor.system.abilities[data.object.dice1].label);
        }
        else {
            data.object.attributeName = (this.actor.system.abilities[data.object.dice1].altlabel == "") ? 
                game.i18n.localize(this.actor.system.abilities[data.object.dice1].label) : 
                this.actor.system.abilities[data.object.dice1].altlabel;
        }

        const hasSpeciality = CONFIG.worldofdarkness.alwaysspeciality[actortype].includes(this.actor.system.abilities[data.object.dice1]._id);

        if ((parseInt(this.actor.system.abilities[data.object.dice1].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) || (hasSpeciality)) {
            data.object.hasSpeciality = true;
            attributeSpeciality.value = this.actor.system.abilities[data.object.dice1].speciality;
        }
    }

    /**
     * Handle dice1 when it's an Advantage (PC actors)
     * @param {Object} data - Dialog data object
     * @param {string} attributeSpeciality - Reference to attribute speciality string
     */
    _handleDice1AdvantagePC(data, attributeSpeciality) {
        const advantage = this.actor.api?.getAdvantage(data.object.dice1);
        if (!advantage) {
            return;
        }
        data.object.attributeValue = parseInt(advantage.system.roll ?? 0);
        data.object.attributeName = game.i18n.localize(advantage.system.label);

        // Handle willpower speciality for 5th edition
        if ((advantage.system.label == "wod.advantages.willpower") && 
            (CONFIG.worldofdarkness.attributeSettings == "5th")) {
            this._handleWillpowerSpeciality(data, attributeSpeciality);
        }
    }

    /**
     * Handle dice1 when it's an Advantage (Legacy actors)
     * @param {Object} data - Dialog data object
     * @param {string} attributeSpeciality - Reference to attribute speciality string
     */
    _handleDice1AdvantageLegacy(data, attributeSpeciality) {
        data.object.attributeValue = parseInt(this.actor.system.advantages[data.object.dice1].roll);
        data.object.attributeName = game.i18n.localize(this.actor.system.advantages[data.object.dice1].label);

        // Handle willpower speciality for 5th edition
        if ((this.actor.system.advantages[data.object.dice1].label == "wod.advantages.willpower") && 
            (CONFIG.worldofdarkness.attributeSettings == "5th")) {
            this._handleWillpowerSpeciality(data, attributeSpeciality);
        }
    }

    /**
     * Handle willpower speciality (composure + resolve)
     * @param {Object} data - Dialog data object
     * @param {string} attributeSpeciality - Reference to attribute speciality string
     */
    _handleWillpowerSpeciality(data, attributeSpeciality) {
        if (parseInt(this.actor.system.attributes?.composure.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
            data.object.hasSpeciality = true;
            if (attributeSpeciality.value != "") {
                attributeSpeciality.value += ", ";
            }
            attributeSpeciality.value += this.actor.system.attributes.composure.speciality;
        }
        if (parseInt(this.actor.system.attributes?.resolve.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
            data.object.hasSpeciality = true;
            if (attributeSpeciality.value != "") {
                attributeSpeciality.value += ", ";
            }
            attributeSpeciality.value += this.actor.system.attributes.resolve.speciality;
        }
    }

    /**
     * Handle dice1 when it's a Virtue (PC actors)
     * @param {Object} data - Dialog data object
     */
    _handleDice1VirtuePC(data) {
        const advantage = this.actor.api?.getAdvantage(data.object.dice1);
        if (!advantage) {
            return;
        }
        data.object.attributeValue = parseInt(advantage.system.roll ?? 0);
        data.object.attributeName = game.i18n.localize(advantage.system.label);
    }

    /**
     * Handle dice1 when it's a Virtue (Legacy actors)
     * @param {Object} data - Dialog data object
     */
    _handleDice1VirtueLegacy(data) {
        data.object.attributeValue = parseInt(this.actor.system.advantages.virtues[data.object.dice1].roll);
        data.object.attributeName = game.i18n.localize(this.actor.system.advantages.virtues[data.object.dice1].label);
    }

    /**
     * Handle dice2 when it's a Path
     * @param {Object} data - Dialog data object
     */
    _handleDice2Path(data) {
        if (this.actor.system.advantages.path?.label === "custom") {
            data.object.abilityName = this.actor.system.advantages.path?.custom;
        }
        else {
            data.object.abilityName = game.i18n.localize(this.actor.system.advantages.path?.label);
        }
        data.object.abilityValue = parseInt(this.actor.system.advantages.path?.roll ?? 0);
    }

    /**
     * Handle dice2 when it's a custom secondary ability
     * @param {Object} data - Dialog data object
     * @param {string} abilitySpeciality - Reference to ability speciality string
     * @returns {Promise<void>}
     */
    async _handleDice2Custom(data, abilitySpeciality) {
        if (this.object.secondaryabilityid != "") {
            const item = await this.actor.getEmbeddedDocument("Item", this.object.secondaryabilityid);

            if (!item) {
                return;
            }

            this.object.abilityValue = parseInt(item.system.value);
            this.object.abilityName = item.system.label;

            if (parseInt(item.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
                data.object.hasSpeciality = true;
                abilitySpeciality.value = item.system.speciality;
            }
        }
    }

    /**
     * Handle dice2 when it's a Realm (Changeling)
     * @param {Object} data - Dialog data object
     */
    _handleDice2Realm(data) {
        if (!this.object.isUnleashing) {
            const realm = data.object._lowestRank();
            data.object.bonus = parseInt(realm);
        }
        else {
            data.object.abilityValue = parseInt(this.actor.system.advantages.nightmare.roll);
            data.object.abilityName = game.i18n.localize(this.actor.system.advantages.nightmare.label);
            data.object.bonus = 0;

            for (const realm of data.object.selectedRealms) {
                realm.isselected = false;
            }
        }
    }

    /**
     * Handle dice2 when it's an Attribute
     * @param {Object} data - Dialog data object
     * @param {string} abilitySpeciality - Reference to ability speciality string
     * @returns {Promise<void>}
     */
    async _handleDice2Attribute(data, abilitySpeciality) {
        data.object.abilityValue = parseInt(this.actor.system.attributes[data.object.dice2].total);
        data.object.abilityName = game.i18n.localize(this.actor.system.attributes[data.object.dice2].label);

        if (parseInt(this.actor.system.attributes[data.object.dice2].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) {
            data.object.hasSpeciality = true;
            abilitySpeciality.value = this.actor.system.attributes[data.object.dice2].speciality;
        }

        if (await BonusHelper.CheckAttributeDiceBuff(this.actor, data.object.dice2)) {
            let bonus = await BonusHelper.GetAttributeDiceBuff(this.actor, data.object.dice2);
            data.object.abilityValue += parseInt(bonus);
        }
    }

    /**
     * Handle dice2 when it's an Ability (PC actors)
     * @param {Object} data - Dialog data object
     * @param {string} actortype - Actor type
     * @param {string} abilitySpeciality - Reference to ability speciality string
     */
    _handleDice2AbilityPC(data, actortype, abilitySpeciality) {
        if (!data.object.dice2 || data.object.dice2 === "" || !this.actor.api) {
            return;
        }
        const abilityItem = this.actor.api.getAbility(data.object.dice2);
        if (!abilityItem) {
            return;
        }

        data.object.abilityValue = parseInt(abilityItem.system.value);
        data.object.abilityName = game.i18n.localize(abilityItem.system.label);

        if ((parseInt(abilityItem.system.value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) || 
            (CONFIG.worldofdarkness.alwaysspeciality[actortype].includes(abilityItem.system.id))) {
            data.object.hasSpeciality = true;
            abilitySpeciality.value = abilityItem.system.speciality;
        }
    }

    /**
     * Handle dice2 when it's an Ability (Legacy actors)
     * @param {Object} data - Dialog data object
     * @param {string} actortype - Actor type
     * @param {string} abilitySpeciality - Reference to ability speciality string
     */
    _handleDice2AbilityLegacy(data, actortype, abilitySpeciality) {
        data.object.abilityValue = parseInt(this.actor.system.abilities[data.object.dice2].value);

        if (this.actor.system.abilities[data.object.dice2] == undefined) {
            data.object.abilityName = game.i18n.localize(this.actor.system.abilities[data.object.dice2].label);
        }
        else {
            data.object.abilityName = (this.actor.system.abilities[data.object.dice2].altlabel == "") ? 
                game.i18n.localize(this.actor.system.abilities[data.object.dice2].label) : 
                this.actor.system.abilities[data.object.dice2].altlabel;
        }

        const hasSpeciality = CONFIG.worldofdarkness.alwaysspeciality[actortype].includes(this.actor.system.abilities[data.object.dice2]._id);

        if ((parseInt(this.actor.system.abilities[data.object.dice2].value) >= parseInt(CONFIG.worldofdarkness.specialityLevel)) || (hasSpeciality)) {
            data.object.hasSpeciality = true;
            abilitySpeciality.value = this.actor.system.abilities[data.object.dice2].speciality;
        }
    }

    /**
     * Handle dice2 when it's a Virtue (PC actors)
     * @param {Object} data - Dialog data object
     */
    _handleDice2VirtuePC(data) {
        const advantage = this.actor.api?.getAdvantage(data.object.dice2);
        if (!advantage) {
            return;
        }
        data.object.abilityValue = parseInt(advantage.system.roll ?? 0);
        data.object.abilityName = game.i18n.localize(advantage.system.label);
    }

    /**
     * Handle dice2 when it's a Virtue (Legacy actors)
     * @param {Object} data - Dialog data object
     */
    _handleDice2VirtueLegacy(data) {
        data.object.abilityValue = parseInt(this.actor.system.advantages.virtues[data.object.dice2].roll);
        data.object.abilityName = game.i18n.localize(this.actor.system.advantages.virtues[data.object.dice2].label);
    }

    /**
     * Handle Arcanoi, Hekau, or Numina power types
     * @param {Object} data - Dialog data object
     * @returns {Promise<void>}
     */
    async _handleArcanoiHekauNumina(data) {
        const power = await this.actor.getEmbeddedDocument("Item", data.object.parentid);
        data.object.abilityValue = parseInt(power.system.value);
        data.object.abilityName = power.name;
    }

    /**
     * Combine attribute and ability specialities into speciality text
     * @param {Object} data - Dialog data object
     * @param {string} attributeSpeciality - Attribute speciality text
     * @param {string} abilitySpeciality - Ability speciality text
     * @returns {string} Combined speciality text
     */
    _combineSpecialityText(data, attributeSpeciality, abilitySpeciality) {
        if (!data.object.hasSpeciality) {
            return "";
        }

        if ((attributeSpeciality != "") && (abilitySpeciality != "")) {
            return attributeSpeciality + ", " + abilitySpeciality;
        }
        else if (attributeSpeciality != "") {
            return attributeSpeciality;
        }
        else if (abilitySpeciality != "") {
            return abilitySpeciality;
        }
        return "";
    }

    /**
     * Set maximum Nightmare dice for Changeling art powers
     * @param {Object} data - Dialog data object
     */
    _handleNightmareDice(data) {
        if (data.object.type == "wod.types.artpower") {
            this.object.maxnightmareDice = data.object.attributeValue + data.object.abilityValue + data.object.bonus - this.actor.system.advantages.nightmare.temporary;

            if (this.object.maxnightmareDice < 0) {
                this.object.maxnightmareDice = 0;
            }
            if (this.object.maxnightmareDice > 3) {
                this.object.maxnightmareDice = 3;
            }
        }
    }

    /**
     * Apply ability buffs to dice2
     * @param {Object} data - Dialog data object
     * @returns {Promise<void>}
     */
    async _applyAbilityBuffs(data) {
        if (await BonusHelper.CheckAbilityBuff(this.actor, data.object.dice2)) {
            let bonus = await BonusHelper.GetAbilityBuff(this.actor, data.object.dice2);
            this.object.abilityValue += parseInt(bonus);
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        html
            .find('.dialog-difficulty-button')
            .click(this._setDifficulty.bind(this));    
            
        html
            .find('.dialog-secondaryability-button')
            .click(this._setSecondaryAbility.bind(this));

        html
            .find('.actionbutton')
            .click(this._rollPower.bind(this));

        html
            .find('.dialog-realm-button')
            .click(this._selectRealm.bind(this));     

        html
            .find('.dialog-arttype-button')
            .click(this._selectArttype.bind(this));

        html
            .find('.closebutton')
            .click(this._closeForm.bind(this));
    }

    async _updateObject(event, formData){
        if (this.object.close) {
            this.close();
            return;
        }

        event.preventDefault();      
        
        // add the lowest number of dices from selected Realms
        if (this.object.type == "wod.types.artpower") {
            this.object.isUnleashing = formData["isUnleashing"];
            this.object.nightmareReplace = parseInt(formData["select_nightmaredice"]);
        }
        
        this.object.useSpeciality = formData["specialty"];          // om ändrad???
        this.object.useWillpower = formData["useWillpower"];

        if (this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && !this.object.usedReducedDiff) {
            this.object.difficulty -= parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = true;
        }
        else if (!this.object.useSpeciality && CONFIG.worldofdarkness.usespecialityReduceDiff && this.object.usedReducedDiff){
            this.object.difficulty += parseInt(CONFIG.worldofdarkness.specialityReduceDiff);
            this.object.usedReducedDiff = false;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;

        this.render();
    }

    close() {
        // do something for 'on close here'
        super.close()
    }

    _setDifficulty(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-difficulty-button");
        const index = parseInt(element.value);   

        this.object.difficulty = index;   
        this.object.canRoll = this.object.difficulty > -1 ? true : false;     

        if (index < 0) {
            return;
        }

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == index) {
                $(this).addClass("active");
            }
        });
    }

    async _setSecondaryAbility(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-secondaryability-button");
        const key = element.value;

        if (key == "") {
            steps.removeClass("active");
            return;
        }

        const abilityId = key;
        const item = await this.actor.getEmbeddedDocument("Item", abilityId);

        this.object.abilityValue = parseInt(item.system.value);
        this.object.abilityName = item.system.label;
        this.object.secondaryabilityid = item._id;

        steps.removeClass("active");

        steps.each(function (i) {
            if (this.value == key) {
                $(this).addClass("active");
            }
        });

        this.render();
    }

    _selectRealm(event) {
        const element = event.currentTarget;
        const parent = $(element.parentNode);
        const steps = parent.find(".dialog-realm-button");
        const key = element.value;

        if (key == "") {
            steps.removeClass("active");            
            return;
        }

        event.preventDefault();

        this.object.selectedRealms = this._changedSelectedRealm(this.object.selectedRealms, key);
        this.render();
    }

    _selectArttype(event) {
        event.preventDefault();

		const element = event.currentTarget;
		const dataset = element.dataset;

        this.object.selectedarttype = dataset.value;
        this.render();
    }

    _changedSelectedRealm(selected, realmid) {
        for (const i of selected) {
            if (i._id == realmid) {
                i.isselected = !i.isselected;
            }
        }

        return selected;
    }

    // if rolling art/glamour then replace Nightmare number of dices to Nightmare dice (black dices) (p275)

    //     Players can reduce the difficulty of a cantrip roll by 1 by
    // replacing another three dice in the pool with Nightmare dice.
    // The character must have three non-Nightmare dice in the pool
    // to gain this benefit. Doing so does not increase the character’s
    // Nightmare pool past that one roll (unless the player rolls some
    // 10s, of course).

    //      Nightmare dice function like normal dice for the roll,
    // except that when the player rolls a 10 on a Nightmare die, she
    // immediately adds another point to the character’s Nightmare
    // pool. The character can accumulate multiple Nightmare points
    // during a single roll, but the Nightmare rating never exceeds 10.
    
    async _rollPower(event) {
        if (this.object.close) {
            this.close();
            return;
        }

        this.object.canRoll = this.object.difficulty > -1 ? true : false;
        let woundPenaltyVal = 0;
        let numSpecialDices = 0;
        let specialDiceText = "";
        let template = [];
        let extraInfo = [];

        let selectedRealms = [];

        if (!this.object.canRoll) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.missingdifficulty"));
            return;
        }

        if ((this.object.dice1 == "custom") || (this.object.dice2 == "custom")) {
            let item = await this.actor.getEmbeddedDocument("Item", this.object._id);
            const itemData = foundry.utils.duplicate(item);
            itemData.system.secondaryabilityid = this.object.secondaryabilityid;
            await item.update(itemData);
        }

        template.push(`${this.object.attributeName} (${this.object.attributeValue})`);

        if (this.object.abilityName != "") {
            template.push(`${this.object.abilityName} (${this.object.abilityValue})`);
        }

        // add selected Realms
        if (this.object.type == "wod.types.artpower") {
            if (this.object.selectedarttype == "") {
                ui.notifications.warn(game.i18n.localize("wod.dialog.power.noarttype"));
                return;
            }

            if (!this.object.isUnleashing) {
                this.object.canRoll = false;

                for (const realm of this.object.selectedRealms) {
                    if (realm.isselected) {
                        extraInfo.push(`${game.i18n.localize(realm.label)} (${realm.value})`);
                        this.object.canRoll = true;
                    }
                }

                if (!this.object.canRoll) {
                    ui.notifications.warn(game.i18n.localize("wod.dialog.power.missingrealm"));
                    return;
                }

                numSpecialDices = parseInt(this.actor.system.advantages.nightmare.temporary) + this.object.nightmareReplace;
                specialDiceText = game.i18n.localize('wod.dialog.power.nightmaredice');
            }
            else {
                extraInfo.push(`${game.i18n.localize('wod.dialog.power.unleashing')}`);
            }

            if (this.object.selectedarttype != undefined) {
                extraInfo.push(`${game.i18n.localize(this.object.selectedarttype)}`);
            }            
        }

        const numDices = parseInt(this.object.attributeValue) + parseInt(this.object.abilityValue) + parseInt(this.object.bonus);
        let specialityText = "";
        this.object.close = true;

        if (this.object.useSpeciality) {
            specialityText = this.object.specialityText;
        }

        if (CombatHelper.ignoresPain(this.actor)) {
            woundPenaltyVal = 0;
        }				
        else {
            woundPenaltyVal = parseInt(this.actor.system.health.damage.woundpenalty);
        }

        const powerRoll = new DiceRollContainer(this.actor);
        powerRoll.action = this.object.name;
        powerRoll.attribute = this.object.dice1;     
        powerRoll.ability = this.object.abilityKey;   
        powerRoll.origin = "power";
        powerRoll.numDices = numDices;
        powerRoll.numSpecialDices = numSpecialDices;
        powerRoll.specialDiceText = specialDiceText;
        powerRoll.woundpenalty = parseInt(woundPenaltyVal);
        powerRoll.difficulty = parseInt(this.object.difficulty);          
        powerRoll.speciality = this.object.useSpeciality;
        powerRoll.specialityText = specialityText;
        powerRoll.dicetext = template;
        powerRoll.bonus = parseInt(this.object.bonus);
        powerRoll.extraInfo = extraInfo;
        powerRoll.systemText = this.object.system;
        powerRoll.usewillpower = this.object.useWillpower;
        
        DiceRoller(powerRoll);
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }    

}
