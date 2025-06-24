export default class MessageHelper {
    
    static async printMessage(headline, message, actor = undefined){
		if (actor == undefined) {
			actor = this.actor;
		}

		const templateData = {
			data: {
				actor: actor,
				type: "send",
				action: headline,
				message: message,
				description: "",
				system: ""
			}
		};
	
		// Render the chat card template
		const template = `systems/worldofdarkness/templates/dialogs/roll-template.hbs`;
		const html = await foundry.applications.handlebars.renderTemplate(template, templateData);
	
		const chatData = {
			content: html,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			rollMode: game.settings.get("core", "rollMode")        
		};
		ChatMessage.applyRollMode(chatData, "roll");
		ChatMessage.create(chatData);
	}
}
