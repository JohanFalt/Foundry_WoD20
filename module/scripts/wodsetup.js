export function getInstalledPowers(items) {
    let powers = [];
    let disciplines = [];
    let disciplinepaths = [];
    let arts = [];
    let edges = [];
    let lores = [];
    let arcanois = [];
    let hekaus = [];
    let numinas = [];

    try
    {
        for (const item of items) {
            if ((item.type == "Power") && (item.system.type == "wod.types.discipline")) {
                disciplines.push(item);
            }
            if ((item.type == "Power") && (item.system.type == "wod.types.disciplinepath")) {
                disciplinepaths.push(item);
            }
            if ((item.type == "Power") && (item.system.type == "wod.types.art")) {
                arts.push(item);
            }
            if ((item.type == "Power") && (item.system.type == "wod.types.edge")) {
                edges.push(item);
            }
            if ((item.type == "Power") && (item.system.type == "wod.types.lore")) {
                lores.push(item);
            }
            if ((item.type == "Power") && (item.system.type == "wod.types.arcanoi")) {
                arcanois.push(item);
            }
            if ((item.type == "Power") && (item.system.type == "wod.types.hekau")) {
                hekaus.push(item);
            }
            if ((item.type == "Power") && (item.system.type == "wod.types.numina")) {
                numinas.push(item);
            }
        }
    }
    catch
    {
        console.error('Crash in getInstalledPowers()');
    }

    powers.disciplines = disciplines;
    powers.disciplinepaths = disciplinepaths;
    powers.arts = arts;
    powers.edges = edges;
    powers.lores = lores;
    powers.arcanoi = arcanois;
    powers.hekau = hekaus;
    powers.numina = numinas;

    return powers;
}