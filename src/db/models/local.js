
import mongoose, { Schema } from "mongoose";

const local = new Schema({
    name: { type: String },
    carnet: { type: String },
    mercado: { type: mongoose.Schema.Types.ObjectId, ref: 'Mercado' },
    number: { type: Number },  // Cambiado a Number para la generación automática
    arrendatario: { type: mongoose.Schema.Types.ObjectId, ref: 'Arrendatario' },
    status: { type: String, enum: ["libre", "asignado"], default: "libre" },
    fechaDeContrato: { type: String },
    observaciones: [
        {
            fecha: { type: String },
            falta: { type: String },
            observacion: { type: String},
            numNotificacion: { type: String}
        },
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});



local.pre('save', async function (next) {
    if (this.isNew && !this.number) {
        try {
            // Filtrar por mercado para obtener el último número
            const lastLocal = await mongoose.models.Local
                .findOne({ mercado: this.mercado })
                .sort({ number: -1 });

            // Incrementar el número solo dentro del mercado actual
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
