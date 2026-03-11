export default class settings extends foundry.abstract.DataModel {
    /* -------------------------------------------- */
    /*  Data Schema                                 */
    /* -------------------------------------------- */  
    /** @inheritDoc */
    static defineSchema() {
        const fields = foundry.data.fields;
        const valueString = {required: true, nullable: false, initial: ""};
        const bonusInteger = {required: true, nullable: false, integer: true, initial: 0};

        return {
            iscreated: new fields.BooleanField({initial: false}),
            isupdated: new fields.BooleanField({initial: false}),
            isshapecreated: new fields.BooleanField({initial: false}),

            usechimerical: new fields.BooleanField({initial: false}),
            usesplatfont: new fields.BooleanField({initial: true}),

            haswillpower: new fields.BooleanField({initial: false}),
            hasvirtue: new fields.BooleanField({initial: false}),
            hasrenown: new fields.BooleanField({initial: false}),
            hasquintessence: new fields.BooleanField({initial: false}),

            hasdisciplines: new fields.BooleanField({initial: false}),
            hascombinationdisciplines: new fields.BooleanField({initial: false}),
            //hasdisciplinepaths: new fields.BooleanField({initial: false}),
            hasrituals: new fields.BooleanField({initial: false}),
            hasgifts: new fields.BooleanField({initial: false}),
            hasrites: new fields.BooleanField({initial: false}),
            hasshapes: new fields.BooleanField({initial: false}),
            hasspheres: new fields.BooleanField({initial: false}),
            hasrotes: new fields.BooleanField({initial: false}),
            hasresonances: new fields.BooleanField({initial: false}),
            hasnuminas: new fields.BooleanField({initial: false}),

            version: new fields.StringField({...valueString}),
            era: new fields.StringField({initial: 'wod.era.modern', nullable: false}),
            splat: new fields.StringField({...valueString}),
            game: new fields.StringField({...valueString}),
            variant: new fields.StringField({...valueString}),
            variantsheet: new fields.StringField({...valueString}),
            dicesetting: new fields.StringField({...valueString}),

            attributes: new fields.SchemaField({
                defaultmaxvalue: new fields.NumberField({required: true, nullable: false, integer: true, initial: 5})
            }),
            abilities: new fields.SchemaField({
                defaultmaxvalue: new fields.NumberField({required: true, nullable: false, integer: true, initial: 5})
            }),
            powers: new fields.SchemaField({
                defaultmaxvalue: new fields.NumberField({required: true, nullable: false, integer: true, initial: 5})
            }),
            soak: new fields.SchemaField({
                bashing: new fields.SchemaField({
                    bonus: new fields.NumberField({...bonusInteger}),
                    isrollable: new fields.BooleanField({initial: true})
                }),
                lethal: new fields.SchemaField({
                    bonus: new fields.NumberField({...bonusInteger}),
                    isrollable: new fields.BooleanField({initial: true})
                }),
                aggravated: new fields.SchemaField({
                    bonus: new fields.NumberField({...bonusInteger}),
                    isrollable: new fields.BooleanField({initial: true})
                }),
                chimerical: new fields.SchemaField({                    
                    bashing: new fields.SchemaField({
                        bonus: new fields.NumberField({...bonusInteger}),
                        isrollable: new fields.BooleanField({initial: true})
                    }),
                    lethal: new fields.SchemaField({
                        bonus: new fields.NumberField({...bonusInteger}),
                        isrollable: new fields.BooleanField({initial: true})
                    }),
                    aggravated: new fields.SchemaField({
                        bonus: new fields.NumberField({...bonusInteger}),
                        isrollable: new fields.BooleanField({initial: true})
                    })
                })
            })
        }
    };
}