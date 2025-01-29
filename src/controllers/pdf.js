import Mercados from '../db/models/mercados.js';
import Arrendatarios from '../db/models/arrendatario.js';
import Pago from '../db/models/pago.js';
import Local from '../db/models/local.js';
class PDF {
    async getInfoPdf(req,res){
        try {
            const {place} = req.params;
            const isOnlyLetters = /^[A-Za-z]+$/.test(place); 
            const isOnlyNumbers = /^[0-9]+$/.test(parseFloat(place));

            const endsWithPago = /pago$/.test(place);
            const endsWithContrato = /contrato$/.test(place); 
            if(isOnlyNumbers && !place.includes('pago')){
                const arrendatarios = await Arrendatarios.find({mercado: place}).populate('local mercado')
                res.status(200).json(arrendatarios);
            } 
            if(endsWithPago){ 

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
        } catch (error) {
            console.log("Error: ", error);
            res.status(404).json({message:'Error Al Buscar Informacion Para el pdf'});
        }
    }
   

    
}

const pdfControllers = new PDF;

export default pdfControllers;