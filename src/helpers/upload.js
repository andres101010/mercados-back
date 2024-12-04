import multer from "multer";

// export const upload = multer({ 
//     limits: { fileSize: 50 * 1024 * 1024 } // Límite de 50 MB para archivos
//   });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

export const upload = multer({ storage });