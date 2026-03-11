import * as SphereDialog from "../dialogs/dialog-edits.js";

export default class SphereHelper {

	static EditSphere(actor, id) {		
		let item = actor.system.spheres[id];
        item.id = id;
		
		const sphere = new SphereDialog.Sphere(item);
		let sphereUse = new SphereDialog.DialogSphere(actor, sphere);
		sphereUse.render(true);
	}
}