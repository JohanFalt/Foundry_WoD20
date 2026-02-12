import ItemHelper from "./item-helpers.js";
import { calculateTotals } from "./totals.js";

export default class DropHelper {

    static async OnDropItem(event, data, actor) {
        if (!data.uuid) return false;
        if (!actor.isOwner) return false;

        let update = true;
        const droppedItem = await Item.implementation.fromDropData(data);
        const itemData = foundry.utils.duplicate(droppedItem);

        if ((actor.type != "PC") && 
            ((droppedItem.type === "Ability") || 
                (droppedItem.type === "Advantage") ||
                (droppedItem.type === "Sphere") || 
                (droppedItem.type === "Splat"))) {
            let translation = game.i18n.localize("wod.labels.drop.nopcactor");
            translation = translation.replace("{1}", droppedItem.type);
            translation = translation.replace("{2}", actor.type);
			ui.notifications.warn(translation);
			return;
		}

        if (droppedItem.type === "Splat") {  
            update = await this.DropSplatToActor(actor, droppedItem);
        }

        if (droppedItem.type === "Ability") {  
            if (!droppedItem.system.type || droppedItem.system.type === "" || droppedItem.system.type === "wod.abilities.ability") {
                droppedItem.system.type = "wod.abilities.talent";
            }
        }

        if (droppedItem.type === "Advantage") {
            const items = actor.items.filter(item => item.type === "Advantage" && item.system.id === droppedItem.system.id && item.system.id !== "");

            if (items.length > 0) {
                let translation = game.i18n.localize("wod.labels.drop.advantageexists");
                translation = translation.replace("{1}", droppedItem.system.id);
                ui.notifications.warn(translation);
                return;
            }

            let actorData = foundry.utils.duplicate(actor);

            actorData = this.SetAdvantageSettings(droppedItem, actorData);

            actorData.system.settings.isupdated = false;
            await actor.update(actorData);

            itemData.system.settings.isremovable = true;
            update = true;
        }

        // TODO: App v2
        if (droppedItem.type === "Sphere") {
            ui.notifications.warn(game.i18n.localize("wod.labels.drop.dropsphere"));

            itemData.system.isremovable = true;
            return;
        }

        if (droppedItem.type === "Bonus") {            
            itemData.system.isremovable = true;
            update = true;
        }
        if ((droppedItem.type === "Power") && (itemData.system.parentid !== "")) {
            itemData.system.parentid = await ItemHelper.GetPowerId(itemData, actor);
            update = true;
        }
        if (update) {
            await actor.createEmbeddedDocuments('Item', [itemData]);
        }
    }

