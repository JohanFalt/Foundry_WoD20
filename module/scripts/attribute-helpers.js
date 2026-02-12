import * as AttributeDialog from "../dialogs/dialog-edits.js";

export default class AttributeHelper {

	static EditAttribute(actor, id) {
		let item = actor.system.attributes[id];
        item.id = id;
		
		const attribute = new AttributeDialog.Attribute(item);
		let attributeUse = new AttributeDialog.DialogAttribute(actor, attribute);
		attributeUse.render(true);
	}
}