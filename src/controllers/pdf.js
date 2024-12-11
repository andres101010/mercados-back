import Mercados from '../db/models/mercados.js';
import Arrendatarios from '../db/models/arrendatario.js';

class PDF {
    async getInfoPdf(req,res){
        try {
            const {place} = req.params;
            console.log("place: ", place);
            const arrendatarios = await Arrendatarios.find({mercado: place}).populate('local mercado')
            res.status(200).json(arrendatarios);
        } catch (error) {
            console.log("Error: ", error);
            res.status(404).json({message:'Error Al Buscar Informacion Para el pdf'});
        }
    }
}

const pdfControllers = new PDF;

export default pdfControllers;