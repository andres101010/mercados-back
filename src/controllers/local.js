// import Mercado from "../db/models/mercados";
import Local from "../db/models/local.js";
import { response } from "express";
import Mercado from "../db/models/mercados.js";
import Arrendatario from "../db/models/arrendatario.js";

class LocalControllers {
    async findAllLocals(req, res) {
        try {
            const {place} = req.params;
            // const nameMercado = place.replace('-',' ')
            const nameMercado = place.replace(/-/g, ' ');

            const mercado = await Mercado.findOne({nombre: nameMercado})
            const allLocals = await Local.find({mercado: mercado._id})
            res.status(200).json({message:"Success", allLocals})
        } catch (error) {
            console.log("error", error);
            res.status(500).json({message:"Error al Buscar Todos Los Locales", error});
        }
    }

    async findOneLocal(req, res) {
        try {
            const { id } = req.params;
            const oneLocal = await Local.findOne({id: id});
            if (!oneLocal) res.status(404).json({message: "No Existe El Local"});
            res.status(200).json({message:"Success", oneLocal});
        } catch (error) {
            console.log("error", error);
            res.status(500).json({message:"Error al Buscar El Local", error});
        }
    }

    // async createLocal(req, res) {
    //     try {
    //         const { name , mercado, number, status } = req.body;
    //         const localNumber = await Local.findOne({number: number})
    //         if (localNumber) res.status(401).json({message:"El Numero Del Local Ya Esta En Uso!! "})
    //         const localDB = await Local.findOne({name: name, mercado: mercado, number: number, arrendatario: arrendatario, status:status})
    //         if (localDB) res.status(401).json({message:"El Local Ya Existe"});
    //         const newLocal = await Local.create({name: name, mercado: mercado, number: number, arrendatario: arrendatario})
    //         res.status(200).json({message:"Success", newLocal});
    //     } catch (error) {
    //         console.log("Error: ", error);
    //         res.status(500).json({message:"Error creating local", error});
    //     }
    // }

    async createLocal(req, res) {
        try {
            const {place} = req.params;
            // const nameMercado = place.replace('-',' ')
            const nameMercado = place.replace(/-/g, ' ');

            console.log("nameMercado", nameMercado);
            const mercado = await Mercado.findOne({nombre: nameMercado})
           
            if (!mercado) {
                return res.status(404).json({ message: "Mercado no encontrado" });
            }
    
            // Crear un nuevo objeto Local y asignarle el _id de mercado
            const newLocal = new Local({
                mercado: mercado._id // Asigna el _id del mercado al nuevo local
            });
    
            // Guardar el nuevo local en la base de datos
            await newLocal.save();

            const totalLocales = await Local.countDocuments({ mercado: mercado._id });

            // Actualizar el campo `local` en el mercado con el total de locales
            mercado.local = totalLocales;
            await mercado.save();
    
            // Devolver la respuesta con el nuevo local creado
            res.status(201).json({ message: "Local creado con éxito", newLocal });
        } catch (error) {
            console.error("Error al crear el local:", error);
            res.status(500).json({ message: "Error al crear el local", error });
        }
    }
    
    // async editLocal(local) {
    //     try {
    //         const { id } = req.params;
    //         const { name , mercado, number, arrendatario } = req.body;
    //         const localDB = await local.findOne({ id: id });
    //         if(localDB) res.status(401).json({message:"El Local No Existe"})
    //             const updatedLocal = await Local.findByIdAndUpdate(
    //                 id,
    //                 { name, mercado, number, arrendatario },
    //                 { new: true } 
    //             );
        
    //         res.status(200).json({ message: "Local actualizado con éxito", updatedLocal });
    //     } catch (error) {
    //         console.error("Error: ", error);
    //         res.status(500).json({ message: "Error actualizando el local", error });
    //     }
    // }

    async editLocal(req, res) {
        try {
            const { id } = req.params;
            const { nombre, carnet, mercado, number, arrendatario, fecha, newNumber } = req.body;
            console.log(nombre, carnet, mercado, number, arrendatario, fecha, newNumber);
            // Verificar si el local existe
            const localExists = await Local.findById(id);
            if (!localExists) {
                return res.status(404).json({ message: "El local no existe." });
            }
            
            if (newNumber && localExists.number == newNumber && localExists.mercado.toString() == mercado.toString()){
                return res.status(404).json({ message: "Este Numero Ya Esta En Uso." });
            }
            console.log("arrendatario", arrendatario);
            const arrendatarioExistente = await Arrendatario.findOne({_id: arrendatario});
            
            if (!arrendatarioExistente) return res.status(404).json({ message: "El Arrendatario no existe." });
            const idArrendatrio = arrendatarioExistente._id;
            if (!arrendatarioExistente.local.includes(id)) {
                arrendatarioExistente.local.push(id);
                await arrendatarioExistente.save();
                console.log("Local agregado al arrendatario");
            } else {
                return res.status(404).json({ message: "El local ya esta asignado a este arrendatario." });
            }
            const fechaToString = new Date(fecha).toISOString().split("T")[0];



            // Actualizar el local con los datos proporcionados
            const updatedLocal = await Local.findByIdAndUpdate(
                id,
                { name: nombre, carnet, number, arrendatario:idArrendatrio, fechaDeContrato:fechaToString, status: "asignado" },
                { new: true }
            );

            res.status(200).json({ message: "Local actualizado con éxito", updatedLocal });
        } catch (error) {
            console.error("Error al actualizar el local:", error);
            res.status(500).json({ message: "Error al actualizar el local", error });
        }
    }


    async deleteLocal(req, res) {
        try {
            const { id } = req.params;
            const localDB = await Local.findById(id);
            if (!localDB) {
                return res.status(404).json({ message: "El Local No Existe" });
            }
    
            // Eliminar el local
            await Local.findByIdAndDelete(id);
            res.status(200).json({ message: "Local eliminado con éxito" });
        } catch (error) {
            console.error("Error: ", error);
            res.status(500).json({ message: "Error eliminando el local", error });
        }
    }
    


}

const localControllers = new LocalControllers();

export default localControllers;