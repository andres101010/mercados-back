import mongoose, {Schema} from "mongoose";

const local = new Schema({
    name: {type: String, required: true},
    mercado: {type: mongoose.Schema.Types.ObjectId, ref: 'Mercado', required: true},
    number: { type: String, required: true, unique: true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
})

// Middleware pre-save para generar un número único incremental
localSchema.pre('save', async function (next) {
    const local = this;
  
    // Solo generar número si no está asignado
    if (!local.isNew) {
      return next();
    }
  
    try {
      // Buscar el documento con el mayor número actual
      const lastLocal = await mongoose.models.Local.findOne().sort({ number: -1 });
      
      // Asignar el nuevo número incrementado
      local.number = lastLocal ? lastLocal.number + 1 : 1;
  
      next();
    } catch (error) {
      next(error);
    }
  });

const Local = mongoose.model('Local',local)