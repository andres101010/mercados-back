import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();
const uri = process.env.URI_DB;

async function conectar() {
    try {
        await mongoose.connect(uri);
        console.log("Conexión establecida con MongoDB Atlas");
    } catch (error) {
        console.error("Error al conectar a MongoDB Atlas:", error);
    }
}

export default conectar;