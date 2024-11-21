// Importaciones usando ES6
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../db/models/users.js'; // Asegúrate de que 'user.services.js' exporte User correctamente



// Función para verificar el token JWT
// export const verifyToken = async (req, res, next) => {
//   let token;
//   const authorization = req.headers.authorization;

//   // Verificar si hay un token en la cabecera de autorización
//   if (authorization && authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'No se proporcionó un token JWT.' });
//   }

//   try {
    
//     const decoded = await promisify(jwt.verify)(token, process.env.SECRET_JWT_SEED);
//     const { id } = decoded;
//     // Buscar al usuario en la base de datos usando el ID del token
//     const userToken = await User.findById({_id: id});
//     if (!userToken) {
//       return res.status(401).json({ message: 'Este usuario no está disponible.' });
//     }
//     // Guardar el usuario en la solicitud
//     req.sessionUser = userToken;
//     console.log(userToken);
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Token inválido o expirado.' });
//   }
// };

// export const verifyToken = async (req, res, next) => {
//   console.log("entrooo");
//   let token;

//   // Obtener el token desde la cabecera o desde las cookies
//   const authorization = req.headers.authorization;
//   if (authorization && authorization.startsWith('Bearer')) {
//     token = authorization.split(' ')[1];
//     console.log("token: " , token);
//   } else if (req.cookies && req.cookies.token) {
//     console.log("entroooooo");
//     console.log("a", req.cookies.token);
//     token = req.cookies.jwt; // Nombre de la cookie donde guardaste el token
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'No se proporcionó un token JWT.' });
//   }

//   try {
//     const decoded = await promisify(jwt.verify)(token, process.env.SECRET_JWT_SEED);
//     const { id } = decoded;
    
//     // Buscar al usuario en la base de datos usando el ID del token
//     const userToken = await User.findById(id);
//     if (!userToken) {
//       return res.status(401).json({ message: 'Este usuario no está disponible.' });
//     }
    
//     // Guardar el usuario en la solicitud
//     req.sessionUser = userToken;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Token inválido o expirado.' });
//   }
// };

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt; // Asegúrate de que esté usando req.cookies.jwt
  if (!token) {
      return res.status(401).json({ message: "No se proporcionó un token JWT." });
  }

  try {
      const decoded = jwt.verify(token, process.env.SECRET_JWT_SEED);
    
      req.user = decoded;
      next();
  } catch (err) {
      return res.status(403).json({ message: "Token inválido o expirado." });
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
