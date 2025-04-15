import { set } from "mongoose";
import Historial from "../db/models/historial.js";
import Pago from "../db/models/pago.js";
import arrendatarios from "./arrendatarios.js";


class HistorialController  {
    async getHistorial(req, res){
        try {
            const {id} = req.params;
            const historial = await Historial.find({arrendatario: id}).populate('mercado local arrendatario');
            const pagos = await Pago.find({ arrendatario: id, activo: false });

            const data = {
                historial,
                pagos
            }
            // console.log("data", data)
            res.status(200).json({message: "Success", data})
        } catch (error) {
            console.log("error", error);
            res.status(500).json({message: "Error al traer el historial", error})
        }
    }
}

const historialControllers = new HistorialController;
export default historialControllers;