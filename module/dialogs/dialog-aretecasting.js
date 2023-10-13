import { NewRollDice } from "../scripts/roll-dice.js";
import { DiceRollContainer } from "../scripts/roll-dice.js";

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
        
        this.spelltype = "coincidental";
        this.witnesses = false;

        this.areteModifier = 0;

        this.baseDifficulty = -1;           // difficulty based on the selected spheres/ spell type / witness
        this.difficultyModifier = 0;        // if other modifiers not listed are added
        this.sumSelectedDifficulty = 0;
        this.totalDifficulty = 0;           // all in all difficulty
        this.shownDifficulty = 0;

        this.useSpeciality = false;

        this.isRote = false;
        this.canCast = false;
        this.close = false;

        this.isExtendedCasting = false;
        this.keepDifficulty = false;
        this.totalSuccesses = 0;
        this.selectedMods = [];

        if (item != undefined) {
            this.name = item["name"];

            for (const sphere in CONFIG.wod.allSpheres) {
                if (item.system[sphere] > 0) {
                    this.selectedSpheres[sphere] = item.system[sphere];
                }
            }

            if (item.system["description"] != "") {
                this.description = item.system["description"];
            }

            if (item.system["spelltype"] != "") {
                this.spelltype = item.system["spelltype"];
            }

            this.check_instrumentPerson = item.system.instrument["ispersonalized"];
		    this.check_instrumentUnique = item.system.instrument["isunique"];

            if (item.system["spendingtime"] < 0) {
                this.select_spendingTime = parseInt(item.system["spendingtime"]);
            }		    

            this.isExtendedCasting = item.system["isextended"];

            this.isRote = true;

            if (this.check_instrumentPerson) {
                this.sumSelectedDifficulty -= 1;
            }
            if (this.check_instrumentUnique) {
                this.sumSelectedDifficulty -= 1;
            }
            if (this.select_spendingTime < 0) {
                this.sumSelectedDifficulty -= this.select_spendingTime * -1;
            }

            this._setDifficulty(this._highestRank());            
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

    _setDifficulty(rank) {
        let diff = -1;

        if (rank > -1) {
            if ((this.witnesses) && (this.spelltype == "vulgar")) {
                diff = parseInt(rank) + 5;
            }
            else if ((!this.witnesses) && (this.spelltype == "vulgar")) {
                diff = parseInt(rank) + 4;
            }
            else if (this.spelltype == "coincidental") {
                diff = parseInt(rank) + 3;
            }
        }

        if (diff > -1) {
            this.baseDifficulty = diff;
            this.totalDifficulty = parseInt(this.baseDifficulty) + parseInt(this.sumSelectedDifficulty) + parseInt(this.difficultyModifier) + parseInt(this.quintessence);
            this.shownDifficulty = this.totalDifficulty;

            if (this.totalDifficulty > 10) {
                this.shownDifficulty = 10;
            }
            else if (this.totalDifficulty < CONFIG.wod.lowestDifficulty) {
                this.shownDifficulty = CONFIG.wod.lowestDifficulty;
            }
        }

        return diff;
    }

}

