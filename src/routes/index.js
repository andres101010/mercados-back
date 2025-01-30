
import userController from "../controllers/users.js";  // Importa la instancia del controlador
import mercadoController from "../controllers/mercados.js";
import localControllers from "../controllers/local.js";
import arrendatariosControllers from "../controllers/arrendatarios.js";
import pagosControllers from "../controllers/pago.js";
import infoControllers from "../controllers/info.js";
import pdfControllers from "../controllers/pdf.js";
import { verifyToken } from "../middlewares/validateJwt.js";
import { upload } from "../helpers/upload.js";
import ticketsControllers from "../controllers/tickets.js";
import historialControllers from "../controllers/historial.js";
export default (app) => {

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    // Usuarios

    app.get('/findAllUsers', verifyToken, userController.getAllUsers.bind(userController))

    // Crear usuarios
    app.post('/createUsers',  upload.single("avatar"), userController.createUser.bind(userController));
    
    //Edit Users
    app.put('/editUser/:id', upload.single("avatar"), userController.editUser.bind(userController));

    // Inicio de sesión
    app.post('/loginUser', userController.userLogin.bind(userController));

    // Cerrar Session
    app.post('/logoutUser', userController.userLogout.bind(userController));

    // Recuperar contraseña
    app.put('/recoverPasswordUser', userController.recoverPassword.bind(userController));


    // Mercados
    // Traer Todos los Mercados
    app.get('/allMercados' , mercadoController.getAllMercados.bind(mercadoController))

    // Traer un Mercado
    app.get('oneMearcado/:id', verifyToken, mercadoController.getMercadoById.bind(mercadoController))

    // Crear Mercado
    app.post('/createMercado', verifyToken, mercadoController.createMercado.bind(mercadoController))

    // Editar Mercado
    app.put('/editMercado/:id', verifyToken, mercadoController.updateMercado.bind(mercadoController))

    // Delete Mercado
    app.delete('/deleteMercado/:id', verifyToken, mercadoController.deleteMercado.bind(mercadoController))
    // Local
    // Traer un Local
    app.get('/local:id', verifyToken, localControllers.findOneLocal.bind(localControllers))

    // Traer todos los locales Segun el mercado 
    app.get('/getLocal/:place', verifyToken, localControllers.findAllLocals.bind(localControllers))

    //Crear Local
    app.post('/createLocal/:place', verifyToken, localControllers.createLocal.bind(localControllers))

    // Edit Local
    app.put('/editLocal/:id', verifyToken, localControllers.editLocal.bind(localControllers))

    // Delete Local
    app.delete('/deleteLocal:id', verifyToken, localControllers.deleteLocal.bind(localControllers))

    // Pagos
    app.post('/createObservacion/:id', verifyToken, localControllers.createObservacion.bind(localControllers))

    // Historial
    app.put('/resetLocal/:id', verifyToken, localControllers.resetLocal.bind(localControllers))

    app.get('/historial/:id', verifyToken, historialControllers.getHistorial.bind(historialControllers))

    //Arrendatarios
    //Create Arrendatarios
    app.post('/createArrendatario/:place', verifyToken, arrendatariosControllers.createArrendatario.bind(arrendatariosControllers))

    //Editar Arrendatarios
    app.put('/editArrendatarios', verifyToken, arrendatariosControllers.editArrendatario.bind(arrendatariosControllers))

    //Eliminar Arrendatarios
    app.delete('/deleteArrendatarios', verifyToken, arrendatariosControllers.deleteArrendatario.bind(arrendatariosControllers))

    //Get Arrendatarios
    app.get('/getArrendatarios/:place', verifyToken, arrendatariosControllers.getAllArrendatarios.bind(arrendatariosControllers))

    //Pagos
    //Create Pago
    app.post('/createPagos', verifyToken, pagosControllers.createPago.bind(pagosControllers))

    //Edit Pago
    app.put('/editPagos', verifyToken, pagosControllers.editPago.bind(pagosControllers))

    //Delete Pago
    app.delete('/deletePagos', verifyToken, pagosControllers.deletePago.bind(pagosControllers))

    //Get Pagos
    app.get('/getPagos/:id/:local/:mercado', verifyToken, pagosControllers.getPagosByArrendatario.bind(pagosControllers))

    //INFO
    app.get('/getInfo', verifyToken, infoControllers.getInfo.bind(infoControllers))

    //PDF
    app.get('/:place/pdf', verifyToken, pdfControllers.getInfoPdf.bind(pdfControllers))

    //Tickets
    app.post('/createTickets', verifyToken, ticketsControllers.createTickets.bind(ticketsControllers))

    app.get('/getTickets/:date?', verifyToken, ticketsControllers.getTickets.bind(ticketsControllers))

    app.put('/editTickets', verifyToken, ticketsControllers.editTicket.bind(ticketsControllers))

    app.delete('/deleteTickets/:id', verifyToken, ticketsControllers.deleteTickets.bind(ticketsControllers))
}