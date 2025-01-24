import Local from "../db/models/local.js";
import Pago from "../db/models/pago.js";
import moment from "moment";
class PagoController {
    async createPago(req,res){
        try {
            const { arrendatario, local, diasPagados, monto, mes, excludedDates  } = req.body;
            

            // Convertir el mes en un formato que podamos usar
const monthDate = new Date(mes);
const year = monthDate.getFullYear();
const month = monthDate.getMonth(); // Enero es 0, Febrero es 1, etc.
console.log("month", month);

// Obtener la cantidad total de días del mes
const daysInMonth = new Date(year, month + 1, 0).getDate();

// Crear un array con todos los días del mes
const allDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    // Formatear la fecha como 'YYYY-MM-DD'
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
});

// Excluir las fechas del array total
const paidDays = allDays.filter(day => !excludedDates.includes(day));

// Calcular el monto por día
const dailyAmount = monto / paidDays.length;

// Resultado
console.log("Días totales en el mes:", daysInMonth);
console.log("Días pagados:", paidDays);
console.log("Días pagados total:", paidDays.length);
console.log("Monto por día:", dailyAmount.toFixed(2));

            // Validar que los datos mínimos estén presentes
            // if (!arrendatario || !local || !diasPagados || diasPagados.length === 0) {
            //     return res.status(400).json({ error: 'Todos los campos son obligatorios y debe haber al menos un día pagado.' });
            // }

             // Validar formato de fechas
            //  const diasInvalidos = diasPagados.filter(dia => !moment(dia, 'YYYY-MM-DD', true).isValid());
            //  if (diasInvalidos.length > 0) {
            //      return res.status(400).json({ error: `Las siguientes fechas son inválidas: ${diasInvalidos.join(', ')}` });
            //  }

            // const pagoHechos = await Pago.find({arrendatario:arrendatario, local:local});
           

            //   // Consolidar todas las fechas ya pagadas en un solo array
            // const fechasPagadas = pagoHechos.flatMap(pago => pago.diasPagados);

            // Dividir las fechas en dos grupos: ya pagadas y nuevas válidas
            const fechasYaPagadas = paidDays.filter(fecha => paidDays.includes(fecha));
            const fechasNuevas = paidDays.filter(fecha => !paidDays.includes(fecha));

            if (fechasNuevas.length === 0) {
                return res.status(400).json({
                    error: 'Todas las fechas proporcionadas ya han sido pagadas.',
                    fechasYaPagadas
                });
            }
            
            // const montoDia = monto / diasPagados.length
            const nuevoPago = new Pago({
                arrendatario,
                local,
                diasPagados: paidDays,
                monto,
                montoPorDia:  dailyAmount.toFixed(2),
                diasExcluidos: excludedDates,
                mes: month == 0 ? "Enero" : month == 1 ? "Febrero" : month == 2 ? "Marzo" : month == 3 ? "Abril" : month == 4 ? "Mayo" : month == 5 ? "Junio" : month == 6 ? "Julio" : month == 7 ? "Agosto" : month == 8 ? "Septiembre" : month == 9 ? "Octubre" : month == 10 ? "Noviembre" : month == 11 ? "Diciembre" : null,
            });
            await nuevoPago.save();

            return res.status(201).json({
                message: fechasYaPagadas.length > 0
                    ? 'Pago registrado parcialmente. Algunas fechas ya estaban pagadas.'
                    : 'Pago registrado exitosamente.',
                // fechasRegistradas: fechasNuevas,
                advertencia: fechasYaPagadas.length > 0 ? fechasYaPagadas : null,
                // pago: nuevoPago,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async editPago(req, res) {
        try {
            const { id } = req.params; // ID del pago que se quiere editar
            const { fechaInicial, fechaFinal, monto, local, arrendatario } = req.body;

            // Actualiza el pago con los nuevos valores
            const updatedPago = await Pago.findByIdAndUpdate(
                id,
                { fechaInicial, fechaFinal, monto, local, arrendatario },
                { new: true } // Retorna el pago actualizado
            );

            if (!updatedPago) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }

            res.status(200).json({ message: "Pago actualizado con éxito", updatedPago });
        } catch (error) {
            console.log("Error al editar el Pago", error);
            res.status(500).json({ message: "Hubo un error al editar el Pago", error });
        }
    }

    // Eliminar un pago existente
    async deletePago(req, res) {
        try {
            const { id } = req.params; // ID del pago que se quiere eliminar

            // Elimina el pago
            const deletedPago = await Pago.findByIdAndDelete(id);

            if (!deletedPago) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }

            res.status(200).json({ message: "Pago eliminado con éxito", deletedPago });
        } catch (error) {
            console.log("Error al eliminar el Pago", error);
            res.status(500).json({ message: "Hubo un error al eliminar el Pago", error });
        }
    }

    // Obtener todos los pagos de un arrendatario específico
    async getPagosByArrendatario(req, res) {
        try {
            const { fechaInicial, fechaFinal } = req.query;
            const arrendatarioId = req.params.id;
            const idLocal = req.params.local;
            const idMercado = req.params.mercado;
            const local = await Local.findOne({_id: idLocal, mercado: idMercado});
            // Generar lista de días del rango
            const todosLosDias = [];
            const inicio = moment(fechaInicial, 'YYYY-MM-DD');
            const fin = moment(fechaFinal, 'YYYY-MM-DD');
    
            for (let fecha = inicio; fecha.isSameOrBefore(fin); fecha.add(1, 'days')) {
                todosLosDias.push(fecha.format('YYYY-MM-DD'));
            }
    
            // Obtener días pagados del arrendatario
            const pagos = await Pago.find({ arrendatario: arrendatarioId });
            const diasPagados = pagos.flatMap(pago => pago.diasPagados);
    
            // Identificar días no pagados
            const diasNoPagados = todosLosDias.filter(dia => !diasPagados.includes(dia));
    
            res.status(200).json({ message:'success',  pagados: diasPagados , noPagados: diasNoPagados, fechaDeContrato: local.fechaDeContrato });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

const pago = new PagoController;
export default pago;