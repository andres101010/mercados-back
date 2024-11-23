import mongoose, { Schema } from "mongoose";

const pago = new Schema({
    nombre: { type: String},
    fechaPago: { type: Date, default: Date.now }, // Fecha en que se realizó el pago
    diasPagados: [{ type: String, required: true }], // Lista explícita de días pagados (formato 'YYYY-MM-DD')
    monto: { type: Number, required: true }, // Monto pagado
    montoPorDia: { type: Number, required: true},
    local: { type: mongoose.Schema.Types.ObjectId, ref: 'Local', required: true }, // Local asociado
    arrendatario: { type: mongoose.Schema.Types.ObjectId, ref: 'Arrendatario', required: true } // Arrendatario asociado
})

const Pago = mongoose.model('Pago', pago);
export default Pago;