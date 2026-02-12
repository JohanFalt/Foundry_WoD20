import WoDItemSheetV2 from "./item-sheet-v2.js";
import SelectHelper from "../../scripts/select-helpers.js";



const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the base ActorSheetV2 document
 * @extends {WoDItemSheetV2}
 */

export default class SphereItemSheet extends HandlebarsApplicationMixin(WoDItemSheetV2) {


    static DEFAULT_OPTIONS = {
        position: {
            width: 750,
            height: 750
        }
    }

    static PARTS = {
        header: {
            template: 'systems/worldofdarkness/templates/items/parts/header-sheet.hbs'
        },
        stats: {
            template: 'systems/worldofdarkness/templates/items/sphere-sheet.hbs'
        }
    }

    splat = "";

	tabGroups = {
		primary: 'stats'
	}

	tabs = {
		stats: {
			id: 'stats',
			group: 'primary'
		}
	}

    /** @override */
    async _prepareContext(options) {
        const data = await super._prepareContext();
        const item = this.item;
        const actor = this.item.actor;

        data.listData = SelectHelper.SetupItem(item);
        //data.canEdit = this.item.isOwner || game.user.isGM;	

        if (item.actor != null) {
			data.hasActor = true;
			data.actor = item.actor;
		}
		else {
			data.hasActor = false;
		}

        data.item = item;

        console.log(`${data.item.name} - (${data.item.type})`);
        console.log(data.item);

        return {
            ...data
        }
    }

    async _preparePartContext (partId, context, options) {
        context = { ...(await super._preparePartContext(partId, context, options)) }

        // Top-level variables
        const item = this.item

        // Only load what is neccessary
        switch (partId) {
            case 'stats':
                return prepareStatContext(context, item);
        }

        return context
    }
}

export const prepareStatContext = async function (context, item) {
    context.tab = context.tabs.stats;

    context.description = item.system.description;
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, {async: true});

    return context
}