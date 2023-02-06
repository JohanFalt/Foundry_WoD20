import { TourHelper } from "./tour.js";

export async function tourSetup()
{
    try {        
        const {files} = await FilePicker.browse("data", 'systems/worldofdarkness/tours');
        for(let i = 0; i < files.length; i++) {
            if(!files[i].endsWith(".json")) {
                continue;
            }
            let tour = await TourHelper.fromJSON(files[i]);
            if(tour.config.permission?.GM && !game.user.isGM) {
                continue;
            }
            game.tours.register("worldofdarkness",tour.id,tour);
        }
    } catch(err) {
        return
    }
    //game.worldofdarkness.tourLink = tourLink;
}

/* async function tourLink(event) {
    let header = $(event);
    let tourId = header[0].dataset.tourId;
    if(!tourId.includes('.')) {
        tourId = `worldofdarkness.${ tourId}`;
    }
    let tour = game.tours.get(`worldofdarkness.${ header[0].dataset.tourId }`);
    tour?.start();
} */