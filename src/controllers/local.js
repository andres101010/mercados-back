// import Mercado from "../db/models/mercados";
import Local from "../db/models/local.js";
import { response } from "express";
import Mercado from "../db/models/mercados.js";
import Arrendatario from "../db/models/arrendatario.js";
import Historial from "../db/models/historial.js";

class LocalControllers {
    async findAllLocals(req, res) {
        try {
            const {place} = req.params;
            // const nameMercado = place.replace('-',' ')
            const nameMercado = place.replace(/-/g, ' ');

            const mercado = await Mercado.findOne({nombre: nameMercado})
            const allLocals = await Local.find({mercado: mercado._id}).populate('arrendatario')
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
            // const { nombre, carnet, mercado, number, arrendatario, fecha, newNumber } = req.body;
            const { mercado, number, arrendatario, fecha, newNumber } = req.body;
            // console.log(nombre, carnet, mercado, number, arrendatario, fecha, newNumber);
            // Verificar si el local existe
            const localExists = await Local.findById(id);
            if (!localExists) {
                return res.status(404).json({ message: "El local no existe." });
            }

         
            
            if (newNumber && localExists.number == newNumber && localExists.mercado.toString() == mercado.toString()){
                return res.status(404).json({ message: "Este Numero Ya Esta En Uso." });
            }
            // console.log("arrendatario", arrendatario);
            const arrendatarioExistente = await Arrendatario.findOne({name: arrendatario});
            // console.log("arrendatarioExistente", arrendatarioExistente);

            const nombre = arrendatarioExistente.name + " " + arrendatarioExistente.lastName;
            const cedula = arrendatarioExistente.cedula;
            
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


            const arrendatarioIdExistente = await Arrendatario.findOne({
                local: id // Busca si el ID está en el array "local"
            });
            console.log("arrendatarioIdExistente", arrendatarioIdExistente);
            if (arrendatarioIdExistente) {
                // Si el ID existe, eliminarlo del array "local"
                const result = await Arrendatario.updateOne(
                    { _id: arrendatarioIdExistente._id }, // Identificar el documento por su _id
                    { $pull: { local: id } } // Eliminar el ID del array "local"
                );
            
                if (result.modifiedCount > 0) {
                    console.log("El ID se eliminó del array 'local' del arrendatario:", arrendatarioIdExistente);
                } else {
                    console.log("No se pudo eliminar el ID del array 'local'.");
                }
            } else {
                console.log("El ID no existe en la propiedad 'local'.");
            }
            

            // Actualizar el local con los datos proporcionados
            const updatedLocal = await Local.findByIdAndUpdate(
                id,
                { name: nombre, carnet : cedula, number, arrendatario:idArrendatrio, fechaDeContrato:fechaToString, status: "asignado" },
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
    
    async createObservacion(req,res) {
        try {
            const { id } = req.params
            const { fecha, observacion } = req.body
         
            const fechaToString = new Date(fecha).toISOString().split("T")[0];
            const localDb = await Local.findById(id)
            if(!localDb) return res.status(404).json({message: "Not Found"});
            if (!Array.isArray(localDb.observaciones)) {
                localDb.observaciones = [];
            }
            localDb.observaciones.push({fecha: fechaToString, observacion});
            await localDb.save();
            res.status(200).json({ message: "Observacion Agregada con exito" });
        } catch (error) {
            console.error("Error: ", error);
            res.status(500).json({ message: "Error al crear observacion", error });
        }
    }

    async resetLocal(req,res){
        try {
            const {id} = req.params;
            const local = await Local.findById(id);
            if(!local) return res.status(404).json({message: "Local no encontrado"});
            const arrendatarioLocalId = await Arrendatario.findById(local.arrendatario);
            if(arrendatarioLocalId){
                arrendatarioLocalId.local = arrendatarioLocalId.local.filter(item => item.toString()!== id);
                await arrendatarioLocalId.save();
                const newHistorial = new Historial({
                    local: local._id,
                    mercado: local.mercado,
                    arrendatario: arrendatarioLocalId._id,
                    fechaInicial: local.fechaDeContrato,
                    fechaFinal: new Date().toISOString().split("T")[0],
                    observaciones: local.observaciones?.map(obs => ({
                        fecha: obs.fecha,
                        observacion: obs.observacion,
                    }))
                });
    
                await newHistorial.save();

            } else {
               return res.status(500).json({message: 'Este Puesto aun no esta Asignado.'})
            }


            local.status = "libre";
            local.arrendatario = null;
            // local.mercado = null;
            local.carnet = null;
            local.fechaDeContrato = null;
            local.name = null;
            local.observaciones = [];
            await local.save();
            res.status(200).json({message: "Local reseteado con exito"});
        } catch (error) {
            console.log("error", error);
            res.status(500).json({message: "Error al resetear el local", error });
        }
    }

    async getHistorial(req, res){
        try {
            
        } catch (error) {
            console.log("error", error);
            res.status(500).json({message: "Error al traer el historial", error})
        }
    }

}

const localControllers = new LocalControllers();

export default localControllers;