export async function getInstalledPowers(items, includeCompendiums = true) {
    let powers = [];
    let disciplines = [];
    //let disciplinepaths = [];
    let arts = [];
    let edges = [];
    let lores = [];
    let arcanois = [];
    let hekaus = [];
    let numinas = [];

    // Define the specific power types we're interested in
    const validPowerTypes = [
        "wod.types.discipline",
        "wod.types.art",
        "wod.types.edge",
        "wod.types.lore",
        "wod.types.arcanoi",
        "wod.types.hekau",
        "wod.types.numina"
    ];

    // Create Map for deduplication based on name + system.type
    // World items are added first and have priority
    const powerMap = new Map();
    
    // Add world items first (they have priority)
    for (const item of items) {
        if (item.type === "Power" && validPowerTypes.includes(item.system?.type)) {
            const key = `${item.name.toLowerCase()}_${item.system?.type || ''}`;
            if (!powerMap.has(key)) {
                powerMap.set(key, item);
            }
        }
    }
    
    // Add compendium items if they don't already exist
    if (includeCompendiums) {
        const compendiumPromises = [];
        const itemPacks = [];
        const failedPacks = [];
        
        // Iterate through all Item packs
        for (const pack of game.packs) {
            // Validate pack before trying to read from it
            if (!pack) continue;
            if (pack.documentName !== "Item") continue;
            if (pack.locked) continue; // Skip locked packs
            
            // Check if pack has getDocuments method
            if (typeof pack.getDocuments !== "function") {
                console.warn(`WoD | Skipping pack ${pack.collection || "unknown"}: getDocuments method not available`);
                continue;
            }
            
            itemPacks.push(pack);
            compendiumPromises.push(
                pack.getDocuments().then(compendiumItems => {
                    if (!Array.isArray(compendiumItems)) {
                        console.warn(`WoD | Compendium ${pack.collection} returned invalid data format`);
                        return;
                    }
                    
                    let powerCount = 0;
                    for (const item of compendiumItems) {
                        // Validate item before trying to use it
                        if (!item || item.type !== "Power") continue;
                        if (!item.name || !item.system) continue;
                        
                        // Only include power types we're interested in
                        if (!validPowerTypes.includes(item.system?.type)) continue;
                        
                        try {
                            const key = `${item.name.toLowerCase()}_${item.system?.type || ''}`;
                            // Only add if there isn't already a world version
                            if (!powerMap.has(key)) {
                                powerMap.set(key, item);
                                powerCount++;
                            }
                        } catch (itemError) {
                            console.warn(`WoD | Error processing item from compendium ${pack.collection}:`, itemError);
                        }
                    }
                    if (powerCount > 0) {
                        console.log(`WoD | Loaded ${powerCount} powers from compendium: ${pack.collection}`);
                    }
                }).catch(error => {
                    failedPacks.push({
                        name: pack.collection || "unknown",
                        error: error
                    });
                    console.warn(`WoD | Failed to load items from compendium ${pack.collection}:`, error.message || error);
                })
            );
        }
        
        if (itemPacks.length > 0) {
            console.log(`WoD | Loading powers from ${itemPacks.length} compendium pack(s)...`);
        }
        
        // Wait for all compendiums to load (in parallel for better performance)
        // Use allSettled instead of all so that one error doesn't stop all others
        const results = await Promise.allSettled(compendiumPromises);
        
        // Check if any packs failed
        const rejectedCount = results.filter(r => r.status === "rejected").length;
        if (rejectedCount > 0) {
            console.warn(`WoD | ${rejectedCount} compendium pack(s) failed to load, but continuing with available packs`);
        }
        
        if (itemPacks.length > 0) {
            const totalPowers = Array.from(powerMap.values()).length;
            const worldPowers = items.filter(item => item.type === "Power").length;
            const compendiumPowers = totalPowers - worldPowers;
            const successCount = itemPacks.length - failedPacks.length;
            console.log(`WoD | Power loading complete: ${worldPowers} from world, ${compendiumPowers} from compendiums (${totalPowers} total unique powers)`);
            if (failedPacks.length > 0) {
                console.log(`WoD | Successfully loaded from ${successCount}/${itemPacks.length} compendium pack(s)`);
            }
        }
    }
    
    // Convert Map back to array for the rest of the function
    const uniqueItems = Array.from(powerMap.values());

    try
    {
        for (const item of uniqueItems) {
            if ((item.type == "Power") && (item.system.type == "wod.types.discipline")) {
                disciplines.push(item);
            }
            // if ((item.type == "Power") && (item.system.type == "wod.types.disciplinepath")) {
            //     disciplinepaths.push(item);
            // }
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
    catch (error)
    {
        console.error('Crash in getInstalledPowers():', error);
    }

    powers.disciplines = disciplines;
    //powers.disciplinepaths = disciplinepaths;
    powers.arts = arts;
    powers.edges = edges;
    powers.lores = lores;
    powers.arcanoi = arcanois;
    powers.hekau = hekaus;
    powers.numina = numinas;

    return powers;
}