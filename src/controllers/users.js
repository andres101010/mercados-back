import Users from "../db/models/users.js";
import bcrypt from "bcrypt"
import generateJwt from "../middlewares/jwt.js"



class User {
    // Buscar usuario en la base de datos
    async findUser(fields) {
        try {
            const user = await Users.findOne(fields);
            return user;
        } catch (error) {
            throw new Error(error);
        }
    }

    // Crear nuevo usuario
    async createUser(req,res) {
        try {
            const { name, lastName, email, password, level, avatar, cargo, carnet,phone } = req.body;
            
            // Verificar si el usuario ya existe
            const fields = { email };
            const usuarioExistente = await this.findUser(fields);
            if (usuarioExistente) {
                // return { error: "Email already in use" };
                res.status(400).json({
                    message: "Email already in use",
                })
                return;
            } 
    
            // Generar el hash de la contraseña
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            // Crear un nuevo usuario utilizando Mongoose
            const nuevoUsuario = new Users({
                name,
                lastName,
                email,
                password: hashedPassword,
                level : parseInt(level),
                avatar,
                cargo,
                carnet,
                phone
            });
            await nuevoUsuario.save();
    
            // Generar un token JWT para el nuevo usuario
            // const token = await generateJwt(nuevoUsuario._id);
            res.status(200).json({
                message: "User created successfully",
                user: nuevoUsuario,
               
            })
    
            // return { newUser: nuevoUsuario, token };
    
        } catch (error) {
            console.log("Error creando usuario:", error);
            // return { error: "Error creating user" }; 
            res.status(404).json({
                message: "Error creating user",
                error: error.message,
            })
        }
    }

    async editUser(req,res) {
        try {
           
            const { id } = req.params;
            const usuarioExistente = await this.findUser({ _id: id });
            if (!usuarioExistente) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Verificar si se ha subido una nueva imagen
            let avatarPath = usuarioExistente.avatar;  // Mantener el avatar existente si no se subió uno nuevo

            if (req.file) {
                // Si se subió un archivo, actualizar el campo de avatar con la ruta del archivo
                avatarPath = req.file.path;  // Guarda la ruta completa del archivo
            }


            const updatedData = {
                ...req.body,
                carnet: req.body.carnet ? Number(req.body.carnet) : usuarioExistente.carnet,
                phone: req.body.phone ? Number(req.body.phone) : usuarioExistente.phone,
                avatar: avatarPath,  // Actualizar avatar con la nueva ruta
            };

            const usuarioActualizado = await Users.findByIdAndUpdate(
                id, 
                updatedData, 
                { new: true }
            );
    
            // const usuarioActualizado = await Users.findByIdAndUpdate(id, req.body, { new: true });
    
            
            return res.status(200).json({ message: 'Usuario actualizado correctamente', usuario: usuarioActualizado });
        } catch (error) {
            console.log("Error creating user", error);
            return res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
        }
    }

    // Inicio de sesión del usuario
    async userLogin(req,res) {
        try {
            const { email, password } = req.body;
            const fields = { email };
            const user = await this.findUser(fields);
    
            if (!user) {
                // return { error: "User not found" };
                res.status(404).json({
                    message: "User not found",
                })
                return;
            }
    
            // Comparar la contraseña
            const isValidPassword = await bcrypt.compare(password, user.password);
    
            if (!isValidPassword) {
                // return { error: "Invalid Password" };
                res.status(401).json({
                    message: "Invalid Password",
                })
            } else {
                const token = await generateJwt(user._id);
                const userWithoutPassword = { ...user.toObject() };
                delete userWithoutPassword.password;
                // return { userFound: userWithoutPassword, token };
                const cookieOptions = {
                    httpOnly: true,       // La cookie no será accesible desde JavaScript en el frontend
                    secure: process.env.NODE_ENV === 'production',  // Solo 'true' en producción (solo se enviará en HTTPS)
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',   // La cookie solo se envía para solicitudes al mismo sitio (ajústalo según tus necesidades)
                    maxAge: 24 * 60 * 60 * 1000  // La duración de la cookie en milisegundos (por ejemplo, 1 día)
                };
                
                res.cookie('jwt', token, cookieOptions);
                user.token = token;
                await user.save()
                const avatarUrl = user.avatar ? `${req.protocol}://${req.get('host')}/${user.avatar}` : null;
                res.status(200).json({
                    message: "User logged in successfully",
                    // user: userWithoutPassword,
                    user: {
                        ...userWithoutPassword,  // Propiedades del usuario sin la contraseña
                        avatarUrl: avatarUrl     // Añadir avatarUrl dentro del objeto user
                    },
                    token,
                    
                })
            }
        } catch (error) {
            console.error("Error:", error);
            // return { error: error.message };
            res.status(404).json({
                message: "Error logging in",
                error: error.message,
            })
        }
    }

    // Recuperación de contraseña
    async recoverPassword(req,res) {
        try {
            const { newPassword, email } = req.body;
            const fields = { email };
            const verifyEmail = await this.findUser(fields);

            if (!verifyEmail) {
                // return { error: "This account does not exist" };
                res.status(404).json({
                    message: "This account does not exist",
                })
            } else {
                const salt = await bcrypt.genSalt(12);
                const secretPassword = await bcrypt.hash(newPassword, salt);
                const response = await Usuario.updateOne(
                    { email }, // Filtro para encontrar el usuario
                    { password: secretPassword } // Cambios a realizar
                );
                // return { response };
                res.status(200).json({
                    message: "Password updated successfully",
                    response,
                })
            }
        } catch (error) {
            console.error("Error:", error);
            return { error: "Error updating password" };
        }
    }

    async getAllUsers(req,res) {
        try {
            const users = await Users.find()
            res.status(200).json({message: "Success", users})
        } catch (error) {
            console.log("error", error);
            response.status(500).json({message: "Error getting users", error});
        }
    }
}

const userController = new User();

export default userController;