    static HandleDragDrop(sheet, object, html, element) {
        const original = element;

        if (original.dataset.draggableAttached) return;
        original.dataset.draggableAttached = true;

        // Normalize html parameter - handle both jQuery objects and DOM elements
        const htmlElement = html && (html[0] || html.jquery ? html[0] || html.get(0) : html);

        let clone = null;
        let offsetX, offsetY;
        let isDragging = false;
        let wasDragged = false;
        let dragTimeout;
        let noPermission = false;
        let hoveringActor;
        let isCtrlPressed = false;
        let isCopied = false;

        async function onMouseMove(e) {
            if (!isDragging || !clone) return;

            isCtrlPressed = e.ctrlKey;
            noPermission = false;

            clone.style.left = `${e.clientX - offsetX + window.scrollX}px`;
            clone.style.top = `${e.clientY - offsetY + window.scrollY}px`;

            let target = document.elementFromPoint(e.clientX, e.clientY);
            let hoveredSheetActorId = null;

            // Search for actor sheet element - support both legacy and V14 formats
            while (target && target !== document.body) {
                const id = target.id;
                
                // Check for legacy format: ActorSheet-Actor-{id}
                if (target.tagName === 'DIV' && typeof id === 'string' && id.includes('ActorSheet-Actor-')) {
                    hoveredSheetActorId = id.replace(/^.*ActorSheet-Actor-/, '');
                    break;
                }
                
                // Check for PC Actor format: PCActorSheet-Actor-{id} (form element, not div)
                if (typeof id === 'string' && id.includes('PCActorSheet-Actor-')) {
                    hoveredSheetActorId = id.replace(/^.*PCActorSheet-Actor-/, '');
                    break;
                }
                
                // Check for V14 format: check if element has data-actor-id attribute or is inside an actor sheet
                if (target.dataset?.actorId) {
                    hoveredSheetActorId = target.dataset.actorId;
                    break;
                }
                
                // Check if we're inside an actor sheet window (V14 uses different structure)
                const windowApp = target.closest('.window-app.actor-sheet, .window-app[data-appid*="Actor"]');
                if (windowApp) {
                    // Try to find actor ID from the window app's app object
                    const app = windowApp.app;
                    if (app && app.actor) {
                        hoveredSheetActorId = app.actor.id;
                        break;
                    }
                    // Try to extract from appid attribute (format: Actor.{id})
                    const appId = windowApp.dataset?.appid;
                    if (appId && appId.startsWith('Actor.')) {
                        hoveredSheetActorId = appId.replace('Actor.', '');
                        break;
                    }
                }
                
                // Also check for actor-sheet class directly
                if (target.classList?.contains('actor-sheet') || target.closest('.actor-sheet')) {
                    const actorSheet = target.closest('.actor-sheet') || target;
                    const windowApp2 = actorSheet.closest('.window-app');
                    if (windowApp2) {
                        const app = windowApp2.app;
                        if (app && app.actor) {
                            hoveredSheetActorId = app.actor.id;
                            break;
                        }
                    }
                    // Fallback: try to extract from sheet element's data
                    if (actorSheet.dataset?.actorId) {
                        hoveredSheetActorId = actorSheet.dataset.actorId;
                        break;
                    }
                }
                
                target = target.parentElement;
            }

            if (hoveredSheetActorId && hoveredSheetActorId !== object.id) {
                hoveringActor = await game.actors.get(hoveredSheetActorId);
                noPermission = hoveringActor?.permission < 3;
            } else if (!hoveredSheetActorId) {
                // Reset hoveringActor if we're not over any sheet
                hoveringActor = null;
            }

            if (!hoveredSheetActorId || hoveredSheetActorId === object.id || noPermission) {
                document.body.style.cursor = 'not-allowed';
            } else {
                const actor = object;
                const itemId = clone.dataset?.itemid;
                const item = actor.items.get(itemId);

                if (((item.type === "Melee Weapon") && (!item.system.isnatural)) || (item.type === "Ranged Weapon") || (item.type === "Armor") || (item.type === "Fetish") || (item.type === "Item")) {
                    isCopied = false;
                    isCopied = isCtrlPressed;
                }
                else {
                    isCopied = true;
                }

                if (isCopied) {
                    document.body.style.cursor = 'copy';                
                }
                else {
                    document.body.style.cursor = 'grabbing';                
                }                
            }
        }


        async function onMouseUp(e) {
            clearTimeout(dragTimeout);

            if (!isDragging || !clone) {
                setTimeout(() => delete original.dataset.wasDragged, 0);
                cleanupListeners();
                return;
            }

            isDragging = false;

            document.body.style.cursor = 'default';

            const itemId = clone.dataset?.itemid;

            if (!itemId) {
                console.error("Can not find the item's itemid");
                sheet.render();
                cleanupListeners();
                return;
            }

            // Update Ctrl key state from the mouseup event to ensure it's current
            isCtrlPressed = e.ctrlKey;

            let dropped = false;
            let newActorId = null;

            // Use elementFromPoint instead of e.target to find the actual drop target
            // This is more reliable when the clone is overlaying elements
            // Temporarily hide clone to get element underneath
            const cloneWasVisible = clone.style.display !== 'none';
            if (clone) {
                clone.style.pointerEvents = 'none';
                clone.style.display = 'none';
            }
            let target = document.elementFromPoint(e.clientX, e.clientY);
            // Restore clone visibility
            if (clone && cloneWasVisible) {
                clone.style.display = '';
                clone.style.pointerEvents = 'none';
            }
            
            // Search for actor sheet element - support both legacy and V14 formats
            while (target && target !== document.body) {
                const id = target.id;

                // Check for legacy format: ActorSheet-Actor-{id}
                if (
                    target.tagName === 'DIV' &&
                    typeof id === 'string' &&
                    id.includes('ActorSheet-Actor-')
                ) {
                    newActorId = id.replace(/^.*ActorSheet-Actor-/, '');
                    break;
                }
                
                // Check for PC Actor format: PCActorSheet-Actor-{id} (form element, not div)
                if (typeof id === 'string' && id.includes('PCActorSheet-Actor-')) {
                    newActorId = id.replace(/^.*PCActorSheet-Actor-/, '');
                    break;
                }
                
                // Check for V14 format: check if element has data-actor-id attribute
                if (target.dataset?.actorId) {
                    newActorId = target.dataset.actorId;
                    break;
                }
                
                // Check if we're inside an actor sheet window (V14 uses different structure)
                const windowApp = target.closest('.window-app.actor-sheet, .window-app[data-appid*="Actor"]');
                if (windowApp) {
                    // Try to find actor ID from the window app's app object
                    const app = windowApp.app;
                    if (app && app.actor) {
                        newActorId = app.actor.id;
                        break;
                    }
                    // Try to extract from appid attribute (format: Actor.{id})
                    const appId = windowApp.dataset?.appid;
                    if (appId && appId.startsWith('Actor.')) {
                        newActorId = appId.replace('Actor.', '');
                        break;
                    }
                }
                
                // Also check for actor-sheet class directly
                if (target.classList?.contains('actor-sheet') || target.closest('.actor-sheet')) {
                    const actorSheet = target.closest('.actor-sheet') || target;
                    const windowApp2 = actorSheet.closest('.window-app');
                    if (windowApp2) {
                        const app = windowApp2.app;
                        if (app && app.actor) {
                            newActorId = app.actor.id;
                            break;
                        }
                    }
                    // Fallback: try to extract from sheet element's data
                    if (actorSheet.dataset?.actorId) {
                        newActorId = actorSheet.dataset.actorId;
                        break;
                    }
                }

                target = target.parentElement;
            }

            // If we didn't find a target via elementFromPoint, try using the last hovered actor
            // This handles cases where the mouse is released outside any sheet
            if (!newActorId && hoveringActor) {
                newActorId = hoveringActor.id;
            }

            if ((newActorId && newActorId !== object._id) && (!noPermission)) {
                await DropHelper.DropToActor(object, clone, newActorId, { copy: isCtrlPressed });
                dropped = true;
            }
            else if (noPermission) {
                ui.notifications.warn(`${game.i18n.localize("wod.info.dropnopermission")} ${hoveringActor?.name || 'Unknown'}`, {permanent: false});
            }

            clone.remove();
            clone = null;

            setTimeout(() => delete original.dataset.wasDragged, 0);

            if (dropped) sheet.render();

            cleanupListeners();
        }

        function cleanupListeners() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        function activateDragBetweenActors(e) {
            isDragging = true;
            wasDragged = true;
            original.dataset.wasDragged = "true";               

            const parent = original.parentElement;
            if (!parent) return;

            // Använd bounding rect från parent (eftersom du klonar parent)
            const rect = parent.getBoundingClientRect();

            clone = parent.cloneNode(true);
            document.body.appendChild(clone);

            clone.style.position = 'absolute';
            clone.style.left = `${rect.left + window.scrollX}px`;
            clone.style.top = `${rect.top + window.scrollY}px`;
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.zIndex = 10000; // Högre z-index för att vara säker på att den är överst
            clone.style.pointerEvents = 'none';
            
            // Förbättrad visuell feedback
            clone.style.opacity = '0.85';
            clone.style.transform = 'scale(0.95)'; // Lite mindre för bättre visuell feedback
            clone.style.transition = 'transform 0.1s ease-out'; // Mjuk rörelse
            clone.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Ljus bakgrund
            clone.style.borderRadius = '4px';
            clone.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(128, 0, 0, 0.5)'; // Djup skugga och färgad outline
            clone.style.outline = 'none'; // Ta bort den gamla outline
            clone.style.color = '#000';

            clone.classList.add('dragging-clone');
            clone.classList.add('wod20-drag-row');

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.body.style.cursor = 'grabbing';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        original.addEventListener('mousedown', (e) => {
            // HandleDragDrop uses mouse events, while Foundry V14 DragDrop API uses drag events
            // They can coexist - Foundry V14 handles internal sorting, HandleDragDrop handles drag-between-actors
            // Only activate if we're actually dragging (not just clicking)
            
            // Check if parent has data-drag attribute (used for Foundry V14 DragDrop API)
            const parent = original.parentElement;
            if (!parent) return;
            
            const hasDataDrag = parent.hasAttribute('data-drag') || parent.closest('[data-drag]') !== null;
            
            // If this element uses Foundry V14 DragDrop API, we need to be careful
            // Only activate HandleDragDrop if we're dragging to a different actor sheet
            // We'll check this in onMouseMove by detecting if we're outside the current sheet
            if (hasDataDrag) {
                // For elements with data-drag, delay activation until we confirm we're dragging to another sheet
                // This prevents conflicts with Foundry V14's internal sorting
                let hasStartedDrag = false;
                
                const checkDragTarget = (moveEvent) => {
                    if (hasStartedDrag) return;
                    
                    // Check if mouse has moved significantly (actual drag, not just click)
                    const deltaX = Math.abs(moveEvent.clientX - e.clientX);
                    const deltaY = Math.abs(moveEvent.clientY - e.clientY);
                    
                    if (deltaX > 5 || deltaY > 5) {
                        hasStartedDrag = true;
                        
                        // Check if we're dragging outside the current sheet
                        const currentSheet = htmlElement;
                        if (!currentSheet || !currentSheet.getBoundingClientRect) {
                            // Fallback: try to find sheet element via parent
                            const sheetElement = original.closest('.app.window-app.actor-sheet, .wod-sheet');
                            if (sheetElement) {
                                const sheetRect = sheetElement.getBoundingClientRect();
                                const isOutsideSheet = 
                                    moveEvent.clientX < sheetRect.left || 
                                    moveEvent.clientX > sheetRect.right ||
                                    moveEvent.clientY < sheetRect.top || 
                                    moveEvent.clientY > sheetRect.bottom;
                                
                                if (isOutsideSheet) {
                                    isCtrlPressed = moveEvent.ctrlKey;
                                    activateDragBetweenActors(e);
                                }
                                document.removeEventListener('mousemove', checkDragTarget);
                                document.removeEventListener('mouseup', cleanupCheck);
                                return;
                            }
                            // If we can't find sheet, allow drag
                            isCtrlPressed = moveEvent.ctrlKey;
                            activateDragBetweenActors(e);
                            document.removeEventListener('mousemove', checkDragTarget);
                            document.removeEventListener('mouseup', cleanupCheck);
                            return;
                        }
                        const sheetRect = currentSheet.getBoundingClientRect();
                        const isOutsideSheet = 
                            moveEvent.clientX < sheetRect.left || 
                            moveEvent.clientX > sheetRect.right ||
                            moveEvent.clientY < sheetRect.top || 
                            moveEvent.clientY > sheetRect.bottom;
                        
                        if (isOutsideSheet) {
                            // Now activate HandleDragDrop for drag-between-actors
                            isCtrlPressed = moveEvent.ctrlKey;
                            activateDragBetweenActors(e);
                        }
                        
                        // Cleanup listener
                        document.removeEventListener('mousemove', checkDragTarget);
                        document.removeEventListener('mouseup', cleanupCheck);
                    }
                };
                
                const cleanupCheck = () => {
                    document.removeEventListener('mousemove', checkDragTarget);
                    document.removeEventListener('mouseup', cleanupCheck);
                };
                
                // Listen for mousemove to detect if we're dragging outside
                document.addEventListener('mousemove', checkDragTarget);
                document.addEventListener('mouseup', cleanupCheck);
                
                return; // Don't activate HandleDragDrop immediately for data-drag elements
            }

            // For elements without data-drag, activate HandleDragDrop normally
            isCtrlPressed = e.ctrlKey;

            dragTimeout = setTimeout(() => {
                // Only activate if mouse hasn't been released
                if (!wasDragged) {
                    activateDragBetweenActors(e);
                }
            }, 200);
        });

        original.addEventListener('mouseup', () => {
            clearTimeout(dragTimeout);
        });
    }


    static async DropSplatToActor(actor, droppedItem) {
        const hasSplatItem = actor.items.some(i => i.type === "Splat");
        // TODO: Do you want to clear or merge (e.g goes from mortal to vampire)

        // remove all old splat items if any
        if (hasSplatItem) {
            const performDelete = await new Promise((resolve) => {
                Dialog.confirm({
                    title: game.i18n.localize("wod.labels.drop.warning"),
                    yes: () => resolve(true),
                    no: () => resolve(false),
                    content: game.i18n.localize("wod.labels.drop.warningtext")
                });
            });

            if (!performDelete) {
                return false;
            }

            const itemsToDelete = actor.items.filter(i => i.type === droppedItem.type);
            idsToDelete = itemsToDelete.map(i => i.id);

            if (idsToDelete.length > 0) {
                await this.actor.deleteEmbeddedDocuments("Item", idsToDelete);
            }
        }

        // First fix items on Actor.
        // Collect all items to delete in one array, then delete them all at once
        let idsToDelete = [];

        // Clear abilities
        const abilitiesToDelete = actor.items.filter(i => i.type === "Ability" && i.system.value === 0);
        idsToDelete.push(...abilitiesToDelete.map(i => i.id));

        // Keep old advantages but make them removable
        const existingAdvantages = actor.items.filter(i => i.type === "Advantage");
        const advantagesToUpdate = [];
        for (const advantage of existingAdvantages) {
            const updateData = {
                _id: advantage.id,
                "system.settings.isremovable": true
            };
            advantagesToUpdate.push(updateData);
        }
        if (advantagesToUpdate.length > 0) {
            await actor.updateEmbeddedDocuments("Item", advantagesToUpdate);
        }

        // Keep old shapeforms but make them removable
        const existingShapeforms = actor.items.filter(i => i.type === "Trait" && i.system.type === "wod.types.shapeform");
        const shapeformsToUpdate = [];
        for (const shapeform of existingShapeforms) {
            const updateData = {
                _id: shapeform.id,
                "system.settings.isremovable": true
            };
            shapeformsToUpdate.push(updateData);
        }
        if (shapeformsToUpdate.length > 0) {
            await actor.updateEmbeddedDocuments("Item", shapeformsToUpdate);
        }

        // Keep old spheres but make them removable
        const existingSpheres = actor.items.filter(i => i.type === "Sphere");
        const spheresToUpdate = [];
        for (const sphere of existingSpheres) {
            const updateData = {
                _id: sphere.id,
                "system.settings.isremovable": true
            };
            spheresToUpdate.push(updateData);
        }
        if (spheresToUpdate.length > 0) {
            await actor.updateEmbeddedDocuments("Item", spheresToUpdate);
        }

        // Delete all items in one batch operation
        if (idsToDelete.length > 0) {
            await actor.deleteEmbeddedDocuments("Item", idsToDelete);
        }

        // Collect all items to create in one array, then create them all at once
        const itemlistData = [];
        let actorData = foundry.utils.duplicate(actor);

        // Import abilities
        const abilities = droppedItem.system.abilities;
        for (const obj in abilities) {
            const abilityData = await this.ImportAbility(actor, abilities[obj]);

            if (abilityData === false) {
                continue;
            }

            itemlistData.push(abilityData);
        }

        // Import advantages
        const advantages = droppedItem.system.advantages;
        for (const obj in advantages) {
            const advantageData = await this.ImportAdvantage(actor, advantages[obj]);

            if (advantageData === false) {
                continue;
            }

            if ((advantageData.system.settings.useroll) && (advantageData.system.settings.usepermanent) && (!advantageData.system.settings.usetemporary))   {
                advantageData.system.roll = advantageData.system.permanent;
            }

            itemlistData.push(advantageData);
            
            if (advantageData.system.id == "willpower") {
                actorData.system.settings.haswillpower = true;
            }
            if (advantageData.system.group == "virtue") {
                actorData.system.settings.hasvirtue = true;
            }
            if (advantageData.system.group == "renown") {
                actorData.system.settings.hasrenown = true;
            }
            if (advantageData.system.group == "quintessence") {
                actorData.system.settings.hasquintessence = true;
            }
        }
        
        // Import features
        const features = droppedItem.system.features;

        // Convert to array and find first shapeform in one pass
        const featuresArray = Object.keys(features).map(key => ({
            key,
            feature: features[key],
            order: features[key].system?.type === "wod.types.shapeform" 
                ? Number(features[key].system?.order || 0) 
                : Infinity
        }));

        // Find first shapeform (lowest order)
        const firstShapeform = featuresArray
            .filter(f => f.feature.system?.type === "wod.types.shapeform")
            .sort((a, b) => a.order - b.order)[0];

        // Import all features in one pass
        for (const { key, feature } of featuresArray) {
            const featureData = await this.ImportFeatures(actor, feature);
            
            if (featureData === false) {
                continue;
            }
            
            // Set isactive for first shapeform only
            if (featureData.system?.type === "wod.types.shapeform") {
                featureData.system.isactive = (firstShapeform && key === firstShapeform.key);
            }
            
            itemlistData.push(featureData);
        }

        // Import powers
        const powers = droppedItem.system.powers;

        for (const obj in powers) {
            const powerData = await this.ImportPower(actor, powers[obj]);

            if (powerData === false) {
                continue;
            }

            if (powerData.type == "Sphere") {
                actorData.system.settings.hasspheres = true;
                powerData.system.settings.isremovable = false;
            }

            itemlistData.push(powerData);
        }

        // Create all items in one batch operation
        if (itemlistData.length > 0) {
            await actor.createEmbeddedDocuments("Item", itemlistData);
        }
     
        // Merge splat specific bio fields
        const newObjects = await this.PopulateBio(actor, droppedItem);
        actorData.system.bio.splatfields = actorData.system.bio.splatfields || {};
        Object.assign(actorData.system.bio.splatfields, newObjects);

        // Set isvisible to true for all bio fields after merge
        for (const key in actorData.system.bio.splatfields) {
            if (actorData.system.bio.splatfields[key]) {
                actorData.system.bio.splatfields[key].isremovable = false;
                actorData.system.bio.splatfields[key].isvisible = true;
            }
        }

        actorData.system.settings.attributes.defaultmaxvalue = droppedItem.system.settings.attributes.defaultmaxvalue;
        actorData.system.settings.abilities.defaultmaxvalue = droppedItem.system.settings.abilities.defaultmaxvalue;   
        actorData.system.settings.abilities.defaultmaxvalue = droppedItem.system.settings.powers.defaultmaxvalue;

        // Clear health
        actorData.system.settings.usechimerical = droppedItem.system.settings.usechimerical;

        const health = droppedItem.system.health;
        let totalHealthLevels = 0;
        
        for (const healthlevel in CONFIG.worldofdarkness.woundLevels) {
            totalHealthLevels += parseInt(health[healthlevel].value);
        }

        actorData.system.traits.health.totalhealthlevels.value = totalHealthLevels;
        actorData.system.traits.health.totalhealthlevels.max = totalHealthLevels;  

        const soaklevel = droppedItem.system.settings.soak;

        for (const damage in CONFIG.worldofdarkness.damageTypes) {
            actorData.system.settings.soak[damage].bonus = soaklevel[damage].bonus;
            actorData.system.settings.soak[damage].isrollable = soaklevel[damage].isrollable;

            if (actorData.system.settings.usechimerical) {
                actorData.system.settings.soak.chimerical[damage].bonus = soaklevel.chimerical[damage].bonus;
                actorData.system.settings.soak.chimerical[damage].isrollable = soaklevel.chimerical[damage].isrollable;
            }
            else {
                actorData.system.settings.soak.chimerical[damage].bonus = 0;
                actorData.system.settings.soak.chimerical[damage].isrollable = false;
            }
        }

        // Clear settings
        actorData.system.settings.era = droppedItem.system.settings.era;
        actorData.system.settings.splat = droppedItem.system.settings.id;
        actorData.system.settings.game = droppedItem.system.settings.game;
        actorData.system.settings.variant = droppedItem.system.settings.variant;
        actorData.system.settings.variantsheet = droppedItem.system.settings.variantsheet;
        actorData.system.settings.dicesetting = "";        

        actorData.system.settings.iscreated = true;
        actorData.system.settings.isupdated = false;
        await actor.update(actorData);

        let translation = game.i18n.localize("wod.labels.drop.splatinstalled");
        translation = translation.replace("{1}", droppedItem.name);
        translation = translation.replace("{2}", actor.name);

        ui.notifications.info(translation);

        return false;
    }

    /**
     * Remove splat item and reset actor to initial state (like a newly created PC actor)
     * This is the reverse operation of DropSplatToActor
     * @param {Actor} actor - The actor to remove splat from
     * @param {Item|null} splatItem - The splat item being removed (optional, can be null)
     * @returns {Promise<boolean>} - Returns true if removal was successful
     */
    static async RemoveSplatFromActor(actor, splatItem = null) {
        // Delete ALL items - reset actor to empty state
        const allItemIds = actor.items.map(i => i.id);
        if (allItemIds.length > 0) {
            await actor.deleteEmbeddedDocuments("Item", allItemIds);
        }

        

        // Prepare actor data updates - reset to default PC actor state
        let actorData = foundry.utils.duplicate(actor);

        // Reset all attributes to default (value: 1, bonus: 0, total: 1, max: 5)
        const attributeDefaults = {
            strength: { value: 1, bonus: 0, total: 1, max: 5, type: "physical", label: "wod.attributes.strength", speciality: "", sort: 1, isvisible: true, isfavorited: false },
            dexterity: { value: 1, bonus: 0, total: 1, max: 5, type: "physical", label: "wod.attributes.dexterity", speciality: "", sort: 2, isvisible: true, isfavorited: false },
            stamina: { value: 1, bonus: 0, total: 1, max: 5, type: "physical", label: "wod.attributes.stamina", speciality: "", sort: 3, isvisible: true, isfavorited: false },
            charisma: { value: 1, bonus: 0, total: 1, max: 5, type: "social", label: "wod.attributes.charisma", speciality: "", sort: 4, isvisible: true, isfavorited: false },
            manipulation: { value: 1, bonus: 0, total: 1, max: 5, type: "social", label: "wod.attributes.manipulation", speciality: "", sort: 5, isvisible: true, isfavorited: false },
            appearance: { value: 1, bonus: 0, total: 1, max: 5, type: "social", label: "wod.attributes.appearance", speciality: "", sort: 6, isvisible: true, isfavorited: false },
            composure: { value: 1, bonus: 0, total: 1, max: 5, type: "social", label: "wod.attributes.composure", speciality: "", sort: 7, isvisible: false, isfavorited: false },
            perception: { value: 1, bonus: 0, total: 1, max: 5, type: "mental", label: "wod.attributes.perception", speciality: "", sort: 8, isvisible: true, isfavorited: false },
            intelligence: { value: 1, bonus: 0, total: 1, max: 5, type: "mental", label: "wod.attributes.intelligence", speciality: "", sort: 9, isvisible: true, isfavorited: false },
            wits: { value: 1, bonus: 0, total: 1, max: 5, type: "mental", label: "wod.attributes.wits", speciality: "", sort: 10, isvisible: true, isfavorited: false },
            resolve: { value: 1, bonus: 0, total: 1, max: 5, type: "mental", label: "wod.attributes.resolve", speciality: "", sort: 11, isvisible: false, isfavorited: false }
        };
        actorData.system.attributes = attributeDefaults;

        // Reset health damage tracking
        actorData.system.health.damage = {
            bashing: 0,
            lethal: 0,
            aggravated: 0,
            woundlevel: "",
            woundpenalty: 0
        };

        // Reset health levels to default (all value: 1, total: 1)
        const healthLevels = ["bruised", "hurt", "injured", "wounded", "mauled", "crippled", "incapacitated"];
        const healthPenalties = [0, -1, -1, -2, -2, -5, -99];
        const healthLabels = [
            "wod.health.bruised",
            "wod.health.hurt",
            "wod.health.injured",
            "wod.health.wounded",
            "wod.health.mauled",
            "wod.health.crippled",
            "wod.health.incapacitated"
        ];
        for (let i = 0; i < healthLevels.length; i++) {
            actorData.system.health[healthLevels[i]] = {
                value: 1,
                total: 1,
                penalty: healthPenalties[i],
                label: healthLabels[i]
            };
        }

        // Reset health totals
        actorData.system.traits.health.totalhealthlevels.value = 7;
        actorData.system.traits.health.totalhealthlevels.max = 7;

        // Reset soak values
        actorData.system.soak = {
            bashing: 0,
            lethal: 0,
            aggravated: 0
        };

        // Reset soak settings (bonus: 0, isrollable: true for all)
        for (const damage in CONFIG.worldofdarkness.damageTypes) {
            actorData.system.settings.soak[damage].bonus = 0;
            actorData.system.settings.soak[damage].isrollable = true;
            if (actorData.system.settings.soak.chimerical && actorData.system.settings.soak.chimerical[damage]) {
                actorData.system.settings.soak.chimerical[damage].bonus = 0;
                actorData.system.settings.soak.chimerical[damage].isrollable = true;
            }
        }

        // Reset initiative
        actorData.system.initiative = {
            base: 0,
            bonus: 0,
            total: 0
        };

        // Reset conditions
        actorData.system.conditions = {
            isignoringpain: false,
            isstunned: false,
            isfrenzy: false
        };

        // Reset movement
        actorData.system.movement = {
            walk: { value: 0, isactive: true },
            jog: { value: 0, isactive: true },
            run: { value: 0, isactive: true },
            fly: { value: 0, isactive: false },
            vjump: { value: 0, isactive: true },
            hjump: { value: 0, isactive: true }
        };

        // Reset gear money
        actorData.system.gear.money = {
            carried: 0,
            bank: 0
        };

        // Reset favoriterolls to empty array
        actorData.system.favoriterolls = [];

        // Clear bio.splatfields (remove all splat-specific bio fields)
        if (actorData.system.bio.splatfields) {
            // Ta bort alla keys från det befintliga objektet explicit
            Object.keys(actorData.system.bio.splatfields).forEach(key => {
                delete actorData.system.bio.splatfields[key];
            });
        }
        // Reset settings to default values
        actorData.system.settings.splat = "";
        actorData.system.settings.game = "";
        actorData.system.settings.variant = "";
        actorData.system.settings.variantsheet = "";
        actorData.system.settings.dicesetting = "";
        actorData.system.settings.era = "wod.era.modern";

        // Reset advantage flags
        actorData.system.settings.haswillpower = false;
        actorData.system.settings.hasvirtue = false;
        actorData.system.settings.hasrenown = false;
        actorData.system.settings.hasquintessence = false;

        // Reset power flags
        actorData.system.settings.hasdisciplines = false;
        actorData.system.settings.hascombinationdisciplines = false;
        actorData.system.settings.hasrituals = false;
        actorData.system.settings.hasgifts = false;
        actorData.system.settings.hasrites = false;
        actorData.system.settings.hasshapes = false;
        actorData.system.settings.hasspheres = false;
        actorData.system.settings.hasrotes = false;
        actorData.system.settings.hasresonances = false;
        actorData.system.settings.hasnuminas = false;

        // Reset chimerical
        actorData.system.settings.usechimerical = false;

        // Keep usesplatfont from game settings (as per default PC actor)
        actorData.system.settings.usesplatfont = game.settings.get('worldofdarkness', 'useSplatFonts') ?? true;

        // Reset default max values to standard (5)
        actorData.system.settings.attributes.defaultmaxvalue = 5;
        actorData.system.settings.abilities.defaultmaxvalue = 5;
        actorData.system.settings.powers.defaultmaxvalue = 5;

        // Mark as created but not updated (like a new PC actor)
        actorData.system.settings.iscreated = true;
        actorData.system.settings.isupdated = false;
        actorData.system.settings.isshapecreated = false;

        actorData = await calculateTotals(actorData);

        // Update actor
        await actor.update(actorData);

        await actor.update({
            "system.bio.splatfields": null
        }, {
            recursive: false
        });

        // Show notification
        let translation = game.i18n.localize("wod.labels.remove.splatremoved");
        if (!translation || translation === "wod.labels.remove.splatremoved") {
            // Fallback if translation doesn't exist
            const splatName = splatItem?.name || actor.system.settings.splat || "Splat";
            translation = `Splat item "${splatName}" has been removed from ${actor.name}.`;
        } else {
            const splatName = splatItem?.name || actor.system.settings.splat || "Splat";
            translation = translation.replace("{1}", splatName);
            translation = translation.replace("{2}", actor.name);
        }

        ui.notifications.info(translation);

        return true;
    }

 
    static async DropToActor(actor, clone, destinationId, options = {}) {
        if (destinationId == actor._id) {
            // same sheet ignore
            return false;
        }

        const isCopy = options.copy;
        const itemId = clone.dataset.itemid;
        const item = actor.items.get(itemId);
        const destinationActor = game.actors.get(destinationId);

        const itemData = foundry.utils.duplicate(item);

        itemData.flags ??= {};
        itemData.flags.copyFile = {
            receivedPlayer: game.user.id,
            receivedFrom: actor.id,
            receivedName: actor.name,
            receivedAt: Date.now()
        };

        itemData.system.isactive = false;
        itemData.system.isequipped = false;

        if (itemData.system?.attack?.secondaryabilityid != undefined) {
            itemData.system.attack.secondaryabilityid = "";
        }
        if ((itemData.system?.parentid != undefined) && (itemData.system?.parentid !== "")) {
            const parent = await actor.items.get(itemData.system.parentid);
            itemData.system.parentid = parent.name.toLowerCase();
            itemData.system.parentid = await ItemHelper.GetPowerId(itemData, destinationActor);
        }        

        if (itemData.system.bonuslist.length > 0) {
            for (let i = 0; i <= itemData.system.bonuslist.length - 1; i++) {
                itemData.system.bonuslist[i].isactive = false;
            }
        }

        // create new item
        const createdItem = await destinationActor.createEmbeddedDocuments("Item", [itemData]);

        if (!isCopy) {
            if (((item.type === "Melee Weapon") && (!item.system.isnatural)) || (item.type === "Ranged Weapon") || (item.type === "Armor") || (item.type === "Fetish") || (item.type === "Item")) {
                actor.deleteEmbeddedDocuments("Item", [itemId]); 
            }  
        }  

        return true;
    }  

    // makes sure that the advantage settings are set accordingly to if you have the adventage or not.
    static SetAdvantageSettings(advantage, actorData) {
        let haswillpower = false; 
        let hasvirtue = false;
        let hasrenown = false;
        let hasquintessence = false;

        // check the item in question first
        if (advantage.system.id == "willpower") {
            haswillpower = true;
        }
        if (advantage.system.group == "virtue") {
            hasvirtue = true;
        }
        if (advantage.system.group == "renown") {
            hasrenown = true;
        }
        if (advantage.system.group == "quintessence") {
            hasquintessence = true;
        }

        const items = actorData.items.filter(item => item.type === "Advantage");

        // check other items on the actor
        for (const i of items) {
            if (i.system.id == "willpower") {
                haswillpower = true;
            }
            if (i.system.group == "virtue") {
                hasvirtue = true;
            }
            if (i.system.group == "renown") {
                hasrenown = true;
            }
            if (i.system.group == "quintessence") {
                hasquintessence = true;
            }
        }

        actorData.system.settings.haswillpower = haswillpower;
        actorData.system.settings.hasvirtue = hasvirtue;
        actorData.system.settings.hasrenown = hasrenown;
        actorData.system.settings.hasquintessence = hasquintessence;

        return actorData;
    }

    static async ImportAdvantage(actor, advantage) {
        if (actor.system.advantages[advantage.system.id] !== undefined) {
            // TODO: finns redan
            console.log(`Installing Splat | Advantage ${advantage.name} already exists.`);

            return false;
        }

        let mergedData = undefined;

        // if the item come from a compendium get it from there.
        if (advantage.uuid.startsWith("Compendium.")) {
            const packid = advantage.uuid.split("Compendium.")[1].split(".Item")[0];

            const item = await this.GetCompendiumItem(packid, advantage.uuid);

            if (item !== false) {
                const loadedData = foundry.utils.duplicate(item);
                mergedData =this.PopulateAdvantage(loadedData, advantage);
            }
        }

        // if not found look into the world for the Item.
        if (mergedData === undefined) {
            const item = await game.items.find(e => e.uuid === advantage.uuid);
            const loadedData = foundry.utils.duplicate(item);

            mergedData = this.PopulateAdvantage(loadedData, advantage);
        }

        return mergedData;
    }

    static async ImportFeatures(actor, feature) {
        // Check if feature already exists on actor (by itemuuid to avoid duplicates)
        if (feature.uuid) {
            const existingFeature = actor.items.find(i => 
                i.type === "Trait" && 
                i.system.itemuuid === feature.uuid
            );
            
            if (existingFeature) {
                console.log(`Installing Splat | Feature ${feature.name} already exists (itemuuid: ${feature.uuid}).`);
                return false;
            }
        }

        let mergedData = undefined;

        // if the item come from a compendium get it from there.
        if (feature.uuid.startsWith("Compendium.")) {
            const packid = feature.uuid.split("Compendium.")[1].split(".Item")[0];

            const item = await this.GetCompendiumItem(packid, feature.uuid);

            if (item !== false) {
                const loadedData = foundry.utils.duplicate(item);
                mergedData =this.PopulateFeature(loadedData, feature);
            }
        }

        // if not found look into the world for the Item.
        if (mergedData === undefined) {
            const item = await game.items.find(e => e.uuid === feature.uuid);
            const loadedData = foundry.utils.duplicate(item);

            mergedData = this.PopulateFeature(loadedData, feature);
        }

        return mergedData;
    }

    static async ImportPower(actor, power) {
        // if (actor.system.power[power.system.id] !== undefined) {
        //     // TODO: finns redan
        //     console.log(`Installing Splat | Power ${power.name} already exists.`);

        //     return false;
        // }
        if (power.uuid) {
            const existingFeature = actor.items.find(i => 
                i.type === power.type && 
                i.system.itemuuid === power.uuid
            );
            
            if (existingFeature) {
                console.log(`Installing Splat | Power ${power.name} already exists (itemuuid: ${power.uuid}).`);
                return false;
            }
        }

        let mergedData = undefined;

        // if the item come from a compendium get it from there.
        if (power.uuid.startsWith("Compendium.")) {
            const packid = power.uuid.split("Compendium.")[1].split(".Item")[0];

            const item = await this.GetCompendiumItem(packid, power.uuid);

            if (item !== false) {
                const loadedData = foundry.utils.duplicate(item);
                mergedData =this.PopulatePower(loadedData, power);
            }
        }

        // if not found look into the world for the Item.
        if (mergedData === undefined) {
            const item = await game.items.find(e => e.uuid === power.uuid);
            const loadedData = foundry.utils.duplicate(item);

            mergedData = this.PopulatePower(loadedData, power);
        }

        return mergedData;
    }


    static async ImportAbility(actor, ability) {
        // If ability.uuid begins with Compendium, e.g., Compendium.worldofdarkness.lunarshapeshifting.Item.4wb0jZskSDXKmkWZ
        // search in the pack worldofdarkness.lunarshapeshifting for the full uuid
        // If ability.uuid begins with Item, it's in the world, so search game.items for the uuid or _id.
        if (actor.system.abilities[ability.system.id] !== undefined) {
            console.log(`Installing Splat | Ability ${ability.name} already exists.`);

            return false;
        }

        let mergedData = undefined;

        // if the item come from a compendium get it from there.
        if (ability.uuid.startsWith("Compendium.")) {
            const packid = ability.uuid.split("Compendium.")[1].split(".Item")[0];
            const item = await this.GetCompendiumItem(packid, ability.uuid);

            if (item !== false) {
                const loadedData = foundry.utils.duplicate(item);

                if (!loadedData.system.settings.alwaysspeciality) {
                    loadedData.system.settings.alwaysspeciality = (CONFIG.worldofdarkness.alwaysspeciality?.[actor.system.settings.game] ?? []).includes(loadedData.system.id);
                } 

                mergedData = await this.PopulateAbility(loadedData, ability);
            }            
        }

        // if not found look into the world for the Item.
        if (mergedData === undefined) {
            const item = await game.items.find(e => e.uuid === ability.uuid);
            const loadedData = foundry.utils.duplicate(item);

            if (!loadedData.system.settings.alwaysspeciality) {
                loadedData.system.settings.alwaysspeciality = (CONFIG.worldofdarkness.alwaysspeciality?.[actor.system.settings.game] ?? []).includes(loadedData.system.id);
            }

            mergedData = await this.PopulateAbility(loadedData, ability);
        }

        // if still not found create a blank new one.
        if (mergedData === undefined) {
            if (!ability.system.settings.alwaysspeciality) {
                ability.system.settings.alwaysspeciality = (CONFIG.worldofdarkness.alwaysspeciality?.[actor.system.settings.game] ?? []).includes(ability.system.id);
            }

            mergedData = {
                name: ability.name,
                type: "Ability",                
                system: {
                    id: ability.system.id,
                    reference: ability.system.reference,
                    type: ability.system.type,
                    label: ability.system.label,

                    value: ability.system.value,
                    bonus: ability.system.bonus,
                    max: ability.system.max,

                    speciality: ability.system.speciality,
                    description: ability.system.description,

                    settings: {
                        itemuuid: "",
                        version: game.data.system.version,
                        isfavorited: ability.system.settings.isfavorited,
                        alwaysspeciality: ability.system.settings.alwaysspeciality,
                        ismeleeweapon: ability.system.settings.ismeleeweapon,
                        israngedeweapon: ability.system.settings.israngedeweapon,
                        isremovable: false
                    }
                }
            };
        }

        if (!mergedData.system.type || mergedData.system.type === "" || mergedData.system.type === "wod.abilities.ability") {
            mergedData.system.type = "wod.abilities.talent";
        }

        return mergedData;
    }

    static async PopulateBio(actor, item) {
        const era = item.system.settings.era;
        const splat = item.system.settings.id;
        const game = item.system.settings.game;
        const variant = item.system.settings.variant;   

        const biolist = CONFIG.worldofdarkness.sheetv2.bio[era][splat];
    
        // Keep field.listdata as string (e.g. "AffiliationList", "Generation")
        // The actual list will be looked up dynamically in template using listData[field.listdata]
        // No need to populate the list here - it will be done in prepareBioContext or template
        
        return biolist;
    }

    static async PopulateAbility(loadedData, ability) {
        loadedData.system.type = ability.system.type;
        loadedData.system.settings.iscreated = true;
        loadedData.system.settings.isvisible = true;
        loadedData.system.settings.isremovable = false;

        loadedData.system.settings.itemuuid = ability.uuid;
        loadedData.system.settings.version = game.data.system.version;

        return loadedData;
    }

    static async PopulateAdvantage(loadedData, advantage) {
        loadedData.system.settings.iscreated = true;
        loadedData.system.settings.isvisible = true;
        loadedData.system.settings.isremovable = false;

        if (loadedData.system.id === "paradox") {
            loadedData.system.settings.isvisible = false;
        }
        
        loadedData.system.settings.itemuuid = advantage.uuid;
        loadedData.system.settings.version = game.data.system.version;
        loadedData.system.settings.order = advantage.system.settings.order;

        return loadedData;
    }

    static async PopulateFeature(loadedData, feature) {
        loadedData.system.iscreated = true;
        loadedData.system.isvisible = true;

        loadedData.system.itemuuid = feature.uuid;
        loadedData.system.version = game.data.system.version;
        loadedData.system.order = feature.system.order;

        return loadedData;
    }

    static async PopulatePower(loadedData, power) {
        loadedData.system.settings.iscreated = true;
        loadedData.system.settings.isvisible = true;
        
        loadedData.system.settings.itemuuid = power.uuid;
        loadedData.system.settings.version = game.data.system.version;
        loadedData.system.settings.order = power.system.settings.order;

        return loadedData;
    }

    static async GetCompendiumItem(compendiumid, uuid) {
        const compendium = game.packs.get(compendiumid);

        const items = await compendium.getDocuments();
        const foundItems = items.filter((item) => (item?.uuid === uuid));

        if (foundItems.length == 1) {
            return foundItems[0];
        }

        return false;
    }

    /**
     * Handles reordering of embedded objects in a list (e.g., advantages in Splat Items).
     * Updates order values for all items in the list based on their new positions.
     * 
     * @param {Item} item - The Item document containing the list
     * @param {DragEvent} event - Drop event from drag-and-drop operation
     * @param {Object} data - Drag data containing:
     *   - documentid: ID of the document
     *   - itemid: ID of the item being dragged
     *   - list: Path to the list (e.g., "system.advantages", "system.features")
     * @param {Object} options - Configuration options:
     *   - itemClass: CSS class for item elements (e.g., ".advantage-item", ".feature-item")
     *   - dropArea: Data attribute for drop area (e.g., "advantages", "features")
     *   - orderProperty: Path to order property:
     *     * "system.settings.order" for items inheriting from item_base_settings.js (Advantage, Ability, Sphere, Splat)
     *     * "system.order" for other items (Feature/Trait, Armor, Weapon, Power, etc.)
     *   - sheet: Sheet instance to render after update (optional)
     * @returns {Promise<boolean>} - true if update occurred, false otherwise
     */
    static async ReorderEmbeddedItemsInList(item, event, data, options) {
        // 1. Validation
        if (data.documentid !== item._id) return false;
        
        // 2. Get list from item document
        const listPath = data.list.split('.');
        let list = item;
        for (const key of listPath) {
            if (list?.[key] === undefined) return false;
            list = list[key];
        }
        
        if (!Array.isArray(list)) return false;
        
        // 3. Find dragged item index
        const draggedIndex = list.findIndex(item => item._id === data.itemid);
        if (draggedIndex === -1) return false;
        
        // 4. Find target position
        const dropTarget = event.target.closest(options.itemClass);
        let targetIndex;
        
        if (dropTarget) {
            const targetId = dropTarget.dataset.itemid;
            targetIndex = list.findIndex(item => item._id === targetId);
            if (targetIndex === -1) return false;
            
            // Determine before/after based on mouse position
            const rect = dropTarget.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (event.clientY > midpoint) {
                targetIndex++;
            }
        } else {
            // Dropped on container - place at end
            const container = event.target.closest(`[data-droparea="${options.dropArea}"]`);
            if (!container) return false;
            targetIndex = list.length;
        }
        
        // 5. Validate that position actually changes
        if (targetIndex === draggedIndex || targetIndex === draggedIndex + 1) return false;
        
        // 6. Create documentData and get listRef
        const itemData = foundry.utils.duplicate(item);
        const listPathArray = data.list.split('.');
        let listRef = itemData;
        for (const key of listPathArray) {
            listRef = listRef[key];
        }
        
        // 7. Move item in listRef
        const [movedItem] = listRef.splice(draggedIndex, 1);
        
        // Adjust target index if item moved from lower position
        let adjustedTargetIndex = targetIndex;
        if (draggedIndex < targetIndex) {
            adjustedTargetIndex--;
        }
        
        listRef.splice(adjustedTargetIndex, 0, movedItem);
        
        // 8. Update order values for all items
        const orderPath = options.orderProperty.split('.');
        listRef.forEach((item, index) => {
            let orderRef = item;
            // Navigate to correct level in object (e.g., item.system.settings or item.system)
            for (let i = 0; i < orderPath.length - 1; i++) {
                if (!orderRef[orderPath[i]]) {
                    orderRef[orderPath[i]] = {};
                }
                orderRef = orderRef[orderPath[i]];
            }
            // Set order value
            orderRef[orderPath[orderPath.length - 1]] = index;
        });
        
        // 9. Save and render
        await item.update(itemData);
        if (options.sheet) {
            options.sheet.render();
        }
        
        return true;
    }

    /**
     * Handles reordering of Item documents on an Actor (e.g., advantages on PC Actor).
     * Updates order values for all items based on their new positions.
     * 
     * @param {Actor} actor - The Actor document
     * @param {DragEvent} event - Drop event from drag-and-drop operation
     * @param {Object} data - Drag data containing:
     *   - documentid: ID of the document
     *   - itemid: ID of the item being dragged
     *   - list: Path to the list (e.g., "system.advantages")
     * @param {Object} options - Configuration options:
     *   - itemClass: CSS class for item elements (e.g., ".advantage-item")
     *   - dropArea: Data attribute for drop area (e.g., "advantages")
     *   - orderProperty: Path to order property (e.g., "system.settings.order")
     *   - group: (Optional) Filter by item.system.group (e.g., "" for generic, "virtue" for virtues)
     *   - sheet: Sheet instance to render after update (optional)
     * @returns {Promise<boolean>} - true if update occurred, false otherwise
     */
    static async ReorderActorItems(actor, event, data, options) {
        // 1. Validation
        if (data.documentid !== actor._id) return false;
        
        // 2. Filter items from actor.items based on type and optionally group
        let list = actor.items.filter(item => {
            // Filter by item type based on data.list
            if (data.list === "system.advantages") {
                if (item.type !== "Advantage") return false;
                // If options.group exists, filter by that too
                if (options.group !== undefined) {
                    return item.system.group === options.group;
                }
                // Default: only advantages without group (generic)
                return item.system.group === '';
            }
            // Handle features/shapes (Trait items with type wod.types.shapeform)
            if (data.list === "system.features") {
                if (item.type !== "Trait") return false;
                // Filter for shapeforms only
                return item.system.type === "wod.types.shapeform";
            }
            // Handle powers/spheres
            if (data.list === "system.powers") {
                return (item.type === "Sphere" || item.type === "Power");
            }
            // Add more types here as needed
            return false;
        });
        
        if (!Array.isArray(list) || list.length === 0) return false;
        
        // 2.5. Sort list by order to match visual order
        const orderPath = options.orderProperty.split('.');
        list.sort((a, b) => {
            let orderA = a;
            let orderB = b;
            
            // Navigate to order property
            for (const key of orderPath) {
                orderA = orderA?.[key];
                orderB = orderB?.[key];
            }
            
            const numA = Number(orderA) ?? 999;
            const numB = Number(orderB) ?? 999;
            return numA - numB;
        });
        
        // 3. Find dragged item index
        const draggedIndex = list.findIndex(item => item._id === data.itemid);
        if (draggedIndex === -1) return false;
        
        // 4. Find target position
        const dropTarget = event.target.closest(options.itemClass);
        let targetIndex;
        
        if (dropTarget) {
            const targetId = dropTarget.dataset.itemid;
            targetIndex = list.findIndex(item => item._id === targetId);
            if (targetIndex === -1) return false;
            
            // Determine before/after based on mouse position
            const rect = dropTarget.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (event.clientY > midpoint) {
                targetIndex++;
            }
        } else {
            // Dropped on container - place at end
            const container = event.target.closest(`[data-droparea="${options.dropArea}"]`);
            if (!container) return false;
            targetIndex = list.length;
        }
        
        // 5. Validate that position actually changes
        // If targetIndex equals draggedIndex, no change is needed
        // If targetIndex equals draggedIndex + 1 and we're placing after (mouse in lower half),
        // that means we're placing right after ourselves, which is effectively the same position
        if (targetIndex === draggedIndex) return false;
        if (targetIndex === draggedIndex + 1) {
            // Check if we're actually trying to place after ourselves
            // This happens when mouse is in lower half of the item we're dragging
            const dropTarget = event.target.closest(options.itemClass);
            if (dropTarget && dropTarget.dataset.itemid === data.itemid) {
                return false; // Dropping on ourselves
            }
        }
        
        // 6. Move item in array
        const [movedItem] = list.splice(draggedIndex, 1);
        
        // Adjust target index if item moved from lower position
        if (draggedIndex < targetIndex) {
            targetIndex--;
        }
        
        list.splice(targetIndex, 0, movedItem);
        
        // 7. Update order values for all items
        const updates = list.map((item, index) => {
            // Use dot-notation for nested property updates in Foundry V14
            const updateData = {};
            const orderPath = options.orderProperty.split('.');
            
            // Build nested structure: { system: { settings: { order: index } } }
            let current = updateData;
            for (let i = 0; i < orderPath.length - 1; i++) {
                current[orderPath[i]] = {};
                current = current[orderPath[i]];
            }
            current[orderPath[orderPath.length - 1]] = index;
            
            return {
                _id: item._id,
                ...updateData
            };
        });
        
        // 8. Update all items in a batch
        await actor.updateEmbeddedDocuments("Item", updates);
        
        // 9. Render
        if (options.sheet) {
            options.sheet.render();
        }
        
        return true;
    }
}