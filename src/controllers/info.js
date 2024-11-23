import Pagos from "../db/models/pago.js";
import Mercado from "../db/models/mercados.js";
import Arrendatario from "../db/models/arrendatario.js";
import moment from "moment";
class InfoControllers {
    async getInfo(req,res){
        try {
            // Calcular el rango de fechas de la semana actual
        const inicioSemana = moment().startOf('week').format('YYYY-MM-DD'); // Lunes
        const finSemana = moment().endOf('week').format('YYYY-MM-DD'); // Domingo

        // Buscar pagos donde `diasPagados` contenga fechas de esta semana
        const pagosSemana = await Pagos.find({
            diasPagados: {
                $elemMatch: { 
                    $gte: inicioSemana, 
                    $lte: finSemana 
                }
            }
        });

        console.log("pagosSemana", pagosSemana);
        // Calcular el monto total de pagos
        const montoTotalSemana = pagosSemana.reduce((total, pago) => total + pago.monto, 0);
        console.log("montoTotalSemana",montoTotalSemana);
        // Responder con el monto total y los pagos encontrados
        res.status(200).json({
            message: "Información de pagos de esta semana",
            pagos: pagosSemana,
            montoTotal: montoTotalSemana
        });

        } catch (error) {
            console.log("Error: ", error);
            res.status(404).json({message:'Error Al Traer Informacion Para El Panel.', error: error});
        }
    }
}

const infoControllers = new InfoControllers();
export default infoControllers;