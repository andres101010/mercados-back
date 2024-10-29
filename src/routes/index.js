import { Router } from "express";
import userController from "../controllers/users.js";  // Importa la instancia del controlador
import mercadoController from "../controllers/mercados.js";
export default (app) => {

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    // Crear usuarios
    app.post('/createUsers', userController.createUser.bind(userController));
    
    // Inicio de sesión
    app.post('/loginUser', userController.userLogin.bind(userController));

    // Recuperar contraseña
    app.put('/recoverPasswordUser', userController.recoverPassword.bind(userController));
}