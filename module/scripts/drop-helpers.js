import ItemHelper from "./item-helpers.js";

export default class DropHelper {

    static async OnDropItem(event, data, actor) {
        if (!data.uuid) return false;
        if (!actor.isOwner) return false;

        let update = true;
        const droppedItem = await Item.implementation.fromDropData(data);
        const itemData = foundry.utils.duplicate(droppedItem);

        if (droppedItem.type === "Bonus") {            
            itemData.system.isremovable = true;
            update = true;
        }
        if ((itemData.type === "Power") && (itemData.system.parentid !== "")) {
            itemData.system.parentid = await ItemHelper.GetPowerId(itemData, actor);
            update = true;
        }
        if (update) {
            await actor.createEmbeddedDocuments('Item', [itemData])
        }
    }

    static HandleDragDrop(sheet, actor, html, element) {
        const original = element;
        if (original.dataset.draggableAttached) return;
        original.dataset.draggableAttached = true;

        let clone = null;
        let offsetX, offsetY;
        let isDragging = false;
        let currentHoverContainer = null;
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

            while (target && target !== document.body) {
                const id = target.id;
                if (target.tagName === 'DIV' && typeof id === 'string' && id.includes('ActorSheet-Actor-')) {
                    hoveredSheetActorId = id.replace(/^.*ActorSheet-Actor-/, '');
                    break;
                }
                target = target.parentElement;
            }

            if (hoveredSheetActorId !== actor.id) {
                hoveringActor = await game.actors.get(hoveredSheetActorId);
                noPermission = hoveringActor?.permission < 3;
            }

            if (!hoveredSheetActorId || hoveredSheetActorId === actor.id || noPermission) {
                document.body.style.cursor = 'not-allowed';
            } else {
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

            let target = e.target;
            let dropped = false;
            let newActorId = null;

            while (target && target !== document.body) {
                const id = target.id;

                if (
                    target.tagName === 'DIV' &&
                    typeof id === 'string' &&
                    id.includes('ActorSheet-Actor-')
                ) {
                    newActorId = id.replace(/^.*ActorSheet-Actor-/, '');
                    break;
                }

                target = target.parentElement;
            }

            if ((newActorId && newActorId !== actor.id) && (!noPermission)) {
                await DropHelper.DropToActor(actor, clone, newActorId, { copy: isCtrlPressed });
                dropped = true;
            }
            else if (noPermission) {
                ui.notifications.warn(`${game.i18n.localize("wod.info.dropnopermission")} ${hoveringActor.name}`, {permanent: false});
            }

            clone.remove();
            clone = null;
            currentHoverContainer = null;

            setTimeout(() => delete original.dataset.wasDragged, 0);

            if (dropped) sheet.render();

            cleanupListeners();
        }

        function cleanupListeners() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        original.addEventListener('mousedown', (e) => {
            isCtrlPressed = e.ctrlKey;

            dragTimeout = setTimeout(() => {
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
                clone.style.zIndex = 1000;
                clone.style.pointerEvents = 'none';
                clone.style.opacity = 0.5;
                clone.style.color = '#000';
                clone.style.outline = '2px dashed rgb(147, 147, 147)';
                clone.style.outlineOffset = '-4px';

                clone.classList.add('dragging-clone');
                clone.classList.add('wod20-drag-row');

                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                document.body.style.cursor = 'grabbing';

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }, 200);
        });

        original.addEventListener('mouseup', () => {
            clearTimeout(dragTimeout);
        });
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
}