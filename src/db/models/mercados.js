import mongoose, { Schema } from "mongoose";

// Definir el esquema
const mercadoSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true // Asegura que sea único en la base de datos
  },
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});

// Middleware pre-save para verificar y asignar un código único
mercadoSchema.pre('save', async function (next) {
  const mercado = this;

  // Si ya tiene un código, no hacer nada
  if (mercado.code) {
    return next();
  }

  // Generar código único
  let isUnique = false;
  let newCode = '';

  while (!isUnique) {
    // Generar código aleatorio (puedes ajustar la lógica de generación)
    newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Verificar si ya existe en la base de datos
    const existingMercado = await mongoose.models.Mercado.findOne({ code: newCode });
    if (!existingMercado) {
      isUnique = true;
    }
  }

  // Asignar el código único al documento
  mercado.code = newCode;

  next();
});

// Crear el modelo
const Mercado = mongoose.model('Mercado', mercadoSchema);

export default Mercado;
