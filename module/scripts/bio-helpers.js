import * as BioDialog from "../dialogs/dialog-edits.js";

export default class BioHelper {

	static EditBio(event, actor) {
		const fieldStrings = $(event.currentTarget).data("item-id");	
        const fields = fieldStrings.split(".");
        const name = $(event.currentTarget).data("name");
		const custom = $(event.currentTarget).data("custom");
        
		/* let item = actor.system.spheres[name]; */
        let item = [];
        item.label = name;
        item.id = fields; 
		item.custom = custom;
		
		const bio = new BioDialog.Bio(item);
		let bioUse = new BioDialog.DialogBio(actor, bio);
		bioUse.render(true);
	}
}