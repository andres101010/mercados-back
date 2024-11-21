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
  mapLink:{
    type: String,
  },
  code: {
    type: String,
    unique: true // Asegura que sea único en la base de datos
  },
  local: { type: Number , unique: true},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
});

// Middleware pre-save para verificar y asignar un código único
mercadoSchema.pre("save", async function (next) {
  const mercado = this;

  // Si ya tiene un código, no hacer nada
  if (mercado.code) {
    return next();
  }

  // Generar código único
  let isUnique = false;
  let newCode = "";

  // Iniciar con el número 001
  let counter = 1;

  while (!isUnique) {
    // Generar el código con formato de 3 dígitos
    newCode = counter.toString().padStart(3, "0");

    // Verificar si ya existe en la base de datos
    const existingMercado = await mongoose.models.Mercado.findOne({ code: newCode });
    if (!existingMercado) {
      isUnique = true; // Si no existe, es único
    } else {
      counter++; // Si ya existe, incrementar el contador
    }
  }

  // Asignar el código único al documento
  mercado.code = newCode;

  next();
});

// Crear el modelo
const Mercado = mongoose.model('Mercado', mercadoSchema);

export default Mercado;
