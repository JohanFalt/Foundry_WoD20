export default class traits extends foundry.abstract.DataModel {
    /* -------------------------------------------- */
    /*  Data Schema                                 */
    /* -------------------------------------------- */  
    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            health: new fields.SchemaField({
                totalhealthlevels: new fields.SchemaField({
                    value: new fields.NumberField({required: true, nullable: false, integer: true, initial: 7}),
                    max: new fields.NumberField({required: true, nullable: false, integer: true, initial: 7})
                })
            })
        }
    };
}