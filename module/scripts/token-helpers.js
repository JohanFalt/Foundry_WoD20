export default class TokenHelper {
    static async formShift(actor, fromForm, toForm) {        

        if (actor.type != CONFIG.worldofdarkness.sheettype.werewolf) {
            return;
        }

        if (fromForm == toForm) {
            return;
        }

        return;

		let foundToken = false;

		let token = await canvas.tokens.placeables.find(t => t.document.actorId === actor._id);
		if(token) foundToken = true;

		if (foundToken) {
            

            await this._clearForms(token, actor);
            //await token.document.toggleActiveEffect(this._getEffectData(toForm));
            await this._applyEffect(token, toForm, true);
            await this._applyActorEffect(actor, toForm, true);
		}			
    }

    static async _clearForms(token, actor) {
        if (token.document.hasStatusEffect("form_homid")) {
            //await token.document.toggleActiveEffect(this._getEffectData("wod.shapes.homid"));
            await this._applyEffect(token, "wod.shapes.homid", false);
            await this._applyActorEffect(actor, "wod.shapes.homid", false);
        }

        if (token.document.hasStatusEffect("form_glabro")) {
            //await token.document.toggleActiveEffect(this._getEffectData("wod.shapes.glabro"));
            await this._applyEffect(token, "wod.shapes.glabro", false);
            await this._applyActorEffect(actor, "wod.shapes.glabro", false);
        }

        if (token.document.hasStatusEffect("form_crinos")) {
            //await token.document.toggleActiveEffect(this._getEffectData("wod.shapes.crinos"));
            await this._applyEffect(token, "wod.shapes.crinos", false);
            await this._applyActorEffect(actor, "wod.shapes.crinos", false);
        }

        if (token.document.hasStatusEffect("form_hispo")) {
            //await token.document.toggleActiveEffect(this._getEffectData("wod.shapes.hispo"));
            await this._applyEffect(token, "wod.shapes.hispo", false);
            await this._applyActorEffect(actor, "wod.shapes.hispo", false);
        }

        if (token.document.hasStatusEffect("form_lupus")) {
            //await token.document.toggleActiveEffect(this._getEffectData("wod.shapes.lupus"));
            await this._applyEffect(token, "wod.shapes.lupus", false);
            await this._applyActorEffect(actor, "wod.shapes.lupus", false);
        }
    }

    static _getEffectData(toForm) {
        let effectData = "";

        if (toForm == "wod.shapes.homid") {
            effectData = {
                label: "form_homid",
                //label: game.i18n.localize("wod.shapes.homid"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_homid.svg"
            }
        }
        if (toForm == "wod.shapes.glabro") {
            effectData = {
                label: "form_glabro",
                //label: game.i18n.localize("wod.shapes.glabro"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_glabro.svg"
            }
        }
        if (toForm == "wod.shapes.crinos") {
            effectData = {
                label: "form_crinos",
                //label: game.i18n.localize("wod.shapes.crinos"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_crinos.svg"
            }
        }
        if (toForm == "wod.shapes.hispo") {
            effectData = {
                label: "form_hispo",
                //label: game.i18n.localize("wod.shapes.hispo"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_hispo.svg"
            }
        }
        if (toForm == "wod.shapes.lupus") {
            effectData = {
                label: "form_lupus",
                //label: game.i18n.localize("wod.shapes.lupus"),
                icon: "systems/worldofdarkness/assets/img/werewolf/form/form_lupus.svg"
            }
        }

        return effectData;
    }

    static async _applyEffect(token, form, active) {
        if (await token.document.toggleActiveEffect(this._getEffectData(form), {active: active})) {
            console.log("Turning on " + form);
        }
        else {
            console.log("Turning off " + form);
        }
    }

    static async _applyActorEffect(actor, form, active) {
        if (await actor.toggleActiveEffect(this._getEffectData(form), {active: active})) {
            console.log("Turning on " + form);
        }
        else {
            console.log("Turning off " + form);
        }
    }
}

/* 

export default class TokenHelper {
    static async formShift(actor, fromForm, toForm) {
        if (actor.type != CONFIG.worldofdarkness.sheettype.werewolf) {
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
} */