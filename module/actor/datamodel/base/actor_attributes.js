export default class attributes extends foundry.abstract.DataModel {
    /* -------------------------------------------- */
    /*  Data Schema                                 */
    /* -------------------------------------------- */  
    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const valueInteger = {required: true, nullable: false, integer: true, initial: 0, min: 0};
        const bonusInteger = {required: true, nullable: false, integer: true, initial: 0};
        const attributeValue = {required: true, nullable: false, integer: true, initial: 1, min: 0};
        const maxValue = {required: true, nullable: false, integer: true, initial: 5, min: 0};
        const valueString = {required: true, nullable: false, initial: ""};

        return {
            strength: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'physical', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.strength', nullable: false}),
                speciality: new fields.StringField({initial: '', nullable: false}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            dexterity: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'physical', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.dexterity', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 2}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            stamina: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'physical', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.stamina', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 3}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            charisma: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'social', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.charisma', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            manipulation: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'social', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.manipulation', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 5}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            appearance: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'social', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.appearance', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 6}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            composure: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'social', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.composure', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 7}),
                isvisible: new fields.BooleanField({initial: false}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            perception: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'mental', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.perception', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 8}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            intelligence: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'mental', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.intelligence', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 9}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            wits: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'mental', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.wits', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 10}),
                isvisible: new fields.BooleanField({initial: true}),
                isfavorited: new fields.BooleanField({initial: false})
            }),
            resolve: new fields.SchemaField({
                value: new fields.NumberField({...attributeValue}),
                bonus: new fields.NumberField({...bonusInteger}),
                total: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1}),
                max: new fields.NumberField({...maxValue}),
                type: new fields.StringField({initial: 'mental', nullable: false}),
                label: new fields.StringField({initial: 'wod.attributes.resolve', nullable: false}),
                speciality: new fields.StringField({...valueString}),
                sort: new fields.NumberField({required: true, nullable: false, integer: true, initial: 11}),
                isvisible: new fields.BooleanField({initial: false}),
                isfavorited: new fields.BooleanField({initial: false})
            })
        }
    };
}