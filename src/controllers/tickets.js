import tickets from "../db/models/tikets.js";

class TicketController {
    async createTickets(req, res){
        try {
            const { cantidad, rubro } = req.body;
            if (!cantidad || !rubro || cantidad <= 0) {
                return res.status(400).json({ message: 'Datos inválidos. Verifica cantidad y rubro.' });
            }
            const newTickets = await tickets.create({ totalTickets: cantidad, availableTickets: cantidad, rubro });
            res.status(200).json({message:'success'})
        } catch (error) {
            console.log("error creating tickets", error);
            res.status(404).json({message:'Error al Crear Tickets', error});
        }
    }

    async editTicket(req, res) {
        try {
            const { id, cantidad } = req.body;
            console.log("id cantidad", id, cantidad);
            if (!id ||!cantidad || cantidad <= 0) {
                return res.status(400).json({ message: 'Datos inválidos. Verifica ID y cantidad.' });
            }
            const ticket = await tickets.findByIdAndUpdate(
                id,
                { $inc: { availableTickets: -cantidad } }, // Restar cantidad
                { new: true } // Retorna el documento actualizado
            );
            res.status(200).json({message:"success"})            
        } catch (error) {
            console.log("error", error);
            res.status(404).json({message:'Error al Editar Tickets', error});
        }
    }

    async getTickets(req, res) {
        try {
            const tikets = await tickets.find()
            res.status(200).json({message:'success', tikets})
        } catch (error) {
            console.log("error", error);
            res.status(404).json({message:'Error al Obtener Tickets', error});
        }
    }

    async deleteTickets(req, res){
        try {
            const {id}=req.params
            const ticket = await tickets.findByIdAndDelete(id);
            res.status(200).json({message:'success'})
        } catch (error) {
            console.log("error", error);
            res.status(404).json({message:'Error al Eliminar Tickets', error});
        }
    }
}

const ticketsControllers = new TicketController();

export default ticketsControllers;