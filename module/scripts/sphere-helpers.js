import * as SphereDialog from "../dialogs/dialog-edits.js";

export default class SphereHelper {

	static EditSphere(event, actor) {
		const name = $(event.currentTarget).data("item-id");	
		let item = actor.system.spheres[name];
        item.id = name;
		
		const sphere = new SphereDialog.Sphere(item);
		let sphereUse = new SphereDialog.DialogSphere(actor, sphere);
		sphereUse.render(true);
	}
}