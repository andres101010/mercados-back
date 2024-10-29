import mongoose, { Schema } from "mongoose";

const users = new Schema({
    name:{type: String, required:true},
    lastName:{type: String, required:true},
    email:{type: String, required:true, unique:true},
    password:{type: String, required:true},
    level:{type: Number, required:true},
    isActive:{type: Boolean, required:true, default:true},
    avatar:{type: String, default:null},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
})

const Users = mongoose.model('Users',users)

export default Users;