export default class base_settings extends foundry.abstract.DataModel {
    /* -------------------------------------------- */
    /*  Data Schema                                 */
    /* -------------------------------------------- */  
    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const valueString = {required: true, nullable: false, initial: ""};
        const valueInteger = {required: true, nullable: false, integer: true, initial: 0, min: 0};

        return {
            iscreated: new fields.BooleanField({initial: false}),
            isupdated: new fields.BooleanField({initial: false}),
            isactive: new fields.BooleanField({initial: false}),
            isvisible: new fields.BooleanField({initial: true}),
            isremovable: new fields.BooleanField({initial: true}),
            version: new fields.StringField({...valueString}),
            order: new fields.NumberField({...valueInteger})
        }
    };
}