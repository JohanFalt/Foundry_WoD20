import { DiceRoller } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";
import ActionHelper from "../scripts/action-helpers.js";
import BonusHelper from "../scripts/bonus-helpers.js";
import CombatHelper from "../scripts/combat-helpers.js";

/**
 * PC Actor API Handler
 * 
 * Provides programmatic access to PC actor functions that are normally
 * accessed through the graphical interface.
 * 
 * IMPORTANT: This API is only available for PC actors (actor.type === "PC")
 */
export default class PCActorAPI {
    constructor(actor) {
        if (actor.type !== "PC") {
            throw new Error("PCActorAPI is only available for PC actors (actor.type === 'PC')");
        }
        this.actor = actor;
    }

    /**
     * Validates that the actor is a PC actor
     * @private
     */
    _validatePCActor() {
        if (this.actor.type !== "PC") {
            throw new Error("API is only available for PC actors (actor.type === 'PC')");
        }
    }

    _validateParameter(param) {
        if ((!param) || (param === "") || (param === undefined)) {
            return false;
        }

        return true;
    }

    /**
     * Validates and returns difficulty value
     * @param {*} difficulty - Difficulty value to validate
     * @returns {number} Validated difficulty as positive integer
     * @throws {Error} If difficulty is not a positive integer
     * @private
     */
    _validateDifficulty(difficulty) {
        if (difficulty === undefined || difficulty === null) {
            return null; // No difficulty override
        }
        
        const difficultyNum = parseInt(difficulty);
        if (isNaN(difficultyNum) || difficultyNum <= 0 || !Number.isInteger(difficultyNum)) {
            throw new Error(`difficulty must be a positive integer, got: ${difficulty}`);
        }
        
        return difficultyNum;
    }

    /**
     * Roll an attribute
     * @param {string} attributeKey - The attribute key (e.g. "strength", "dexterity")
     * @param {Object} options - Roll options
     * @param {number} options.difficulty - Difficulty level (default: 6)
     * @param {boolean} options.useWillpower - Use willpower (default: false)
     * @param {number} options.bonus - Bonus dice (default: 0)
     * @returns {Promise<number>} Number of successes
     */
    async rollAttribute(attributeKey, options = {}) {
        this._validatePCActor();

        if (!this._validateParameter(attributeKey)) {
            throw new Error("attributeKey is required");
        }

        let attribute = this.actor.system.attributes[attributeKey];

        if (!this._validateParameter(attribute)) {
            attribute = false;
        }

        if (!attribute) {
            throw new Error(`Attribute '${attributeKey}' not found on actor`);
        }
        else if (!attribute.isvisible) {
            throw new Error(`Attribute '${attributeKey}' is not visible`);
        }

        // Validate and get difficulty
        let difficulty = 6;

        if (options.difficulty !== undefined) {
            difficulty = this._validateDifficulty(options.difficulty);
        }

        const useWillpower = options.useWillpower ?? false;
        const bonus = options.bonus ?? 0;

        // Get attribute value (total includes bonuses)
        const attributeValue = parseInt(attribute.total) || 0;

        // Calculate number of dice
        const numDices = attributeValue + bonus;

        // Get attribute name for display
        let attributeName = "";
        if (CONFIG.worldofdarkness.attributeSettings == "20th") {
            attributeName = game.i18n.localize(CONFIG.worldofdarkness.attributes20[attributeKey]);
        } else if (CONFIG.worldofdarkness.attributeSettings == "5th") {
            attributeName = game.i18n.localize(CONFIG.worldofdarkness.attributes[attributeKey]);
        } else {
            attributeName = attribute.label;
        }

        // Check for wound penalty
        let woundPenalty = 0;
        if (!CombatHelper.ignoresPain(this.actor)) {
            woundPenalty = parseInt(this.actor.system.health.damage.woundpenalty) || 0;
        }

        // Create dice roll container
        const diceRoll = new DiceRollContainer(this.actor);
        diceRoll.action = attributeName;
        diceRoll.attribute = attributeKey;
        diceRoll.ability = "noselected";
        diceRoll.dicetext = [`${attributeName} (${attributeValue})`];
        diceRoll.bonus = bonus;
        diceRoll.origin = "general";
        diceRoll.numDices = numDices;
        diceRoll.woundpenalty = woundPenalty;
        diceRoll.difficulty = difficulty;
        diceRoll.speciality = false;
        diceRoll.usewillpower = useWillpower;
        diceRoll.specialityText = "";

        // Roll dice
        const success = await DiceRoller(diceRoll);
        return success;
    }

