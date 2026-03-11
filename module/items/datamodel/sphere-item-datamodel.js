import base_settings from "./base/item_base_settings.js";

/**
 * Data schema, attributes, and methods specific to Actor.
 */
export default class SphereDataModel extends foundry.abstract.TypeDataModel {
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
        const valueMax = {required: true, nullable: false, integer: true, initial: 5, min: 0};

        schema.settings = new fields.SchemaField({
            ...base_settings.defineSchema(),
            itemuuid: new fields.StringField({...valueString}),
            istechnocracy: new fields.BooleanField({initial: false})
        }); 
        
        schema.id = new fields.StringField({...valueString});
        schema.reference = new fields.StringField({...valueString});
        schema.label = new fields.StringField({...valueString});

        schema.value = new fields.NumberField({...valueInteger});
        schema.max = new fields.NumberField({... valueMax});
        
        schema.speciality = new fields.StringField({...valueString});
        schema.description = new fields.HTMLField();

        return schema;
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}