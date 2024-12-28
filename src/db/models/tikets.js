import mongoose, { Schema } from 'mongoose';

const Tickets = new Schema({
    totalTickets: {
        type: Number,
        required: true,
    },
    availableTickets: {
        type: Number,
        required: true,
    },
    rubro: {
        type: String,
        required: true,
    },
},{timestamps: true})

const tickets = mongoose.model('tickets', Tickets);

export default tickets;
