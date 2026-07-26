import DropHelper from "../module/scripts/drop-helpers.js";

const EXAMPLE_PC_ID = "ExamplePCTour001";
const VAMPIRE_MODERN_UUID = "Compendium.worldofdarkness.splats.Item.DzvMAiNxSLTy1pcH";
const VAMPIRE_FOLDER_ID = "LzJ6JKd9ysuHgk65";
const TEMPLATES_PACK = "worldofdarkness.splats";

const EXAMPLE_ACTORS = {
	ExampleWerewolf1: "systems/worldofdarkness/tours/data/werewolf.json",
	[EXAMPLE_PC_ID]: "systems/worldofdarkness/tours/data/actor-pc-tour.json"
};

export class TourHelper extends foundry.nue.Tour {

	constructor(config) {
		super(config);
	}

	/**
	 * Wait for the given timeout.
	 * @param {number} timeout The time to wait in milliseconds
	 * @returns {Promise<void>} A promise that resolves after the given timeout
	 */
	wait(timeout) {
		return new Promise((resolve) => setTimeout(resolve, timeout));
	}

	/**
	 * Resolve the first matching element from a selector or comma-separated list.
	 * @param {string} selector
	 * @returns {Element|null}
	 */
	_query(selector) {
		if (!selector) return null;
		for (const part of selector.split(",").map(s => s.trim()).filter(Boolean)) {
			const el = document.querySelector(part);
			if (el) return el;
		}
		return null;
	}

	/**
	 * Foundry v14 directories / sheets need fallback selectors; support comma-separated lists.
	 * @param {string} selector
	 * @returns {Element|null}
	 * @protected
	 */
	_getTargetElement(selector) {
		return this._query(selector);
	}

