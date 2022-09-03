import { rollDice } from "../scripts/roll-dice.js";
import { DiceRoll } from "../scripts/roll-dice.js";

/**
    * Handles the information needed to use magic.
    * @name
    * @selectedSpheres
    * @difficulty
    * @description
    * @spelltype
    * @hasWitnesses
    * @isRote
*/
export class Rote {
    constructor(item) {
        this.name = "";
        this.selectedSpheres = [];
        this.description = "";        

        this.check_instrumentPerson = false;
		this.check_instrumentUnique = false;
        this.check_instrumentWithout = false;
        this.check_instrumentUnnecessary = false;

        this.check_resonanceAppropriate = false;
        this.check_resonanceOpposed = false;
        this.check_resonanceMysic = false;

        this.check_timeFast = false;
        this.check_timeBackwards = false;

        this.check_targetDistant = false;

        this.select_instrumentUnfamiliar = 0;
        this.select_instrumentPersonalItem = 0;

        this.select_spendingTime = 0;

        this.select_researchDone = 0;
        this.select_nodePresence = 0;
        this.select_effectsSeveral = 0;
        this.select_mageDistracted = 0;
        this.select_mageAvatarConflict = 0;
        this.select_dominoEffect = 0;
        this.select_deedOutlandish = 0;

        this.quintessence = 0;      
        
        this.spelltype = "";
        this.hasWitnesses = false;

        this.areteModifier = 0;

        this.baseDifficulty = -1;           // difficulty based on the selected spheres/ spell type / witness
        this.difficultyModifier = 0;        // if other modifiers not listed are added
        this.sumSelectedDifficulty = 0;
        this.totalDifficulty = 0;           // all in all difficulty

        this.useSpeciality = false;

        this.isRote = false;
        this.canCast = false;
        this.close = false;

        this.isExtendedCasting = false;
        this.totalSuccesses = 0;

        if (item != undefined) {
            this.name = item["name"];

            for (const sphere in CONFIG.wod.allSpheres) {
                if (item.system[sphere] > 0) {
                    this.selectedSpheres[sphere] = item.system[sphere];
                }
            }

            //this.selectedSpheres = item.system["selectedSpheres"];
            if (item.system["description"] != "") {
                this.description = item.system["description"];
            }

            if (item.system["spelltype"] != "") {
                this.spelltype = item.system["spelltype"];
            }

            this.check_instrumentPerson = item.system.instrument["ispersonalized"];
		    this.check_instrumentUnique = item.system.instrument["isunique"];
		    this.select_spendingTime = item.system["spendingtime"];

            this.isExtendedCasting = item.system["isextended"];

            this.isRote = true;
        }
    }

    _highestRank() {
        let highestRank = -1;

        for (const sphere in this.selectedSpheres) {
            let rank = this.selectedSpheres[sphere];

            if (rank > 0) {
                if (highestRank < rank) {
                    highestRank = rank;
                }
            }
        }

        return highestRank;
    }

}

