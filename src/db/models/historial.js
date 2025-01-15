import mongoose, {Schema} from 'mongoose';

const historial = new Schema({
    arrendatario: {type: mongoose.Schema.Types.ObjectId, ref: 'Arrendatario'},
    mercado: {type: mongoose.Schema.Types.ObjectId, ref: 'Mercado'},
    local: {type: mongoose.Schema.Types.ObjectId, ref: 'Local'},
    fechaInicial:{type: String},
    fechaFinal: {type: String},
    observaciones: [
        {
            fecha: {type: String},
            observacion: {type: String},
        }
    ],
})

const Historial = mongoose.model('Historial', historial);
export default Historial;