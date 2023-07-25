export default class TokenHelper {
    static async formShift(actor, fromForm, toForm) {
        if (actor.type != CONFIG.wod.sheettype.werewolf) {
            return;
        }

        if (fromForm == toForm) {
            return;
        }

		let foundToken = false;
        let visible = undefined;

		let token = await canvas.tokens.placeables.find(t => t.document.actorId === actor._id);
		if(token) foundToken = true;

		if (foundToken) {
            await this._clearForms(token);
            if (await token.document.toggleActiveEffect(await this._getEffectData(toForm))) {
                // effect was applied
            }
		}			
    }

    static async _clearForms(token) {
        if (await token.document.hasStatusEffect("form_homid")) {
            if (!await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.homid"))) {
                // effect was removed
            }
        }

        if (await token.document.hasStatusEffect("form_glabro")) {
            if (!await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.glabro"))) {
                // effect was removed
            }
        }

        if (await token.document.hasStatusEffect("form_crinos")) {
            if (!await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.crinos"))) {
                // effect was removed
            }
        }

        if (await token.document.hasStatusEffect("form_hispo")) {
            if (!await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.hispo"))) {
                // effect was removed
            }
        }

        if (await token.document.hasStatusEffect("form_lupus")) {
            if (!await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.lupus"))) {
                // effect was removed
            }
        }
    }

    static async _getEffectData(toForm) {
        let effectData = "";

        if (toForm == "wod.shapes.homid") {
            effectData = {
                id: "form_homid",
                label: game.i18n.localize("wod.shapes.homid"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_homid.svg"
            }
        }
        if (toForm == "wod.shapes.glabro") {
            effectData = {
                id: "form_glabro",
                label: game.i18n.localize("wod.shapes.glabro"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_glabro.svg"
            }
        }
        if (toForm == "wod.shapes.crinos") {
            effectData = {
                id: "form_crinos",
                label: game.i18n.localize("wod.shapes.crinos"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_crinos.svg"
            }
        }
        if (toForm == "wod.shapes.hispo") {
            effectData = {
                id: "form_hispo",
                label: game.i18n.localize("wod.shapes.hispo"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_hispo.svg"
            }
        }
        if (toForm == "wod.shapes.lupus") {
            effectData = {
                id: "form_lupus",
                label: game.i18n.localize("wod.shapes.lupus"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_lupus.svg"
            }
        }

        return effectData;
    }
}