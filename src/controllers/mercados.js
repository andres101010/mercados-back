import Mercados from "../db/Mercados.js"

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
        const mercado = new Mercados(req.body);
        await mercado.save();
        res.status(201).json(mercado);
    }
    
    async updateMercado(req, res) {
        const { id } = req.params;
        const mercado = await Mercados.findByIdAndUpdate(id, req.body, { new: true });
        if (!mercado) return res.status(404).json({ message: "Mercado not found" });
        res.status(200).json(mercado);
    }
}

const mercadoController = new MercadoController();

export default mercadoController;