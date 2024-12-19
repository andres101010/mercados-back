import Arrendatario from "../db/models/arrendatario.js";
import Mercado from "../db/models/mercados.js";
class Arrendatarios {
    async createArrendatario(req, res) {
        try {
            const {place} = req.params;
            const { name, lastName, cedula, phone, address, rubro } = req.body;
            
    
            // Verifica si el arrendatario ya existe basándote en el campo único `cedula`
            const arrendatarioDB = await Arrendatario.findOne({ cedula });
            
            if (arrendatarioDB) {
                return res.status(401).json({ message: "El Arrendatario Ya Existe!!!" });
            }

            const nameMercado = place.replace('-',' ')
            const mercado = await Mercado.findOne({nombre: nameMercado})

    
            // Crea y guarda el nuevo arrendatario con un array de locales
            const newArrendatario = new Arrendatario({
                name,
                lastName,
                cedula,
                phone,
                address,
                rubro,
                mercado: mercado._id,
                // local // Array de locales
            });
    
            await newArrendatario.save();
    
            res.status(201).json({ message: "Arrendatario Creado Con Éxito!", newArrendatario });
        } catch (error) {
            console.error("Error", error);
            res.status(500).json({ message: "Hubo Un Error Al Crear El Arrendatario", error });
        }
    }
    

    async editArrendatario(req, res) {
        try {
            const { id } = req.params; // El ID del arrendatario viene como parámetro en la URL
            const updateData = req.body; // Los datos actualizados del arrendatario vienen en el cuerpo de la petición
    
            // Verifica si el arrendatario existe
            const arrendatario = await Arrendatario.findById(id);
            if (!arrendatario) {
                return res.status(404).json({ message: "Arrendatario no encontrado" });
            }
    
            // Actualiza el arrendatario con los datos de updateData
            const updatedArrendatario = await Arrendatario.findByIdAndUpdate(id, updateData, {
                new: true, // Retorna el documento actualizado
                runValidators: true // Ejecuta las validaciones definidas en el esquema
            });
    
            res.status(200).json({ message: "Arrendatario actualizado con éxito", updatedArrendatario });
        } catch (error) {
            console.error("Error al actualizar el arrendatario", error);
            res.status(500).json({ message: "Hubo un error al actualizar el arrendatario", error });
        }
    }

    async getAllArrendatarios(req, res) {
        try {
            const {place} = req.params;
            // const nameMercado = place.replace('-',' ')
            const nameMercado = place.replace(/-/g, ' ');
            const mercado = await Mercado.findOne({nombre: nameMercado})
            // Usamos populate para obtener el campo 'nombre' de 'Mercado' y 'número' de 'Local'
            const arrendatarios = await Arrendatario.find({mercado: mercado._id})
                .populate({
                    path: 'mercado',
                    select: 'nombre' // Selecciona solo el campo 'nombre' del modelo 'Mercado'
                })
                .populate({
                    path: 'local',
                    select: 'number' // Selecciona solo el campo 'número' del modelo 'Local'
                });
    
            res.status(200).json(arrendatarios);
        } catch (error) {
            console.error("Error al obtener arrendatarios", error);
            res.status(500).json({ message: "Hubo un error al obtener los arrendatarios", error });
        }
    }

    async deleteArrendatario(req, res) {
        try {
            const { id } = req.params; // Se asume que el ID del arrendatario viene en los parámetros de la URL
    
            // Verifica si el arrendatario existe
            const arrendatario = await Arrendatario.findById(id);
            if (!arrendatario) {
                return res.status(404).json({ message: "Arrendatario no encontrado" });
            }
    
            // Elimina el arrendatario
            await Arrendatario.findByIdAndDelete(id);
    
            res.status(200).json({ message: "Arrendatario eliminado con éxito" });
        } catch (error) {
            console.error("Error al eliminar arrendatario", error);
            res.status(500).json({ message: "Hubo un error al eliminar el arrendatario", error });
        }
    }
    
    
}

const arrendatarios = new Arrendatarios();
export default arrendatarios;