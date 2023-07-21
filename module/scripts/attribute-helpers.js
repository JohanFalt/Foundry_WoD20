import * as AttributeDialog from "../dialogs/dialog-edits.js";

export default class AttributeHelper {

	static EditAttribute(event, actor) {
		const name = $(event.currentTarget).data("item-id");	
		let item = actor.system.attributes[name];
        item.id = name;
		
		const attribute = new AttributeDialog.Attribute(item);
		let attributeUse = new AttributeDialog.DialogAttribute(actor, attribute);
		attributeUse.render(true);
	}
}