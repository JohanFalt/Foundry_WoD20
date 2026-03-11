export const ActionSwitch = async function (event, target) {
    event.preventDefault();

    let itemid = undefined;
    let isupdated = false;
    
    const dataset = target.dataset;
    const islist = dataset?.islist === "true";

    if (dataset.itemid !== undefined) {
        itemid = dataset.itemid;
    }

    const fields = dataset.type.split(".");
    const lastField = fields.pop();        

    let itemData = foundry.utils.duplicate(this.item);

    if (islist === false) {
        itemData = ToggleSwitch(dataset.type, itemData);
        isupdated = true;
    }

    if (isupdated) {
        await this.item.update(itemData);
    }
    
    this.render();
}

export const ActionEdit = async function (event, target) {
    event.preventDefault();

    let itemid = undefined;
    let isupdated = false;

    const dataset = target.dataset;
    
    const fields = dataset.type.split(".");
    const area = fields[1];
    const islist = dataset?.islist === "true";

    if (dataset.itemid !== undefined) {
        itemid = dataset.itemid;
    }

    if (isupdated) {
        await this.item.update(itemData);
    }
    
    this.render();
}

export const ActionRemove = async function (event, target) {
    event.preventDefault();

    let itemid = undefined;
    let isupdated = false;

    const dataset = target.dataset;
    
    const fields = dataset.type.split(".");
    const area = fields[1];
    const islist = dataset?.islist === "true";

    if (dataset.itemid !== undefined) {
        itemid = dataset.itemid;
    }

    const itemData = foundry.utils.duplicate(this.item);

    // if it is an object list 
    if ((islist) && (itemid !== undefined)) {
        const index = itemData[fields[0]][fields[1]].findIndex(obj => obj._id === itemid);

        if (index !== -1) {
            itemData[fields[0]][fields[1]].splice(index, 1);
            isupdated = true;
        }
    }

    if (isupdated) {
        await this.item.update(itemData);
    }
    
    this.render();
}


function ToggleSwitch(path, obj) {
    const fields = path.split(".");
    const lastField = fields.pop();
    const parent = fields.reduce((acc, key) => acc[key], obj);
    
    if (typeof parent[lastField] !== "boolean") {
        console.warn(`Field at path ${path} is not a boolean.`);
        return {};
    }
    
    const newValue = !parent[lastField];
    
    return { [path]: newValue };
}

