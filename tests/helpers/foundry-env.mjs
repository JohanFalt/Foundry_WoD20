import { wod } from "../../module/config.js";

/**
 * Installs the subset of Foundry VTT globals that system modules read.
 *
 * Call this before importing anything under module/, because some modules read
 * globals while they are being loaded. Each test file runs in its own process
 * under node --test, so calling this once per file is enough.
 *
 * @param {object} [options]
 * @param {object} [options.config]   Overrides for CONFIG.worldofdarkness flags.
 * @param {object} [options.settings] Values returned by game.settings.get(scope, key).
 * @param {object[]} [options.actors] Plain actor objects returned by game.actors.get(id).
 * @param {object|null} [options.combat] Value of game.combat.
 * @returns {{ warnings: string[], chatMessages: object[], actors: Map<string, object>, renderedTemplates: object[] }}
 */
export function installFoundryEnv({ config = {}, settings = {}, actors = [], combat = null } = {}) {
    const warnings = [];
    const chatMessages = [];
    const renderedTemplates = [];
    const actorsById = new Map(actors.map(actor => [actor._id ?? actor.id, actor]));

    // Defaults mirror the values wod.js sets at startup, plus neutral rule flags.
    const worldofdarkness = {
        ...structuredClone(wod),
        lowestDifficulty: 2,
        useOnesSoak: false,
        useOnesDamage: false,
        usehandleOnes: false,
        handleOnes: 1,
        usespecialityAddSuccess: false,
        specialityAddSuccess: 1,
        usetenAddSuccess: false,
        tenAddSuccess: 1,
        useexplodingDice: false,
        explodingDice: "off",
        specialityAllowBotch: false,
        willpowerBonusDice: false,
        ...config
    };

    globalThis.CONFIG = { worldofdarkness };

    globalThis.game = {
        system: { id: "worldofdarkness", version: "7.4.0" },
        i18n: {
            localize: key => key,
            format: (key, data = {}) => `${key} ${JSON.stringify(data)}`
        },
        settings: {
            get: (scope, key) => settings[key]
        },
        actors: {
            get: id => actorsById.get(id)
        },
        combat
    };

    globalThis.Hooks = { on() {}, once() {}, call() {}, callAll() {} };

    globalThis.ui = {
        notifications: {
            warn: message => warnings.push(message),
            info() {},
            error() {}
        }
    };

    globalThis.ChatMessage = {
        getSpeaker: () => ({}),
        applyMode() {},
        create: async data => {
            chatMessages.push(data);
            return data;
        }
    };

    globalThis.canvas = { tokens: { placeables: [] } };

    globalThis.FormApplication = class {};

    globalThis.foundry = {
        utils: {
            duplicate: value => structuredClone(value)
        },
        applications: {
            api: {
                ApplicationV2: class {},
                HandlebarsApplicationMixin: Base => Base
            },
            handlebars: {
                renderTemplate: async (template, data) => {
                    renderedTemplates.push({ template, data });
                    return `<rendered ${template}>`;
                }
            }
        }
    };

    return { warnings, chatMessages, actors: actorsById, renderedTemplates };
}