    /**
     * Roll an ability, optionally combined with an attribute
     * @param {string} abilityId - The ability item ID
     * @param {string|null} attributeKey - Optional attribute key to combine with (null = no attribute)
     * @param {Object} options - Roll options
     * @param {number} options.difficulty - Difficulty level (default: 6)
     * @param {boolean} options.useWillpower - Use willpower (default: false)
     * @param {number} options.bonus - Bonus dice (default: 0)
     * @returns {Promise<number>} Number of successes
     */
    async rollAbility(abilityId, attributeKey = null, options = {}) {
        this._validatePCActor();

        if (!this._validateParameter(abilityId)) {
            throw new Error("abilityId is required");
        }

        // Get ability item
        const ability = this.actor.items.get(abilityId) !== undefined ? this.actor.items.get(abilityId) : this.actor.items.filter(item => item.type === "Ability" && item.system.settings.isvisible && item.system.id === abilityId)[0];        

        if (!this._validateParameter(ability)) {
            throw new Error(`Ability with ID '${abilityId}' not found on actor`);
        }        
        
        if (ability.type !== "Ability") {
            throw new Error(`Item with ID '${abilityId}' is not an Ability`);
        }
        else if (!ability.system.settings?.isvisible) {
            throw new Error(`Ability '${ability.name}' is not visible`);
        }

        // Validate and get difficulty
        let difficulty = 6;
        if (options.difficulty !== undefined) {
            difficulty = this._validateDifficulty(options.difficulty);
        }
        const useWillpower = options.useWillpower ?? false;
        const bonus = options.bonus ?? 0;

        // Get ability value
        const abilityValue = parseInt(ability.system.value) || 0;
        const abilityName = game.i18n.localize(ability.system.label) || ability.name;

        // Get attribute value if provided
        let attributeValue = 0;
        let attributeName = "";
        let attributeKeyFinal = "noselected";

        if (attributeKey) {
            const attribute = this.actor.system.attributes[attributeKey];
            if (!attribute) {
                throw new Error(`Attribute '${attributeKey}' not found on actor`);
            }
            if (!attribute.isvisible) {
                throw new Error(`Attribute '${attributeKey}' is not visible`);
            }
            attributeValue = parseInt(attribute.total) || 0;
            attributeKeyFinal = attributeKey;

            if (CONFIG.worldofdarkness.attributeSettings == "20th") {
                attributeName = game.i18n.localize(CONFIG.worldofdarkness.attributes20[attributeKey]);
            } else if (CONFIG.worldofdarkness.attributeSettings == "5th") {
                attributeName = game.i18n.localize(CONFIG.worldofdarkness.attributes[attributeKey]);
            } else {
                attributeName = attribute.label;
            }
        }

        // Calculate number of dice
        const numDices = attributeValue + abilityValue + bonus;

        // Check for wound penalty
        let woundPenalty = 0;
        if (!CombatHelper.ignoresPain(this.actor)) {
            woundPenalty = parseInt(this.actor.system.health.damage.woundpenalty) || 0;
        }

        // Build dice text
        const diceText = [];
        if (attributeKey) {
            diceText.push(`${attributeName} (${attributeValue})`);
        }
        diceText.push(`${abilityName} (${abilityValue})`);

        // Check for speciality
        const hasSpeciality = ability.system.value >= 4 && ability.system.speciality;
        const specialityText = hasSpeciality ? ability.system.speciality : "";

        // Create dice roll container
        const diceRoll = new DiceRollContainer(this.actor);
        diceRoll.action = abilityName;
        diceRoll.attribute = attributeKeyFinal;
        diceRoll.ability = abilityId;
        diceRoll.dicetext = diceText;
        diceRoll.bonus = bonus;
        diceRoll.origin = "general";
        diceRoll.numDices = numDices;
        diceRoll.woundpenalty = woundPenalty;
        diceRoll.difficulty = difficulty;
        diceRoll.speciality = hasSpeciality;
        diceRoll.usewillpower = useWillpower;
        diceRoll.specialityText = specialityText;

        // Roll dice
        const success = await DiceRoller(diceRoll);
        return success;
    }

