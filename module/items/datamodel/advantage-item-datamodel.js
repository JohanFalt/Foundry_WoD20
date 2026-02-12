import base_settings from "./base/item_base_settings.js";

/**
 * Data schema, attributes, and methods specific to Actor.
 */
export default class AdvantageDataModel extends foundry.abstract.TypeDataModel {
    /* -------------------------------------------- */
    /*  Data Schema                                 */
    /* -------------------------------------------- */  
    /** @inheritDoc */
    static defineSchema() {
        const schema = {};

        const fields = foundry.data.fields;
        const valueString = {required: true, nullable: false, initial: ""};
        const valueInteger = {required: true, nullable: false, integer: true, initial: 0, min: 0};
        const valueNumber = {required: true, nullable: false, integer: true, initial: 0};
        const valueMax = {required: true, nullable: false, integer: true, initial: 10, min: 0};

        schema.settings = new fields.SchemaField({
            ...base_settings.defineSchema(),
            itemuuid: new fields.StringField({...valueString}),
            usepermanent: new fields.BooleanField({initial: false}),
            usetemporary: new fields.BooleanField({initial: false}),
            useroll: new fields.BooleanField({initial: false}),
            usebothrolls: new fields.BooleanField({initial: false}),
            highertemporary: new fields.BooleanField({initial: false})
        }); 
        
        schema.id = new fields.StringField({...valueString});
        schema.reference = new fields.StringField({...valueString});
        schema.type = new fields.StringField({required: true, nullable: false, initial: "wod.advantages.advantages"});
        schema.group = new fields.StringField({...valueString});
        schema.label = new fields.StringField({...valueString});

        schema.permanent = new fields.NumberField({...valueInteger});
        schema.temporary = new fields.NumberField({...valueInteger});
        schema.max = new fields.NumberField({...valueMax});
        schema.roll = new fields.NumberField({...valueInteger});
        schema.perturn = new fields.NumberField({...valueInteger});
        schema.bearing = new fields.NumberField({...valueNumber});
        schema.bearingtext = new fields.StringField({...valueString});
        
        schema.description = new fields.HTMLField();

        return schema;
    }

    static async initialize() {
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}