	/**
	 * Wait for a specific element to appear in the DOM.
	 * Supports comma-separated selector lists (first match wins).
	 * @param {string} selector The selector for the element to wait for
	 * @param {number} timeout The maximum time to wait
	 * @returns {Promise<Element>} A promise that resolves to the element, if it is found
	 */
	waitForElement(selector, timeout) {
		return new Promise((resolve, reject) => {
			const existing = this._query(selector);
			if (existing) {
				return resolve(existing);
			}

			const observer = new MutationObserver(() => {
				const found = this._query(selector);
				if (found) {
					resolve(found);
					observer.disconnect();
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});

			this.wait(timeout).then(() => {
				observer.disconnect();
				reject(new Error(`TourHelper: element not found for selector "${selector}"`));
			});
		});
	}

	async _preStep() {
		await super._preStep();
		if (!this.currentStep?.selector) return;

		try {
			await this.waitForElement(this.currentStep.selector, 5000);
		}
		catch (err) {
			console.warn(err);
		}
	}

	_activateSidebarTab(tab) {
		ui.sidebar?.changeTab?.(tab, "primary");
	}

	/**
	 * Create (if needed) an example actor from tours/data JSON.
	 * @param {string} actorId
	 * @returns {Promise<Actor|null>}
	 */
	async _ensureExampleActor(actorId) {
		let actor = game.actors.get(actorId);
		if (!actor) {
			const path = EXAMPLE_ACTORS[actorId];
			if (!path) {
				console.warn(`WoD Tour: No example actor data registered for id "${actorId}"`);
				return null;
			}

			const data = await foundry.utils.fetchJsonWithTimeout(path, {}, { int: 30000 });
			if (!data._id) data._id = actorId;

			[actor] = await Actor.create([data], { keepId: true });
			await this.wait(300);
		}

		// Older ExampleWerewolf1 copies may still lack embedded gift bonuses
		if (actorId === "ExampleWerewolf1") {
			await this._ensurePersuasionBonuses(actor);
		}

		this._activateSidebarTab("actors");
		ui.actors?.render(true);
		await this.wait(200);
		return actor;
	}

	async _ensurePersuasionBonuses(actor) {
		const persuasion = actor?.items.get("Y50pP5Ygo88tuvnn");
		if (!persuasion) return;

		const list = persuasion.system?.bonuslist;
		if (Array.isArray(list) && list.length > 0) return;

		await persuasion.update({
			"system.bonuslist": [
				{ name: "Charisma diff -1", settingtype: "charisma", type: "attribute_diff", value: -1, isactive: false },
				{ name: "Manipulation diff -1", settingtype: "manipulation", type: "attribute_diff", value: -1, isactive: false },
				{ name: "Appearance", settingtype: "appearance", type: "attribute_diff", value: -1, isactive: false }
			]
		});
	}

	async _ensureExamplePC() {
		return this._ensureExampleActor(EXAMPLE_PC_ID);
	}

	async _openActorSheet(actorId) {
		const actor = await this._ensureExampleActor(actorId);
		if (!actor) return null;
		await actor.sheet?.render(true);
		await this.wait(400);
		return actor;
	}

	async _openTemplatesPack() {
		const pack = game.packs.get(TEMPLATES_PACK);
		if (!pack) return;

		const packLi = document.querySelector(`li[data-pack="${TEMPLATES_PACK}"]`);
		if (packLi && !pack.apps?.some(a => a.rendered)) {
			const clickTarget = packLi.querySelector("[data-action='entry'], .compendium-name, .entry-name, h3, h4") ?? packLi;
			clickTarget.click();
			await this.wait(400);
		}

		if (!pack.apps?.some(a => a.rendered)) {
			await pack.render(true);
			await this.wait(400);
		}
		else {
			for (const app of pack.apps) {
				if (app.rendered) app.bringToFront?.();
			}
		}

		const folderSelectors = [
			`li[data-folder-id="${VAMPIRE_FOLDER_ID}"] button[data-action="toggleFolder"]`,
			`li[data-entry-id="${VAMPIRE_FOLDER_ID}"] button[data-action="toggleFolder"]`,
			`li[data-folder-id="${VAMPIRE_FOLDER_ID}"] .folder-header`,
			`li[data-entry-id="${VAMPIRE_FOLDER_ID}"] a.toggle`
		];

		for (const sel of folderSelectors) {
			const toggle = document.querySelector(sel);
			const row = toggle?.closest("li");
			if (toggle && row?.classList.contains("collapsed")) {
				toggle.click();
				await this.wait(200);
				break;
			}
		}

		const vampireFolder = Array.from(document.querySelectorAll(".directory-item.folder")).find(el => {
			const label = el.querySelector(".entry-name, h3, h4, label");
			return label?.textContent?.trim() === "Vampire the Masquerade" && el.classList.contains("collapsed");
		});
		if (vampireFolder) {
			vampireFolder.querySelector("button[data-action='toggleFolder'], a.toggle, .folder-header")?.click();
			await this.wait(200);
		}
	}

	async _applyVampireModernTemplate(actor) {
		if (!actor) return;

		const splat = await fromUuid(VAMPIRE_MODERN_UUID);
		if (!splat) {
			ui.notifications?.warn("WoD Tour: Could not find Vampire [modern] in the Templates pack.");
			return;
		}

		await DropHelper.DropSplatToActor(actor, splat);

		const sheet = actor.sheet;
		if (sheet) {
			if (sheet.locked) sheet.locked = false;
			await sheet.render(true);
		}

		await this.wait(400);
	}

	async _cleanupExamplePC() {
		if (this.id !== "pc-template-tour") return;

		const actor = game.actors.get(EXAMPLE_PC_ID);
		if (!actor) return;

		try {
			await actor.sheet?.close();
		}
		catch (err) {
			console.warn("WoD Tour: Failed to close PC Tour sheet", err);
		}

		try {
			await actor.delete();
			ui.actors?.render(true);
		}
		catch (err) {
			console.warn("WoD Tour: Failed to delete PC Tour actor", err);
		}
	}

	async complete() {
		await this._cleanupExamplePC();
		return super.complete();
	}

	exit() {
		void this._cleanupExamplePC();
		return super.exit();
	}

	_ensureTourVisible(itemSheet = null) {
		// Item windows often sit above the tour overlay/tooltip
		for (const el of [
			this.overlayElement,
			this.fadeElement,
			document.getElementById("tour"),
			document.querySelector(".tour"),
			document.querySelector(".tour-fade"),
			document.querySelector("#tooltip")
		]) {
			if (el instanceof HTMLElement) el.style.zIndex = "100000";
		}

		if (itemSheet?.setPosition) {
			try {
				itemSheet.setPosition({ left: 40, top: 80, height: 560 });
			}
			catch (err) {
				console.warn("WoD Tour: Could not reposition item sheet", err);
			}
		}
	}

	async _renderStep() {
		await super._renderStep();
		this._ensureTourVisible();
	}

	async _postStep() {
		await super._postStep();
		if (this.stepIndex < 0 || !this.hasNext)
			return;

		if (!this.currentStep?.action)
			return;

		let target = this.currentStep.target ? this.currentStep.target : this.currentStep.selector;

		switch (this.currentStep.action) {
			case "click":
				this._query(target)?.click();
				break;
			case "click-delay":
				this._query(target)?.click();
				await this.wait(300);
				break;
			case "scrollIntoView":
				this._query(target)?.scrollIntoView({ block: "start", inline: "nearest" });
				break;
			case "addWerewolf":
				this._activateSidebarTab("actors");
				await this._ensureExampleActor("ExampleWerewolf1");
				break;
			case "openActor": {
				const actorId = this.currentStep.actorId;
				if (actorId) await this._openActorSheet(actorId);
				break;
			}
			case "openItem": {
				const actorId = this.currentStep.actorId;
				const itemId = this.currentStep.itemId;
				const actor = actorId ? await this._ensureExampleActor(actorId) : null;
				const item = actor?.items.get(itemId);
				if (item) {
					await item.sheet?.render(true);
					this._ensureTourVisible(item.sheet);
					try {
						const sheetId = `#WoDItemSheet-Actor-${actorId}-Item-${itemId}`;
						await this.waitForElement(`${sheetId} [data-drop-area='bonus'], [data-drop-area='bonus']`, 5000);
						const bonusArea = this._query(`${sheetId} [data-drop-area='bonus'], [data-drop-area='bonus']`);
						bonusArea?.scrollIntoView({ block: "center", inline: "nearest" });
					}
					catch (err) {
						console.warn("WoD Tour: Bonuses section not found after opening item", err);
					}
					this._ensureTourVisible(item.sheet);
					await this.wait(200);
				}
				else {
					console.warn(`WoD Tour: Could not open item "${itemId}" on actor "${actorId}"`);
				}
				break;
			}
			case "closeItem": {
				const actorId = this.currentStep.actorId;
				const itemId = this.currentStep.itemId;
				const actor = actorId ? game.actors.get(actorId) : null;
				const item = actor?.items.get(itemId);
				if (item?.sheet?.rendered) {
					await item.sheet.close();
					await this.wait(300);
				}
				else {
					this._query(".wod-item a.close, .app.window-app.wod-item .header-button.close, [data-drop-area='bonus']")
						?.closest(".app, .application")
						?.querySelector("a.close, [data-action='close']")
						?.click();
					await this.wait(300);
				}
				break;
			}
			case "unlockSheet": {
				const actorId = this.currentStep.actorId;
				const actor = actorId ? game.actors.get(actorId) : null;
				const sheet = actor?.sheet;
				if (sheet) {
					sheet.locked = false;
					await sheet.render(false);
					await this.wait(300);
				}
				else {
					// Fallback: click the lock button if present
					this._query("button.lock-btn, i#unlockSheet")?.click();
					await this.wait(300);
				}
				break;
			}
			case "addPC": {
				this._activateSidebarTab("actors");
				await this._ensureExamplePC();
				break;
			}
			case "openPC": {
				await this._openActorSheet(EXAMPLE_PC_ID);
				break;
			}
			case "openTemplatesPack": {
				this._activateSidebarTab("compendium");
				await this.wait(200);
				await this._openTemplatesPack();
				break;
			}
			case "addVampireModernTemplate": {
				const actor = game.actors.get(EXAMPLE_PC_ID) ?? await this._ensureExamplePC();
				await this._openTemplatesPack();
				await this._applyVampireModernTemplate(actor);
				break;
			}
		}
	}
}
