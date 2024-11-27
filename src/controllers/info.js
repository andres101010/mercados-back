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

        // // Calcular el monto total de pagos
        // const montoTotalSemana = pagosSemana.reduce((total, pago) => total + pago.monto, 0);
        // console.log("montoTotalSemana",montoTotalSemana);

        // Calcular el monto total de pagos
        const montoTotalSemana = pagosSemana.reduce((total, pago) => total + pago.monto, 0);

        // Generar todas las fechas de la semana
        const diasSemana = [];
        let dia = moment(inicioSemana);
        while (dia.isSameOrBefore(finSemana)) {
            diasSemana.push(dia.format('YYYY-MM-DD'));
            dia.add(1, 'day');
        }

        // Agrupar montos pagados por día
        const montosPorDia = {};
        pagosSemana.forEach(pago => {
            pago.diasPagados.forEach(fecha => {
                if (moment(fecha).isBetween(inicioSemana, finSemana, null, '[]')) {
                    montosPorDia[fecha] = (montosPorDia[fecha] || 0) + pago.monto;
                }
            });
        });

        // // Identificar fechas no pagadas y calcular montos
        const fechasNoPagadas = diasSemana.filter(fecha => !montosPorDia[fecha]);
        const montoTotalNoPagado = fechasNoPagadas.length * 0; // Si no tienes monto estimado, es 0
        const montoTotalPagado = Object.values(montosPorDia).reduce((total, monto) => total + monto, 0);

      

    

        // Generar nombres de días para fechas pagadas y no pagadas
        const diasPagadosConNombres = Object.keys(montosPorDia).map(fecha => ({
            fecha,
            diaSemana: moment(fecha).locale('es').format('dddd'), // Convertir a nombre del día
            monto: montosPorDia[fecha]
        }));

        const diasNoPagadosConNombres = fechasNoPagadas.map(fecha => ({
            fecha,
            diaSemana: moment(fecha).locale('es').format('dddd') // Convertir a nombre del día
        }));

        // Resultado final con días identificados
        const resultado = {
            fechasPagadas: diasPagadosConNombres,
            montoPagado: montoTotalPagado,
            fechasNoPagadas: diasNoPagadosConNombres,
            montoNoPagado: montoTotalNoPagado,
        };

        
        const mercados = await Mercado.find()
        const longitudMercados = mercados.length;
        const arrendatarios = await Arrendatario.find()
        const longitudArrendatarios = arrendatarios.length;
        res.status(200).json({
            message: "Información de esta semana",
            pagos: pagosSemana,
            montoTotal: montoTotalSemana,
            mercados: longitudMercados,
            arrendatarios: longitudArrendatarios,
            result: resultado
        });

        } catch (error) {
            console.log("Error: ", error);
            res.status(404).json({message:'Error Al Traer Informacion Para El Panel.', error: error});
        }
    }
}

const infoControllers = new InfoControllers();
export default infoControllers;