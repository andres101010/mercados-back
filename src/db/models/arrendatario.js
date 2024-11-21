import mongoose, {Schema} from "mongoose";

const arrendatario = new Schema({
    name: { type: String, require: true},
    lastName: { type: String, require:true},
    cedula: { type: String, require: true, unique: true},
    phone: { type: String, require: true},
    address: { type: String, require: true},
    local: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Local' }],
    mercado: {type: mongoose.Schema.Types.ObjectId, ref: 'Mercado' }
})

const Arrendatario = mongoose.model('Arrendatario',arrendatario)

export default Arrendatario;