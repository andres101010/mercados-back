import Mercados from '../db/models/mercados.js';
import Arrendatarios from '../db/models/arrendatario.js';
import Pago from '../db/models/pago.js';
import Local from '../db/models/local.js';
import moment from 'moment';
class PDF {
    async getInfoPdf(req,res){
        try {
            const {place} = req.params;
            const isOnlyLetters = /^[A-Za-z]+$/.test(place); 
            const isOnlyNumbers = /^[0-9]+$/.test(parseFloat(place));

            const endsWithPago = /pago$/.test(place);
            const endsWithContrato = /contrato$/.test(place); 
            const endsWithObservaciones = /observaciones$/.test(place); 
            const endsWithPagoTodoElAño = /todoElAño$/.test(place); 


            if(isOnlyNumbers && !place.includes('pago') && !place.includes('observaciones') && !place.includes('todoElAño')){
                console.log("entroo 1")
                const arrendatarios = await Arrendatarios.find({mercado: place}).populate('local mercado')
                res.status(200).json([{reporte:arrendatarios}]);
            } 
            if(endsWithPago){ 
                console.log("entrooo 2")
                const idArrendatario = place.replace('pago', ' ').trim();
                // const pago = await Pago.findOne({arrendatario: idArrendatario}).sort({ fechaPago: -1 }).populate('arrendatario local');
                
                const pago = await Pago.findOne({ arrendatario: idArrendatario }) .sort({ fechaPago: -1 }).populate({ path: 'arrendatario local', populate: { path: 'mercado', select:'nombre' } })
                res.status(200).json([{pago:pago}]);
            }
            if(endsWithContrato){
                const idLocal = place.replace('contrato','').trim();
                const local = await Local.findOne({ _id: idLocal }).populate('mercado arrendatario')
                const pago = await Pago.findOne({local: idLocal})
                
                // res.status(200).json([{contrato:local}])
                res.status(200).json([{ contrato: { ...local.toObject(), pago } }]);

            }
            if(endsWithObservaciones){

                const idobservacion = place.replace('observaciones','').trim();
                const local = await Local.findOne({ "observaciones._id": idobservacion }).populate('mercado arrendatario');
                const observacionEncontrada = local.observaciones.find(obs => obs._id.toString() === idobservacion.toString());
                res.status(200).json([{
                    observacion: observacionEncontrada,
                    mercado: local.mercado,
                    arrendatario: local.arrendatario
                }]);
            }
            if(endsWithPagoTodoElAño){
                console.log("entrooooooooo")
                const idArrendatario = place.replace('todoElAño', ' ').trim();
                // console.log("idArrendatario",idArrendatario)
                // Función para obtener días del mes sin los excluidos
            
                const getDiasDelMes = (mes, diasPagados, diasExcluidos) => {
                    if (!diasPagados || diasPagados.length === 0) {
                        console.error("Error: No hay datos en diasPagados");
                        return { diasTotales: 0, anio: null };
                    }
                
                    // Extraer el año del primer día pagado válido
                    const primerDia = diasPagados.find(dia => moment(dia, "YYYY-MM-DD", true).isValid());
                
                    if (!primerDia) {
                        console.error("Error: No se encontró una fecha válida en diasPagados");
                        return { diasTotales: 0, anio: null };
                    }
                
                    const anio = moment(primerDia, "YYYY-MM-DD").year(); // Extraer el año
                    // console.log("Año extraído:", anio);
                
                    const meses = {
                        "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
                        "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
                    };
                
                    // Convertir el mes a número si es necesario
                    mes = typeof mes === "string" ? meses[mes.toLowerCase()] || parseInt(mes, 10) : parseInt(mes, 10);
                
                    if (isNaN(mes) || isNaN(anio)) {
                        console.error("Error: mes o año no son números válidos");
                        return { diasTotales: 0, anio: null };
                    }
                
                    let diasEnMes = moment({ year: anio, month: mes - 1 }).daysInMonth();
                    let diasExcluidosCount = Array.isArray(diasExcluidos) ? diasExcluidos.length : 0;
                
                    return { diasTotales: diasEnMes - diasExcluidosCount, anio };
                };
                
                const pagos = await Pago.find({ arrendatario: idArrendatario })
                    .populate({ path: 'local', select: 'fechaDeContrato' });
                
                const fechaContrato = pagos.length > 0 ? pagos[0].local.fechaDeContrato : null;
                
               

                const resumenPagos = {};


                pagos.forEach((pago) => {
                    const { mes, diasPagados, diasExcluidos, montoPorDia } = pago;
                    
                    // Obtener días totales y año
                    const { diasTotales, anio } = getDiasDelMes(mes, diasPagados, diasExcluidos);
                    
                    // Convertir a Set para evitar duplicados
                    const diasPagadosUnicos = new Set(diasPagados.map(dia => moment(dia).format('YYYY-MM-DD')));
                    const diasExcluidosUnicos = new Set(diasExcluidos.map(dia => moment(dia).format('YYYY-MM-DD')));
                    
                    // console.log("diasExcluidosUnicos", diasExcluidosUnicos);
                    // console.log("diasExcluidosCount", diasExcluidosUnicos.size);
                
                    // Clave única para el mes y año
                    const claveMesAnio = `${mes}-${anio}`;
                
                    // Si el mes-año no existe en el resumen, lo inicializamos
                    if (!resumenPagos[claveMesAnio]) {
                        resumenPagos[claveMesAnio] = {
                            diasTotales,
                            diasPagados: new Set(), // Usamos Set para evitar duplicados
                            diasExcluidos: new Set(), // 🔥 Cambiamos a Set para evitar duplicados
                            diasAdeudados: 0,
                            deudaMensual: 0,
                        };
                    }
                
                    // Agregar los días pagados únicos al Set global del mes
                    diasPagadosUnicos.forEach(dia => resumenPagos[claveMesAnio].diasPagados.add(dia));
                
                    // Agregar los días excluidos únicos al Set global del mes
                    diasExcluidosUnicos.forEach(dia => resumenPagos[claveMesAnio].diasExcluidos.add(dia));
                
                    // Calcular días pagados reales sin duplicados
                    const totalDiasPagados = resumenPagos[claveMesAnio].diasPagados.size;
                
                    // Calcular días excluidos reales sin duplicados
                    const totalDiasExcluidos = resumenPagos[claveMesAnio].diasExcluidos.size;
                
                    // Calcular días adeudados correctamente
                    const diasTotalesConExcluidos = resumenPagos[claveMesAnio].diasTotales - totalDiasExcluidos;
                    resumenPagos[claveMesAnio].diasAdeudados = Math.max(0, diasTotalesConExcluidos - totalDiasPagados);
                    resumenPagos[claveMesAnio].deudaMensual = resumenPagos[claveMesAnio].diasAdeudados * montoPorDia;
                });
                
                // Convertir los Sets de `diasPagados` y `diasExcluidos` en números
                Object.keys(resumenPagos).forEach(clave => {
                    resumenPagos[clave].diasPagados = resumenPagos[clave].diasPagados.size;
                    resumenPagos[clave].diasExcluidos = resumenPagos[clave].diasExcluidos.size;
                });
                
                const deudaAnual = Object.values(resumenPagos).reduce((acc, mes) => acc + mes.deudaMensual, 0);

                const ordenarMeses = (resumenPagos) => {
                    return Object.entries(resumenPagos)
                      .sort(([mesAño1], [mesAño2]) => {
                        // Extraer mes y año de cada clave
                        const [mes1, año1] = mesAño1.split('-');
                        const [mes2, año2] = mesAño2.split('-');
                  
                        // Convertir mes a número (Ejemplo: "Enero" -> 1)
                        const mesesOrden = {
                          'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
                          'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
                        };
                  
                        const numMes1 = mesesOrden[mes1];
                        const numMes2 = mesesOrden[mes2];
                  
                        // Comparar primero por año, luego por mes
                        return año1 - año2 || numMes1 - numMes2;
                      });
                  };
                  
                  const mesesOrdenados = ordenarMeses(resumenPagos);

                
                // console.log("Resumen de Pagos:", resumenPagos);
                // console.log("Deuda Anual:", deudaAnual);
                

                
                res.status(200).json([{
                    fechaContrato,
                    resumenPagos: mesesOrdenados,
                    deudaAnual
                }]);

            }
        } catch (error) {
            console.log("Error: ", error);
            res.status(404).json({message:'Error Al Buscar Informacion Para el pdf'});
        }
    }
   

    
}

const pdfControllers = new PDF;

export default pdfControllers;