export class DialogAreteCasting extends FormApplication {
    constructor(actor, rote) {
        super(rote, {submitOnChange: true, closeOnSubmit: false});
        this.actor = actor;        
        this.isDialog = true;

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
            classes: ["wod20 wod-dialog aretecasting-dialog mageDialog"],
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

        let found = false;

        for (const sphere in CONFIG.wod.allSpheres) {
            if (this.object.selectedSpheres[sphere] > 0) {
                found = true;
            }
        }

        if (!found) {
            ui.notifications.warn(game.i18n.localize("wod.dialog.aretecasting.selectsphere"));
            this.render();
            return;
        }

        event.preventDefault();    
        
        let totalDiff = 0;
        this.object.selectedMods = [];

        for (const value in formData) {
            if (value.startsWith('object.check_')) {
                let elementName = '[name="'+value+'"]';
                let objectname = value.replace("object.", "");                

                if (formData[value] == null) {
                    this.object[objectname] = false;
                }
                else {
                    totalDiff += parseInt(document.querySelector(elementName+':checked').value);
                    this.object[objectname] = true;

                    if (parseInt(document.querySelector(elementName+':checked').value) != 0) {
                        let name = value.toLowerCase().replace("object.check_", "");
                        this.object.selectedMods.push(game.i18n.localize("wod.dialog.aretecasting." + name));
                    }
                }
            }

            if (value.startsWith('object.select_')) {
                totalDiff += parseInt(formData[value]);

                if (parseInt(formData[value]) != 0) {
                    let name = value.toLowerCase().replace("object.select_", "");
                    this.object.selectedMods.push(game.i18n.localize("wod.dialog.aretecasting." + name));
                }
                
                let objectname = value.replace("object.", "");
                let formValue = formData[value];

                if (parseInt(this.object[objectname]) != parseInt(formValue)) {
                    this.object[objectname] = parseInt(formValue);
                }                
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

        if (!this.object.isExtendedCasting) {
            this.object.keepDifficulty = false;
        }
        else {
            this.object.keepDifficulty = formData["object.keepDifficulty"];
        }


        this.object.useSpeciality = formData["object.useSpeciality"];
        
        this.object.areteModifier = parseInt(formData["object.areteModifier"]);

        this.object.canCast = this._calculateDifficulty(false);   
        this.render();
    }

    /* sets what level the clicked sphere is to be using */
    _onDotSphereChange(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        const parent = $(element.parentNode);
        const index = Number(dataset.index);
        const sphere = parent[0].dataset.name;
        const steps = parent.find(".resource-value-step");

        if (index < 0 || index > steps.length) {
            return;
        }        

        steps.removeClass("active");

        let value = 0;

        if ((index == 0) && (this.object.selectedSpheres[sphere] == 1)) {
            value = 0;
        }
        else {
            value = parseInt(index + 1);

            steps.each(function (i) {
                if (i <= index) {
                    $(this).addClass("active");
                }
            });
        }

        this.object.selectedSpheres = this._changedSelectedSphere(this.object.selectedSpheres, sphere, value);
        this.object.canCast = this._calculateDifficulty(false);
        this.render(false);
    }

    /* clicked on cast Spell */
    async _castSpell(event) {
        let specialityRoll = false;
        let specialityText = "";
        let template = [];
        let extraInfo = [];
        let action = "";

        this.object.canCast = this._calculateDifficulty(true);

        if (this.object.canCast) {
            if (this.object.isRote) {
                action = this.object.name;
            }
            else {
                action = game.i18n.localize("wod.dialog.aretecasting.castingarete");
            }           
            
            template.push(`${game.i18n.localize("wod.advantages.arete")} (${this.actor.system.advantages.arete.roll})`);

            if (parseInt(this.object.areteModifier) > 0) {
                template.push(`${game.i18n.localize("wod.dialog.aretecasting.aretebonus")} +${this.object.areteModifier}`);
            }
            else if (parseInt(this.object.areteModifier) < 0) {
                template.push(`${game.i18n.localize("wod.dialog.aretecasting.aretebonus")} -${this.object.areteModifier}`);
            }      
            
            if (this.object.isExtendedCasting) {
                extraInfo.push(`${game.i18n.localize("wod.dialog.aretecasting.extendedcasting")} - ${this.object.totalSuccesses} ${game.i18n.localize("wod.dice.successes")}`);

                if (this.object.keepDifficulty) {
                    extraInfo.push(game.i18n.localize("wod.dialog.aretecasting.keepdifficulty"));
                }
            }

            

            if (this.object.spelltype == "coincidental") {
                extraInfo.push(game.i18n.localize("wod.spheres.coincidentalspell"));
            }
            else if (this.object.spelltype == "vulgar") {
                if (this.object.witnesses) {
                    extraInfo.push(game.i18n.localize("wod.spheres.vulgarspellwitness"));
                }
                else {
                    extraInfo.push(game.i18n.localize("wod.spheres.vulgarspell"));
                }
            }

            // the selected mods
            for (const property of this.object.selectedMods) {
                extraInfo.push(property);
            } 

            if (this.object.quintessence < 0) {
                const spentPoints = this.object.quintessence * -1;
                extraInfo.push(`${game.i18n.localize("wod.dialog.aretecasting.spendquintessence")} (${spentPoints})`);
            }

            if (this.object.totalDifficulty > 10) {
                const extraSuccesses = this.object.totalDifficulty - 10;
                extraInfo.push(`${game.i18n.localize("wod.dialog.aretecasting.increaseddifficulty")} +${extraSuccesses}`);
                this.object.totalDifficulty = 10;
            }
            else if (this.object.totalDifficulty < CONFIG.wod.lowestDifficulty) {
                this.object.totalDifficulty = CONFIG.wod.lowestDifficulty; 
            }

            for (const sphere in CONFIG.wod.allSpheres) {
                let exists = (this.object.selectedSpheres[sphere] === undefined) ? false : true;

                if (exists) {
                    if ((parseInt(this.actor.system.spheres[sphere].value) >= 4) && (this.object.useSpeciality)) {
                        specialityRoll = true;
                        specialityText = specialityText != "" ? specialityText + ", " + this.actor.system.spheres[sphere].speciality : this.actor.system.spheres[sphere].speciality;
                    }

                    extraInfo.push(`${game.i18n.localize(this.actor.system.spheres[sphere].label)} (${this.object.selectedSpheres[sphere]})`);
                }
            }

            const numDices = parseInt(this.actor.system.advantages.arete.roll) + parseInt(this.object.areteModifier);

            const powerRoll = new DiceRollContainer(this.actor);
            powerRoll.action = action;
            powerRoll.origin = "magic";
            powerRoll.numDices = numDices;
            powerRoll.woundpenalty = 0;
            powerRoll.difficulty = parseInt(this.object.totalDifficulty);           
            powerRoll.speciality = specialityRoll;
            powerRoll.specialityText = specialityText;
            powerRoll.dicetext = template;
            powerRoll.extraInfo = extraInfo;
            powerRoll.systemText = this.object.description;
            let successes = await NewRollDice(powerRoll);
            
            if (!this.object.isExtendedCasting) {
                this.object.close = true;
                this.close();
                return;
            }
            else {
                if (!this.object.keepDifficulty) {
                    this.object.difficultyModifier = parseInt(this.object.difficultyModifier) + 1;
                }
                
                this.object.totalSuccesses = parseInt(this.object.totalSuccesses) + parseInt(successes);    
                this.render();            
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

        if (this.object.spelltype == undefined) {
            this.object.spelltype = "";
        }

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

        diff = this.object._setDifficulty(rank)

        if (diff > -1) {
            return true;
        }

        return false;
    }
}