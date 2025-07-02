import ActionHelper from "../../scripts/action-helpers.js";
import * as selectbox from "../../scripts/spec-select.js";

const { HandlebarsApplicationMixin } = foundry.applications.api

/**
 * Extend the base ActorSheetV2 document
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export default class PCActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
	
	constructor(actor, options) {
		super(actor, options);

		this.isGM = game.user.isGM;	
		this.isLimited = actor.limited;
		this.locked = false;
		this.isCharacter = true;
		this.variantOpen = false;		
	}

	get title() {
		return this.actor.isToken ? `[Token] ${this.actor.name}` : this.actor.name;
	}

	static DEFAULT_OPTIONS = {
		form: {
			submitOnChange: true,
			handler: PCActorSheet.onSubmitActorForm
		},
		classes: ["wod20", "wod-sheet", "mortal"],
		window: {
			icon: 'fa-solid fa-dice-d10',
			resizable: true
		},
		position: {
			width: 1000,
			height: 800
		},
		actions: {},
		dragDrop: []
	}

	static PARTS = {	
		tabs: {
			template: "systems/worldofdarkness/templates/actor/parts/navigation.hbs"
		},
		bio: {
			template: "systems/worldofdarkness/templates/actor/parts/bio.hbs"
		},
		stats: {
			template: "systems/worldofdarkness/templates/actor/parts/stats.hbs"
		}
	}

	

	splat = "";

	tabGroups = {
		primary: 'stats'
	}

	tabs = {
		bio: {
			id: 'bio',
			group: 'primary',
			title: 'LANG: BIO',
			icon: game.worldofdarkness.icons["mortal"].bio
		},
		stats: {
			id: 'stats',
			group: 'primary',
			title: 'LANG: CORE',
			icon: game.worldofdarkness.icons["mortal"].stats
		}
	}

	/* Read the tabs with data */
	getTabs () {
		const tabs = this.tabs

		for (const tab of Object.values(tabs)) {
			tab.active = this.tabGroups[tab.group] === tab.id
			tab.icon = game.worldofdarkness.icons[this.splat][tab.id];
			tab.cssClass = tab.active ? 'item active' : 'item';
		}

		return tabs
	}

	/* handle sheet control */
	_getHeaderControls () {
		//const controls = this.options.window.controls;
		const controls = super._getHeaderControls();

		return controls;
	}

	/** @override */
	async _prepareContext(options) {
		const data = await super._prepareContext();
		const actor = this.actor;

		let splatname = ( actor.system.settings.variantsheet === "" ? actor.type.toLowerCase() : actor.system.settings.variantsheet.toLowerCase());

		this.splat = ( splatname === "pc" ? "mortal" : splatname);

		CONFIG.worldofdarkness.sheetsettings.useSplatFonts = this.actor.system.settings.usesplatfont;	

		// Add the tabs
		data.tabs = this.getTabs();		

		data.config = CONFIG.worldofdarkness;	

		data.worldofdarkness = game.worldofdarkness;	

		data.userpermissions = ActionHelper._getUserPermissions(game.user);
		data.graphicsettings = ActionHelper._getGraphicSettings();

		data.locked = this.locked;
		data.isCharacter = this.isCharacter;
		data.isGM = this.isGM;

		data.actor = actor;

		console.log(`${data.actor.name} - (${data.actor.type})`);
		console.log(data.actor);

		return {
			...data
		}
	}	

	async _preparePartContext (partId, context, options) {
		context = { ...(await super._preparePartContext(partId, context, options)) }

		// Top-level variables
		const actor = this.actor

		// Only load what is neccessary
		switch (partId) {
			case 'bio':
				return prepareBioContext(context, actor);
			case 'stats':
				return prepareStatContext(context, actor);
		}

		return context
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		//Custom select text boxes
		selectbox.registerCustomSelectBoxes(html, this);

		// the menu
		html.find('[data-action="tab"]').on('click', event => {
			const tabId = event.currentTarget.dataset.tab;
			const group = event.currentTarget.dataset.group;

			// Update active tab in the correct group
			this.tabGroups[group] = tabId;

			// Re-render the sheet to update UI
			this.render();
		});

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
	}

	static async onSubmitActorForm (event, form, formData) {
		const target = event.target
		if (target.tagName === 'INPUT') {
			let value

			// Handle numbers and strings properly
			if (target.type === 'number') {
				value = parseInt(target.value)
			} else if (target.type === 'checkbox') {
				value = target.checked
			} else {
				value = target.value
			}

			// Make the update for the field
			this.actor.update({
				[`${target.name}`]: value
			})
		} else {
			// Process submit data
			const submitData = this._prepareSubmitData(event, form, formData)

			// Overrides
			const overrides = foundry.utils.flattenObject(this.actor.overrides)
			for (const k of Object.keys(overrides)) delete submitData[k]

			const submitDataFlat = foundry.utils.flattenObject(submitData)
			const updatedData = {
				[target.name]: submitDataFlat[target.name]
			}
			const expandedData = foundry.utils.expandObject(updatedData)

			// Update the actor data
			await this.actor.update(expandedData)
		}
	}

	async render(force = false, options = {}) {
		await super.render(force, options);

		const useSplatFonts = game.settings.get('worldofdarkness', 'useSplatFonts');
		const html = this.element[0];

		const langClass = {
			"de": "langDE",
			"es": "langES",
			"it": "langIT",
			"fr": "langFR",
			"pt-BR": "langPT",
			"sv": "langSV"
		}[CONFIG.language] ?? "langEN";

		html.classList.add(langClass);
		if (!useSplatFonts) html.classList.add("noSplatFont");
		if (CONFIG.worldofdarkness.darkmode) html.classList.add("dark-theme");
	}
}

export const prepareBioContext = async function (context, actor) {
  	context.tab = context.tabs.bio;

	context.appearance = actor.system.appearance;
	context.background = actor.system.background;
	context.roleplaytip = actor.system.roleplaytip;
	context.enrichedAppearance = await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.appearance, {async: true});
	context.enrichedBackground = await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.background, {async: true});
	context.enrichedRoleplaytip = await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.roleplaytip, {async: true});

  	return context;
}

export const prepareStatContext = async function (context, actor) {
  context.tab = context.tabs.stats;

  return context
}

function parseCounterStates(states) {
	return states.split(",").reduce((obj, state) => {
	  	const [k, v] = state.split(":");
	  	obj[k] = v;
	  	return obj;
	}, {});
}