    /**
     * Roll an advantage
     * @param {string} advantageId - The advantage item ID
     * @param {Object} options - Roll options
     * @param {number} options.difficulty - Difficulty level (default: 6)
     * @param {boolean} options.useWillpower - Use willpower (default: false)
     * @param {number} options.bonus - Bonus dice (default: 0)
     * @returns {Promise<number|false>} Number of successes, or false if advantage cannot be rolled
     */
    async rollAdvantage(advantageId, options = {}) {
        this._validatePCActor();

        if (!this._validateParameter(advantageId)) {
            throw new Error("advantageId is required");
        }

        // Get ability item
        const advantage = this.actor.items.get(advantageId) !== undefined ? this.actor.items.get(advantageId) : this.actor.items.filter(item => item.type === "Advantage" && item.system.settings.isvisible && item.system.id === advantageId)[0];        

        if (!advantage) {
            throw new Error(`Advantage with ID '${advantageId}' not found on actor`);
        }

        if (advantage.type !== "Advantage") {
            throw new Error(`Item with ID '${advantageId}' is not an Advantage`);
        }

        if (!advantage.system.settings?.isvisible) {
            throw new Error(`Advantage '${advantage.name}' is not visible`);
        }

        // Check if advantage can be rolled
        if (advantage.system.settings.useroll === false) {
            console.warn(`WoDAPI | rollAdvantage - Advantage '${advantage.name}' (${advantageId}) cannot be rolled (useroll === false)`);
            return false;
        }

        // Validate and get difficulty
        let difficulty = 6;
        if (options.difficulty !== undefined) {
            difficulty = this._validateDifficulty(options.difficulty);
        }
        const useWillpower = options.useWillpower ?? false;
        const bonus = options.bonus ?? 0;

        // Get advantage roll value
        // For PC actors, advantages are stored in both items and system.advantages
        // The roll value should be calculated by the item's prepareData
        const advantageRollValue = parseInt(advantage.system.roll) || 0;

        // if (advantageRollValue <= 0) {
        //     throw new Error(`Advantage '${advantage.name}' has no roll value (roll: ${advantageRollValue})`);
        // }

        // Get advantage name for display
        const advantageName = game.i18n.localize(advantage.system.label) || advantage.name;

        // Calculate number of dice
        const numDices = advantageRollValue + bonus;

        // Check for wound penalty
        let woundPenalty = 0;
        if (!CombatHelper.ignoresPain(this.actor)) {
            woundPenalty = parseInt(this.actor.system.health.damage.woundpenalty) || 0;
        }

        // Create dice roll container
        const diceRoll = new DiceRollContainer(this.actor);
        diceRoll.action = advantageName;
        diceRoll.attribute = "noselected";
        diceRoll.ability = "noselected";
        diceRoll.dicetext = [`${advantageName} (${advantageRollValue})`];
        diceRoll.bonus = bonus;
        diceRoll.origin = "general";
        diceRoll.numDices = numDices;
        diceRoll.woundpenalty = woundPenalty;
        diceRoll.difficulty = difficulty;
        diceRoll.speciality = false;
        diceRoll.usewillpower = useWillpower;
        diceRoll.specialityText = "";

        // Roll dice
        const success = await DiceRoller(diceRoll);
        return success;
    }

    /**
     * Use a feature (background, merit, flaw, etc.)
     * @param {string} featureId - The feature item ID
     * @param {Object} options - Feature usage options
     * @param {number} options.difficulty - Difficulty level (not used directly, dialog handles this)
     * @returns {Promise<Object|false>} Status object indicating dialog was opened, or false if feature cannot be rolled
     */
    async useFeature(featureId) {
        this._validatePCActor();

        if (!featureId) {
            throw new Error("featureId is required");
        }

        // Get feature item
        const feature = this.actor.items.get(featureId);
        if (!feature) {
            throw new Error(`Feature with ID '${featureId}' not found on actor`);
        }

        if ((feature.type !== "Feature") && (feature.type !== "Trait")) {
            throw new Error(`Item with ID '${featureId}' is not a Feature item`);
        }

        // Check if feature can be rolled
        if (feature.system.isrollable === false) {
            console.warn(`WoDAPI | useFeature - Feature '${feature.name}' (${featureId}) cannot be rolled (isrollable === false)`);
            return false;
        }

        // Create dataset object that ActionHelper.RollDialog expects
        const dataset = {
            rollitem: "true",
            itemid: featureId,
            object: "Item"
        };

        // Call ActionHelper.RollDialog (opens dialog, returns void)
        await ActionHelper.RollDialog(dataset, this.actor);
        return true;
    }

