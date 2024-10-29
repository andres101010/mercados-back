// Importaciones usando ES6
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
// import User from '../services/user.services.js'; // Asegúrate de que 'user.services.js' exporte User correctamente

// Crear una instancia de la clase User
// const user = new User();

// Función para verificar el token JWT
export const verifyToken = async (req, res, next) => {
  let token;
  const authorization = req.headers.authorization;

  // Verificar si hay un token en la cabecera de autorización
  if (authorization && authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token JWT.' });
  }

  try {
    // Verificar el token y obtener el ID del usuario
    const { id } = await promisify(jwt.verify)(
      token,
      process.env.SECRET_JWT_SEED
    );

    // Buscar al usuario en la base de datos usando el ID del token
    const userToken = await user.findUser('_id', id);
    if (!userToken) {
      return res.status(401).json({ message: 'Este usuario no está disponible.' });
    }

    // Guardar el usuario en la solicitud
    req.sessionUser = userToken;
    console.log(userToken);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// Función para verificar si el usuario es dueño de la cuenta
export const verifyAccountOwner = async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  // Verificar si el usuario autenticado es el dueño de la cuenta
  if (id !== sessionUser.id) {
    return res.status(401).json({ message: 'No eres dueño de esta cuenta.' });
  }

  next();
};
