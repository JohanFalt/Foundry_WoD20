export default class ItemHelper {


    /**
     * Skapar en specifik disciplin och alla dess powers från disciplines.json i ett kompendium
     * @param {string} disciplineId - ID:t för disciplinen (t.ex. "obfuscate")
     * Användes för att skapa upp en disciplin i kompendiet
     */
    static async CreateDiscipline(disciplineId) {
        try {
            // Ladda disciplines.json
            const disciplinesData = await fetch("systems/worldofdarkness/assets/data/disciplines.json");
            const disciplinesJSON = await disciplinesData.json();
            
            // Hämta den specifika disciplinen
            const disciplineData = disciplinesJSON.disciplines[disciplineId.toLowerCase()];
            
            if (!disciplineData) {
                throw new Error(`Discipline "${disciplineId}" not found in disciplines.json`);
            }
            
            console.log(`Creating discipline: ${disciplineData.name}`);
            
            // Skapa discipline item data
            const disciplineItemData = foundry.utils.duplicate(disciplineData.itemData);
            
            // Sätt iscreated och version om det behövs
            if (disciplineItemData.system && disciplineItemData.system.settings) {
                disciplineItemData.system.settings.iscreated = true;
                disciplineItemData.system.settings.version = game.data.system.version || "";
            }
            
            // Skapa discipline item först
            const createdDiscipline = await Item.createDocuments([disciplineItemData], {
                pack: "worldofdarkness.disciplines" // Ändra till ditt kompendium-namn
            });
            
            const disciplineItem = createdDiscipline[0];
            const disciplineItemId = disciplineItem._id;
            
            console.log(`Created discipline: ${disciplineData.name} (ID: ${disciplineItemId})`);
            
            // Förbered alla power items
            const powerItemsData = [];
            
            // Sortera powers efter level
            const powersArray = Object.values(disciplineData.powers).sort((a, b) => a.level - b.level);
            
            for (const power of powersArray) {
                const powerItemData = foundry.utils.duplicate(power.itemData);
                
                // Sätt parentid till discipline item ID
                if (!powerItemData.system) {
                    powerItemData.system = {};
                }
                if (!powerItemData.system.settings) {
                    powerItemData.system.settings = {};
                }
                powerItemData.system.settings.parentid = disciplineItemId;
                
                // Sätt iscreated och version
                powerItemData.system.settings.iscreated = true;
                powerItemData.system.settings.version = game.data.system.version || "";
                
                powerItemsData.push(powerItemData);
            }
            
            // Skapa alla powers för denna disciplin
            if (powerItemsData.length > 0) {
                const createdPowers = await Item.createDocuments(powerItemsData, {
                    pack: "worldofdarkness.disciplines" // Ändra till ditt kompendium-namn
                });
                console.log(`Created ${createdPowers.length} powers for ${disciplineData.name}`);
            }
            
            console.log(`Successfully created ${disciplineData.name} with all its powers!`);
            
            return {
                discipline: disciplineItem,
                powers: powerItemsData.length,
                disciplineData: disciplineData
            };
            
        } catch (error) {
            console.error(`Error creating discipline "${disciplineId}":`, error);
            ui.notifications.error(`Failed to create discipline "${disciplineId}": ${error.message}`);
            throw error;
        }
    }

    /**
     * Skapar alla discipliner och deras powers från disciplines.json i ett kompendium
     * Skapar alla items i batch för bättre prestanda
     * Användes för att skapa upp alla discipliner i kompendiet
     */
    static async CreateAllDisciplines() {
        try {
            // Ladda disciplines.json
            const disciplinesData = await fetch("systems/worldofdarkness/assets/data/disciplines.json");
            const disciplinesJSON = await disciplinesData.json();
            
            // Steg 1: Skapa alla discipline items först
            const allDisciplineItems = [];
            const disciplineIdMap = new Map(); // Mappar disciplineId -> discipline name för att hitta ID senare
            
            for (const disciplineId in disciplinesJSON.disciplines) {
                const disciplineData = disciplinesJSON.disciplines[disciplineId];
                const disciplineItemData = foundry.utils.duplicate(disciplineData.itemData);
                
                if (disciplineItemData.system && disciplineItemData.system.settings) {
                    disciplineItemData.system.settings.iscreated = true;
                    disciplineItemData.system.settings.version = game.data.system.version || "";
                }
                
                // Spara disciplineId temporärt för att matcha senare
                disciplineItemData.flags = disciplineItemData.flags || {};
                disciplineItemData.flags.worldofdarkness = disciplineItemData.flags.worldofdarkness || {};
                disciplineItemData.flags.worldofdarkness.disciplineId = disciplineId;
                
                disciplineIdMap.set(disciplineId, disciplineData.name);
                allDisciplineItems.push(disciplineItemData);
            }
            
            // Skapa alla discipline items
            const createdDisciplines = await Item.createDocuments(allDisciplineItems, {
                pack: "worldofdarkness.disciplines" // Ändra till ditt kompendium-namn
            });
            
            console.log(`Created ${createdDisciplines.length} discipline items`);
            
            // Steg 2: Skapa alla power items med korrekt parentid
            const allPowerItems = [];
            const disciplineIdToItemId = new Map(); // Mappar disciplineId -> item ID
            
            // Mappa disciplineId till item ID
            for (const discipline of createdDisciplines) {
                const disciplineId = discipline.flags?.worldofdarkness?.disciplineId;
                if (disciplineId) {
                    disciplineIdToItemId.set(disciplineId, discipline._id);
                }
            }
            
            // Förbered alla power items
            for (const disciplineId in disciplinesJSON.disciplines) {
                const disciplineData = disciplinesJSON.disciplines[disciplineId];
                const disciplineItemId = disciplineIdToItemId.get(disciplineId);
                
                if (!disciplineItemId) {
                    console.warn(`Could not find discipline ID for ${disciplineId}, skipping powers`);
                    continue;
                }
                
                // Sortera powers efter level
                const powersArray = Object.values(disciplineData.powers).sort((a, b) => a.level - b.level);
                
                for (const power of powersArray) {
                    const powerItemData = foundry.utils.duplicate(power.itemData);
                    
                    if (!powerItemData.system) {
                        powerItemData.system = {};
                    }
                    if (!powerItemData.system.settings) {
                        powerItemData.system.settings = {};
                    }
                    
                    powerItemData.system.settings.parentid = disciplineItemId;
                    powerItemData.system.settings.iscreated = true;
                    powerItemData.system.settings.version = game.data.system.version || "";
                    
                    allPowerItems.push(powerItemData);
                }
            }
            
            // Skapa alla power items
            if (allPowerItems.length > 0) {
                const createdPowers = await Item.createDocuments(allPowerItems, {
                    pack: "worldofdarkness.disciplines" // Ändra till ditt kompendium-namn
                });
                console.log(`Created ${createdPowers.length} power items`);
            }
            
            const totalPowers = allPowerItems.length;
            console.log(`Successfully created ${createdDisciplines.length} disciplines with ${totalPowers} total powers!`);
            
            ui.notifications.info(`Created ${createdDisciplines.length} disciplines with ${totalPowers} powers`);
            
        } catch (error) {
            console.error("Error creating all disciplines:", error);
            ui.notifications.error(`Failed to create disciplines: ${error.message}`);
            throw error;
        }
    }
}