export class DialogAreteCasting extends FormApplication {
    constructor(actor, rote) {
        super(rote, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;        

        if (rote.isRote) {
            this.options.title = `${this.actor.name} - ${game.i18n.localize("wod.dialog.aretecasting.casting")} ${rote.name}`;
        }
        else {
            this.options.title = `${this.actor.name} - ${game.i18n.localize("wod.dialog.aretecasting.castingspell")}`;
        }
    }


    /**
        * Extend and override the default options used by the 5e Actor Sheet
        * @returns {Object}
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["aretecasting-dialog", "mageDialog"],
            template: "systems/worldofdarkness/templates/dialogs/dialog-aretecasting.html",
            closeOnSubmit: false,
            submitOnChange: true,
            resizable: true
        });
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.wod;
        data.actorData = this.actor.system;          // used in the dialog html

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this._setupDotCounters(html);

        html
            .find(".resource-value > .resource-value-step")
            .click(this._onDotSphereChange.bind(this));
        html
            .find(".resource-value > .resource-value-empty")
            .click(this._onDotSphereEmpty.bind(this));

        html
            .find('.actionbutton')
            .click(this._castSpell.bind(this));

        html
            .find('.closebutton')
            .click(this._closeForm.bind(this));
    }

    _setupDotCounters(html) {
        const data = this.getData();

		html.find(".resource-value").each(function () {
            const sphere = this.dataset.name;

            if (data.object?.selectedSpheres[sphere] > 0) {
                const value = Number(data.object?.selectedSpheres[sphere]);

                $(this)
                    .find(".resource-value-step")
                    .each(function (i) {
                        if (i + 1 <= value) {
                            $(this).addClass("active");
                        }
                    });
            }
		});
	}

    async _updateObject(event, formData){
        if (this.object.close) {
            this.close();
            return;
        }

        event.preventDefault();    
        
        let totalDiff = 0;

        for (const value in formData) {
            if ((value.startsWith('object.check_')) && (formData[value])) {
                let elementName = '[name="'+value+'"]';
                totalDiff += parseInt(document.querySelector(elementName+':checked').value);
            }

            if (value.startsWith('object.select_')) {
                totalDiff += parseInt(formData[value]);
            }
        }

        this.object.quintessence = parseInt(formData["object.quintessence"]);
        this.object.sumSelectedDifficulty = parseInt(totalDiff);
        this.object.difficultyModifier = parseInt(formData["object.difficultyModifier"]);

        if (formData["object.spelltype"] != "null") {
            this.object.spelltype = formData["object.spelltype"];
        }
        else {
            this.object.spelltype = "";
        }
        
        this.object.witnesses = formData["object.witnesses"];
        this.object.isExtendedCasting = formData["object.isExtendedCasting"];

        this.object.useSpeciality = formData["specialty"];
        
        this.object.areteModifier = parseInt(formData["object.areteModifier"]);

        this.object.canCast = this._calculateDifficulty(false);        
    }

  
    /* Clears the clicked sphere */
    _onDotSphereEmpty(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        const type = dataset.type;    

        const parent = $(element.parentNode);
        const sphere = parent[0].dataset.name;
        const steps = parent.find(".resource-value-step");        

        steps.removeClass("active");

        this.object.selectedSpheres = this._changedSelectedSphere(this.object.selectedSpheres, sphere, 0);   
        this.object.canCast = this._calculateDifficulty(false);     
    }

    /* sets what level the clicked sphere is to be using */
    _onDotSphereChange(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        const type = dataset.type;

        const parent = $(element.parentNode);
        const index = Number(dataset.index);
        const sphere = parent[0].dataset.name;
        const steps = parent.find(".resource-value-step");

        if (index < 0 || index > steps.length) {
            return;
        }        

        steps.removeClass("active");

        steps.each(function (i) {
            if (i <= index) {
                $(this).addClass("active");
            }
        });

        this.object.selectedSpheres = this._changedSelectedSphere(this.object.selectedSpheres, sphere, parseInt(index + 1));
        this.object.canCast = this._calculateDifficulty(false);
    }

    /* clicked on cast Spell */
    async _castSpell(event) {
        let templateHTML = "";
        let specialityRoll = false;
        let specialityText = "";

        this.object.canCast = this._calculateDifficulty(true);

        if (this.object.canCast) {
            if (this.object.isRote) {
                templateHTML = `<h2>${this.object.name}</h2>`;
            }
            else {
                templateHTML = `<h2>${game.i18n.localize("wod.dialog.aretecasting.castingarete")}</h2>`;
            }
            

            if (parseInt(this.object.areteModifier) > 0) {
                templateHTML += game.i18n.localize("wod.dialog.aretecasting.aretebonus") + ` +${this.object.areteModifier}<br />`;
            }
            else if (parseInt(this.object.areteModifier) < 0) {
                templateHTML += game.i18n.localize("wod.dialog.aretecasting.aretepenalty") + ` -${this.object.areteModifier}<br />`;
            }

            if (this.object.spelltype == "coincidental") {
                templateHTML += game.i18n.localize("wod.spheres.coincidentalspell") + `<br /><br />`;
            }
            else if (this.object.spelltype == "vulgar") {
                if (this.object.witnesses) {
                    templateHTML += game.i18n.localize("wod.spheres.vulgarspellwitness") + `<br /><br />`;
                }
                else {
                    templateHTML += game.i18n.localize("wod.spheres.vulgarspell") + `<br /><br />`;
                }
            }

            if (this.object.quintessence < 0) {
                const spentPoints = this.object.quintessence * -1;
                templateHTML += game.i18n.localize("wod.dialog.aretecasting.spendquintessence") + ` (${spentPoints})<br />`;
            }

            if (this.object.totalDifficulty > 9) {
                const extraSuccesses = this.object.totalDifficulty - 9
                templateHTML += game.i18n.localize("wod.dialog.aretecasting.increaseddifficulty") + ` +${extraSuccesses}<br /><br />`;
                this.object.totalDifficulty = 9;
            }
            else if (this.object.totalDifficulty < 3) {
                this.object.totalDifficulty = 3; 
            }

            for (const sphere in CONFIG.wod.allSpheres) {
                let exists = (this.object.selectedSpheres[sphere] === undefined) ? false : true;

                if (exists) {
                    if ((parseInt(this.actor.system.spheres[sphere].value) >= 4) && (this.object.useSpeciality)) {
                        specialityRoll = true;
                        specialityText = specialityText != "" ? specialityText + ", " + this.actor.system.spheres[sphere].speciality : this.actor.system.spheres[sphere].speciality;
                    }

                    templateHTML += game.i18n.localize(CONFIG.wod.allSpheres[sphere]) + ` (${this.object.selectedSpheres[sphere]})<br />`;
                }
            }

            const numDices = parseInt(this.actor.system.arete.roll) + parseInt(this.object.areteModifier);

            const castingRoll = new DiceRoll(this.actor);
            castingRoll.handlingOnes = CONFIG.wod.handleOnes;    
            castingRoll.origin = "magic";
            castingRoll.numDices = numDices;
            castingRoll.difficulty = parseInt(this.object.totalDifficulty);          
            castingRoll.templateHTML = templateHTML;        
            castingRoll.systemText = this.object.description;
            castingRoll.speciality = specialityRoll;
            castingRoll.specialityText = specialityText;

            let successes = await rollDice(castingRoll);
            
            if (!this.object.isExtendedCasting) {
                this.object.close = true;
            }
            else {
                this.object.difficultyModifier = parseInt(this.object.difficultyModifier) + 1;
                this.object.totalSuccesses = parseInt(this.object.totalSuccesses) + parseInt(successes);
                this.render(false);
            }
        }
    }

    /* clicked to close form */
    _closeForm(event) {
        this.object.close = true;
    }

    _changedSelectedSphere(selected, spherename, value) {
        let exists = (selected[spherename] === undefined) ? false : true;

        if ((exists) && (value == 0)) {
            delete selected[spherename];
        }
        else {
            selected[spherename] = value;
        }        

        return selected;
    }

    /* calculating the difficulty based on the checked variables */
    _calculateDifficulty(showMessage) {
        const rank = this.object._highestRank();
        let diff = -1;
        this.object.totalDifficulty = -1;

        if ((rank == -1) && (showMessage)) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.aretecasting.nospheres"));

            return false;
        }

        if (this.object.spelltype == "") {
            if (showMessage) {
                ui.notifications.warn(game.i18n.localize("wod.dialog.aretecasting.nospelltype"));
            }

            return false;
        }

        if (rank > -1) {
            if ((this.object.witnesses) && (this.object.spelltype == "vulgar")) {
                diff = parseInt(rank) + 5;
            }
            else if ((!this.object.witnesses) && (this.object.spelltype == "vulgar")) {
                diff = parseInt(rank) + 4;
            }
            else if (this.object.spelltype == "coincidental") {
                diff = parseInt(rank) + 3;
            }
        }

        if (diff > -1) {
            this.object.baseDifficulty = diff;
            this.object.totalDifficulty = parseInt(this.object.baseDifficulty) + parseInt(this.object.sumSelectedDifficulty) + parseInt(this.object.difficultyModifier) + parseInt(this.object.quintessence);

            return true;
        }

        return false;
    }
}