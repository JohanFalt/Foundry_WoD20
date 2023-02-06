export function getInstalledPowers(items) {
    let powers = [];
    let disciplines = [];
    let disciplinepaths = [];
    let arts = [];
    let edges = [];
    let lores = [];

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
    }

    powers.disciplines = disciplines;
    powers.disciplinepaths = disciplinepaths;
    powers.arts = arts;
    powers.edges = edges;
    powers.lores = lores;

    return powers;
}