    /**
     * Use a combat weapon (melee or ranged)
     * @param {string} itemId - The weapon item ID
     * @param {Object} options - Weapon usage options
     * @param {string} options.action - Action type: "attack" (default) or "damage"
     * @param {number} options.difficulty - Difficulty level (not used directly, dialog handles this)
     * @returns {Promise<Object>} Status object indicating dialog was opened
     * @throws {Error} If item is not a weapon (armor is not supported)
     */
    async useCombatItem(itemId, options = {}) {
        this._validatePCActor();

        if (!itemId) {
            throw new Error("itemId is required");
        }

        // Get item
        const item = this.actor.items.get(itemId);
        if (!item) {
            throw new Error(`Item with ID '${itemId}' not found on actor`);
        }

        // Validate item type (only weapons, not armor)
        const validTypes = ["Melee Weapon", "Ranged Weapon"];
        if (!validTypes.includes(item.type)) {
            throw new Error(`Item '${item.name}' is not a weapon (must be Melee Weapon or Ranged Weapon). Armor cannot be used with useCombatItem().`);
        }

        // Determine action type
        let action = options.action || "attack";
        
        // Validate action
        if (action !== "attack" && action !== "damage") {
            throw new Error(`Invalid action '${action}'. Must be "attack" or "damage"`);
        }

        // Map API action to internal action type
        let internalAction;
        if (action === "damage") {
            // Damage works for all weapon types
            internalAction = "Damage";
        } else if (action === "attack") {
            // Attack: map based on item type
            if (item.type === "Melee Weapon") {
                internalAction = "Melee";
            } else if (item.type === "Ranged Weapon") {
                internalAction = "Ranged";
            }
        }

        // Create dataset object that ActionHelper.RollDialog expects
        const dataset = {
            rollitem: "true",
            itemid: itemId,
            object: internalAction
        };

        try {
            // Call ActionHelper.RollDialog (this opens a dialog, doesn't return result)
            await ActionHelper.RollDialog(dataset, this.actor);

            return true;
        } catch (error) {
            throw new Error(`Failed to use combat item: ${error.message}`);
        }
    }

    /**
     * Use a power
     * @param {string} powerId - The power item ID
     * @param {Object} options - Power usage options
     * @param {number} options.difficulty - Difficulty level
     * @param {boolean} options.useWillpower - Use willpower
     * @returns {Promise<Object>} Status object indicating dialog was opened
     */
    async usePower(powerId) {
        this._validatePCActor();

        if (!powerId) {
            throw new Error("powerId is required");
        }

        // Get power item
        const power = this.actor.items.get(powerId);
        if (!power) {
            throw new Error(`Power with ID '${powerId}' not found on actor`);
        }

        // Accept both Power and Rote item types
        if (power.type !== "Power" && power.type !== "Rote") {
            throw new Error(`Item with ID '${powerId}' is not a Power or Rote`);
        }

        // Get power type from system.type
        // For Rote items, system.type should be "wod.types.rote"
        const powerType = power.system.type || "";

        // Create dataset object that ActionHelper.RollDialog expects
        const dataset = {
            rollitem: "true",
            itemid: powerId,
            object: powerType
        };

        try {
            // Call ActionHelper.RollDialog (this opens a dialog, doesn't return result)
            await ActionHelper.RollDialog(dataset, this.actor);

            return {
                success: true,
                dialogOpened: true,
                powerId: powerId,
                powerName: power.name,
                powerType: powerType
            };
        } catch (error) {
            throw new Error(`Failed to use power: ${error.message}`);
        }
    }

    /**
     * Get item ID by item name
     * @param {string} itemName - The item name to search for
     * @returns {Promise<string|false>} Item ID if exactly one item found, false if multiple or none found
     */
    async getItemId(itemName) {
        this._validatePCActor();

        if (!itemName) {
            throw new Error("itemName is required");
        }

        if (typeof itemName !== "string") {
            throw new Error("itemName must be a string");
        }

        // Search for items with matching name
        const matchingItems = this.actor.items.filter(item => item.name === itemName);

        if (matchingItems.length === 0) {
            console.warn(`WoDAPI | getItemId - No item found with name '${itemName}' on actor '${this.actor.name}'`);
            return false;
        }

        if (matchingItems.length > 1) {
            console.warn(`WoDAPI | getItemId - More than one item with name '${itemName}' found (${matchingItems.length} items). Need to use precise item._id`);
            return false;
        }

        // Exactly one match found
        return matchingItems[0]._id;
    }

