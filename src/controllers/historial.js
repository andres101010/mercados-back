import Historial from "../db/models/historial.js";
import arrendatarios from "./arrendatarios.js";


class HistorialController  {
    async getHistorial(req, res){
        try {
            const {id} = req.params;
            const historial = await Historial.find({arrendatario: id}).populate('mercado local arrendatario');
            res.status(200).json({message: "Success", historial})
        } catch (error) {
            console.log("error", error);
            res.status(500).json({message: "Error al traer el historial", error})
        }
    }
}

const historialControllers = new HistorialController;
export default historialControllers;