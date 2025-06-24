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
	 * Wait for a specific element to appear in the DOM.
	 * @param {string} selector The selector for the element to wait for
	 * @param {number} timeout The maximum time to wait
	 * @returns {Promise<Element>} A promise that resolves to the element, if it is found
	 */
	waitForElement(selector, timeout) {
		return new Promise((resolve, reject) => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver(() => {
				if (document.querySelector(selector)) {
					resolve(document.querySelector(selector));
					observer.disconnect();
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});

			this.wait(timeout).then(reject);
		});
	}

    async _preStep() {
        await super._preStep();
        await this.waitForElement(this.currentStep.selector, 5000);
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
                document.querySelector(target)?.click();
                break;
			case "click-delay":
				document.querySelector(target)?.click();
				await this.wait(300);
				break;				
            case "scrollIntoView":
                document.querySelector(target)?.scrollIntoView({ block: "start", inline: "nearest" });
                break;
			case "addDemon":
				document.querySelector(target)?.click();

				if(!game.actors.get('ExampleDemon0001') ) {
					const data = await foundry.utils.fetchJsonWithTimeout('systems/worldofdarkness/tours/data/demon.json', {}, { int:30000});					
					await Actor.create([data], { keepId: true});
				}
				break;
			case "addWerewolf":
				document.querySelector(target)?.click();

				if(!game.actors.get('ExampleWerewolf1') ) {
					const data = await foundry.utils.fetchJsonWithTimeout('systems/worldofdarkness/tours/data/werewolf.json', {}, { int:30000});					
					await Actor.create([data], { keepId: true});
				}
				break;
			case "addVampire":
				document.querySelector(target)?.click();

				if(!game.actors.get('ExampleVampire01') ) {
					const data = await foundry.utils.fetchJsonWithTimeout('systems/worldofdarkness/tours/data/vampire.json', {}, { int:30000});					
					await Actor.create([data], { keepId: true});
				}
				break;
		}
    }
}