    /**
     * Get ability by system.id or item _id
     * @param {string} abilityId - The ability system.id (e.g. "primalurge") or item _id
     * @returns {Item|false} Ability item if found, false otherwise
     */
    getAbility(abilityId) {
        this._validatePCActor();

        if (!abilityId) {
            throw new Error("abilityId is required");
        }

        if (typeof abilityId !== "string") {
            throw new Error("abilityId must be a string");
        }

        // Try to find by system.id first (most common use case)
        const abilityById = this.actor.items.find(item => 
            item.type === "Ability" && 
            item.system?.id === abilityId
        );

        if (abilityById) {
            return abilityById;
        }

        // Fallback: try to get by item _id
        const abilityByItemId = this.actor.items.get(abilityId);
        if (abilityByItemId && abilityByItemId.type === "Ability") {
            return abilityByItemId;
        }

        // Not found
        return false;
    }

    /**
     * Get advantage by system.id or item _id
     * @param {string} advantageId - The advantage system.id (e.g. "willpower", "selfcontrol", "rage", "arete") or item _id
     * @returns {Item|false} Advantage item if found, false otherwise
     */
    getAdvantage(advantageId) {
        this._validatePCActor();

        if (!advantageId) {
            throw new Error("advantageId is required");
        }

        if (typeof advantageId !== "string") {
            throw new Error("advantageId must be a string");
        }

        // Try to find by system.id first (most common use case)
        const advantageById = this.actor.items.find(item => 
            item.type === "Advantage" && 
            item.system?.id === advantageId
        );

        if (advantageById) {
            return advantageById;
        }

        // Fallback: try to get by item _id
        const advantageByItemId = this.actor.items.get(advantageId);
        if (advantageByItemId && advantageByItemId.type === "Advantage") {
            return advantageByItemId;
        }

        // Not found
        return false;
    }

    /**
     * Modify actor health
     * @param {string} damageType - Type of damage ("bashing", "lethal", "aggravated")
     * @param {number} amount - Amount of damage (positive = add damage, negative = remove damage)
     * @param {Object} options - Modification options
     * @param {boolean} options.heal - If true, treat amount as healing (default: false)
     * @returns {Promise<Object>} Updated health data
     */
    async modifyHealth(damageType, amount, options = {}) {
        this._validatePCActor();

        if (!damageType) {
            throw new Error("damageType is required");
        }

        const validTypes = ["bashing", "lethal", "aggravated"];
        if (!validTypes.includes(damageType)) {
            throw new Error(`Invalid damageType '${damageType}'. Must be one of: ${validTypes.join(", ")}`);
        }

        if (typeof amount !== "number") {
            throw new Error("amount must be a number");
        }

        const heal = options.heal ?? false;

        // Get current health damage
        const actorData = foundry.utils.duplicate(this.actor);
        let currentDamage = parseInt(actorData.system.health.damage[damageType]) || 0;

        // Apply modification
        if (heal) {
            // Healing: subtract from damage
            currentDamage = Math.max(0, currentDamage - Math.abs(amount));
        } else {
            // Damage: add to current damage
            currentDamage = Math.max(0, currentDamage + amount);
        }

        // Update health damage
        actorData.system.health.damage[damageType] = currentDamage;

        // Ensure values don't go negative
        if (parseInt(actorData.system.health.damage.bashing) < 0) {
            actorData.system.health.damage.bashing = 0;
        }
        if (parseInt(actorData.system.health.damage.lethal) < 0) {
            actorData.system.health.damage.lethal = 0;
        }
        if (parseInt(actorData.system.health.damage.aggravated) < 0) {
            actorData.system.health.damage.aggravated = 0;
        }

        // Update actor (this will trigger _handleWoundLevelCalculations automatically)
        actorData.system.settings.isupdated = false;
        await this.actor.update(actorData);

        // Return updated health data
        return {
            bashing: parseInt(this.actor.system.health.damage.bashing) || 0,
            lethal: parseInt(this.actor.system.health.damage.lethal) || 0,
            aggravated: parseInt(this.actor.system.health.damage.aggravated) || 0,
            woundlevel: this.actor.system.health.damage.woundlevel || "",
            woundpenalty: parseInt(this.actor.system.health.damage.woundpenalty) || 0
        };
    }
}

