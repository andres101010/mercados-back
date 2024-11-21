import express from 'express';
import morgan from 'morgan';
import dbConect from './src/db/configs.js'
import routes from './src/routes/index.js';
import cookieParser from 'cookie-parser';
const app = express();

// Middleware to parse JSON request bodies

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Middleware to log request details

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date()}`);
  next();
});

app.use((req, res, next) => {
    const allowedOrigins = [process.env.URL_LOCAL, process.env.URL_SERVER];
    const origin = req.headers.origin;

  
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
  
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
  });


  // routes
  routes(app)


const start = async () => {
    try {
        app.listen(process.env.PORT || 3000)
        dbConect()
            .then(() => {
                console.log('Aplicación conectada a la base de datos MongoDB Atlas');
            })
            .catch(error => {
                console.error('Error al conectar a la base de datos MongoDB Atlas:', error);
            });
    } catch (error) {
        console.log("error al iniciar", error);
    }
}

start();




