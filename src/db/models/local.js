// import mongoose, {Schema} from "mongoose";

// const local = new Schema({
//     name: {type: String, required: true},
//     mercado: {type: mongoose.Schema.Types.ObjectId, ref: 'Mercado'},
//     number: { type: String, required: true, unique: true},
//     arrendatario: {type: mongoose.Schema.Types.ObjectId, ref: 'Arrendatario'},
//     status: {type: String, enum: ["libre", "asignado"], default: "libre"},
//     fechaDeContrato: {type: String, required: true},
//     created_at: {type: Date, default: Date.now},
//     updated_at: {type: Date, default: Date.now},
// })

// // Middleware pre-save para generar un número único incremental
// local.pre('save', async function (next) {
//     const local = this;
  
//     // Solo generar número si no está asignado
//     if (!local.isNew) {
//       return next();
//     }
  
//     try {
//       // Buscar el documento con el mayor número actual
//       const lastLocal = await mongoose.models.Local.findOne().sort({ number: -1 });
      
//       // Asignar el nuevo número incrementado
//       local.number = lastLocal ? lastLocal.number + 1 : 1;
  
//       next();
//     } catch (error) {
//       next(error);
//     }
//   });

// const Local = mongoose.model('Local',local)

// export default Local;


import mongoose, { Schema } from "mongoose";

const local = new Schema({
    name: { type: String },
    carnet: { type: String },
    mercado: { type: mongoose.Schema.Types.ObjectId, ref: 'Mercado' },
    number: { type: Number, unique: true },  // Cambiado a Number para la generación automática
    arrendatario: { type: mongoose.Schema.Types.ObjectId, ref: 'Arrendatario' },
    status: { type: String, enum: ["libre", "asignado"], default: "libre" },
    fechaDeContrato: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Middleware pre-save para generar un número incremental único si el número no se asigna manualmente
local.pre('save', async function (next) {
    if (this.isNew && !this.number) {
        try {
            const lastLocal = await mongoose.models.Local.findOne().sort({ number: -1 });
            this.number = lastLocal ? lastLocal.number + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const Local = mongoose.model('Local', local);
export default Local;
