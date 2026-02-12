import attributes from "./base/actor_attributes.js";
import settings from "./base/actor_settings.js";
import traits from "./base/actor_traits.js";
import health from "./base/actor_health.js";

export default class PCDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const schema = {};
        const fields = foundry.data.fields;
        const valueInteger = {required: true, nullable: false, integer: true, initial: 0, min: 0};
        const valueNumber = {required: true, nullable: false, integer: true, initial: 0};
        const valueString = {required: true, nullable: false, initial: ""};

        // Same as before
        schema.settings = new fields.SchemaField({
            ...settings.defineSchema()
        });

        // Same as before
        schema.traits = new fields.SchemaField({
            ...traits.defineSchema()
        });

        // The general fields all sheets have
        schema.bio  = new fields.SchemaField({
            worldanvil: new fields.StringField({...valueString}),
            name: new fields.StringField({...valueString}),
            nature: new fields.StringField({...valueString}),
            demeanor: new fields.StringField({...valueString}),
            derangement: new fields.StringField({...valueString}),
            concept: new fields.StringField({...valueString}),
            splatfields: new fields.ObjectField({
                initial: {},
                nullable: false,
            }),
            appearance: new fields.HTMLField(),
            background: new fields.HTMLField(),
            notes: new fields.HTMLField(),
            roleplaytip: new fields.HTMLField()            
        });            

        // Same as before
        schema.attributes = new fields.SchemaField({
            ...attributes.defineSchema()
        }); 

        // Same as before
        schema.soak = new fields.SchemaField({
            bashing:  new fields.NumberField({...valueInteger}),
            lethal:  new fields.NumberField({...valueInteger}),
            aggravated:  new fields.NumberField({...valueInteger})
        });

        // Same as before
        schema.health = new fields.SchemaField({
            ...health.defineSchema()
        });

        // Same as before
        schema.initiative = new fields.SchemaField({
            base:  new fields.NumberField({...valueInteger}),
            bonus:  new fields.NumberField({...valueInteger}),
            total:  new fields.NumberField({...valueInteger})
        });

        // Same as before
        schema.conditions = new fields.SchemaField({
            isignoringpain: new fields.BooleanField({initial: false}),
            isstunned: new fields.BooleanField({initial: false}),
            isfrenzy: new fields.BooleanField({initial: false})
        });

        // changed
        schema.movement = new fields.SchemaField({
            walk: new fields.SchemaField({
                value: new fields.NumberField({...valueInteger}),
                isactive: new fields.BooleanField({initial: true})
            }),  
            jog: new fields.SchemaField({
                value: new fields.NumberField({...valueInteger}),
                isactive: new fields.BooleanField({initial: true})
            }),
            run: new fields.SchemaField({
                value: new fields.NumberField({...valueInteger}),
                isactive: new fields.BooleanField({initial: true})
            }),
            fly: new fields.SchemaField({
                value: new fields.NumberField({...valueInteger}),
                isactive: new fields.BooleanField({initial: false})
            }),
            vjump: new fields.SchemaField({
                value: new fields.NumberField({...valueInteger}),
                isactive: new fields.BooleanField({initial: true})
            }),
            hjump: new fields.SchemaField({
                value: new fields.NumberField({...valueInteger}),
                isactive: new fields.BooleanField({initial: true})
            })
        });

        // changed
        schema.gear  = new fields.SchemaField({
            notes: new fields.HTMLField(),
            money: new fields.SchemaField({
                carried: new fields.NumberField({...valueNumber}),
                bank: new fields.NumberField({...valueNumber})
            })
        });        

        schema.favoriterolls = new fields.ArrayField(
            new fields.ObjectField({
                initial: {},
                nullable: false,
        }));

        return schema;
    }

    static async initialize() {
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}