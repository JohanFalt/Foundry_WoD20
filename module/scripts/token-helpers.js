export default class TokenHelper {
    static async formShift(actor, fromForm, toForm) {
        if (actor.type != CONFIG.wod.sheettype.werewolf) {
            return;
        }

        if (fromForm == toForm) {
            return;
        }

		let foundToken = false;

		let token = await canvas.tokens.placeables.find(t => t.data.actorId === actor._id);
		if(token) foundToken = true;

		if (foundToken) {
            await this._clearForms(token);
            await token.document.toggleActiveEffect(await this._getEffectData(toForm));
		}			
    }

    static async _clearForms(token) {
        if (await token.document.hasStatusEffect("form_homid")) {
            await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.homid"));
        }

        if (await token.document.hasStatusEffect("form_glabro")) {
            await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.glabro"));
        }

        if (await token.document.hasStatusEffect("form_crinos")) {
            await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.crinos"));
        }

        if (await token.document.hasStatusEffect("form_hispo")) {
            await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.hispo"));
        }

        if (await token.document.hasStatusEffect("form_lupus")) {
            await token.document.toggleActiveEffect(await this._getEffectData("wod.shapes.lupus"));
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