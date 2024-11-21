import Mercados from "../db/models/mercados.js" 
class MercadoController {
    async getAllMercados(req, res) {
        const mercados = await Mercados.find();
        res.status(200).json(mercados);
    }
    
    async getMercadoById(req, res) {
        const mercado = await Mercados.findById(req.params.id);
        if (!mercado) return res.status(404).json({ message: "Mercado not found" });
        res.status(200).json(mercado);
    }
    
    async createMercado(req, res) {
        const { nombre, direccion, mapLink  } = req.body;
        const mercadoDB = await Mercados.findOne({nombre: nombre, direccion: direccion, mapLink: mapLink});
        if (mercadoDB) return res.status(401).json({ message: "El mercado ya existe" });
        const mercado = new Mercados(req.body);
        await mercado.save();
        res.status(201).json({ message: "Mercado Creado Con Exito!", mercado});
    }
    
    async updateMercado(req, res) {
        const { id } = req.params;
        const mercado = await Mercados.findByIdAndUpdate(id, req.body, { new: true });
        if (!mercado) return res.status(404).json({ message: "Mercado not found" });
        res.status(200).json(mercado);
    }

    async deleteMercado(req, res) {
       const { id } = req.params;
       const mercado = await Mercados.findById(id);
       if(!mercado) return res.status(404).json({ message: "Mercado not found" });
       await mercado.deleteOne(); // deleteOne() es el método más comúnmente recomendado
       return res.status(200).json({ message: "Mercado successfully deleted" });
    }
}

const mercadoController = new MercadoController();

export default mercadoController;