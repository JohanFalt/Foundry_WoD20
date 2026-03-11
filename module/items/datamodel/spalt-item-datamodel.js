import base_settings from "./base/item_base_settings.js";
import health from "../../actor/datamodel/base/actor_health.js";

/**
 * Data schema, attributes, and methods specific to Actor.
 */
export default class SplatDataModel extends foundry.abstract.TypeDataModel {
    /* -------------------------------------------- */
    /*  Data Schema                                 */
    /* -------------------------------------------- */  
    /** @inheritDoc */
    static defineSchema() {
        const schema = {};

        const fields = foundry.data.fields;
        const valueInteger = {required: true, nullable: false, integer: true, initial: 0, min: 0};    
        const bonusInteger = {required: true, nullable: false, integer: true, initial: 0};    
        const valueString = {required: true, nullable: false, initial: ""};    

        schema.settings = new fields.SchemaField({
            ...base_settings.defineSchema(),

            id: new fields.StringField({...valueString}),
            game: new fields.StringField({...valueString}),
            era: new fields.StringField({...valueString}),
            variant: new fields.StringField({required: true, nullable: false, initial: "general"}),
            variantsheet: new fields.StringField({...valueString}),
            usechimerical: new fields.BooleanField({initial: false}),

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
                    isrollable: new fields.BooleanField({initial: false})
                }),
                aggravated: new fields.SchemaField({
                    bonus: new fields.NumberField({...bonusInteger}),
                    isrollable: new fields.BooleanField({initial: false})
                }),
                chimerical: new fields.SchemaField({                    
                    bashing: new fields.SchemaField({
                        bonus: new fields.NumberField({...bonusInteger}),
                        isrollable: new fields.BooleanField({initial: false})
                    }),
                    lethal: new fields.SchemaField({
                        bonus: new fields.NumberField({...bonusInteger}),
                        isrollable: new fields.BooleanField({initial: false})
                    }),
                    aggravated: new fields.SchemaField({
                        bonus: new fields.NumberField({...bonusInteger}),
                        isrollable: new fields.BooleanField({initial: false})
                    })
                })
            })
        });

        schema.reference = new fields.StringField({...valueString});

        schema.bio = new fields.ArrayField(
            new fields.ObjectField({
                initial: {},
                nullable: false,
        }));

        schema.abilities = new fields.ArrayField(
            new fields.ObjectField({
                initial: {},
                nullable: false,
        }));

        schema.advantages = new fields.ArrayField(
            new fields.ObjectField({
                initial: {},
                nullable: false,
        }));

        schema.features = new fields.ArrayField(
            new fields.ObjectField({
                initial: {},
                nullable: false,
        }));

        schema.powers = new fields.ArrayField(
            new fields.ObjectField({
                initial: {},
                nullable: false,
        }));

        schema.health = new fields.SchemaField({
            ...health.defineSchema()
        });
        

        return schema;
    }

    static async initialize() {
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}