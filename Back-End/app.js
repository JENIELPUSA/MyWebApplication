const express= require('express');
const cors = require('cors');

const morgan =require('morgan');

const ErrorController = require('./Controller/errorController');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const client = redis.createClient({ host: 'localhost' }); // Adjust the Redis configuration based on your setup
const MongoStore = require('connect-mongo');

const PDFRoutes=require('./Routes/PDFRoutes')
const usersroutes = require('./Routes/UserRoutes');

const IncomingRequest=require('./Routes/IncomingRequestRoute')

const categoryroutes = require('./Routes/CategoryRoutes');

const departmentroutes = require('./Routes/DepartmentRoutes');

const laboratoryroutes = require('./Routes/LaboratoryRoutes');

const Equipmentroutes = require('./Routes/EquipmentRoutes');

const AssignEquipment = require('./Routes/AssignRoutes');

const MaintenanceRoutes = require ('./Routes/RequestMaintenanceRoutes')

const MessageRequestRoutes = require('./Routes/MessaRoute');

const MaintenanceTypess = require('./Routes/TypesMaintenancRoute');

const authentic = require('./Routes/authRouter');
let app = express();

const logger =function(res,req,next){
    console.log('Middleware Called')
    next();
}

app.use(express.json());

app.use(session({
  store: new RedisStore({ client }),
  secret: process.env.SECRET_STR,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.CONN_STR,  // Your MongoDB connection string
    ttl: 14 * 24 * 60 * 60,  // Session expires after 14 days
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Only secure cookies in production
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24,
  }
}));
  
app.use(cors({
    origin: process.env.FRONTEND_URL,  // Update with the frontend URL for production
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));

app.use(logger);

if(process.env.NODE_ENV === 'development'){

    app.use(morgan('dev'));
 }

 app.use('/api/v1/users',usersroutes)

 app.use('/api/v1/departments',departmentroutes)

 app.use('/api/v1/authentication',authentic)

 app.use('/api/v1/categorys',categoryroutes)

 app.use('/api/v1/laboratory',laboratoryroutes)

 app.use('/api/v1/equipment',Equipmentroutes )

 app.use('/api/v1/AssignEquipment',AssignEquipment )
 
 app.use('/api/v1/MaintenanceRequest',MaintenanceRoutes )

 app.use('/api/v1/TypesMaintenanceRequest',MaintenanceTypess )
 
 app.use('/api/v1/MessageRequest',MessageRequestRoutes )

 app.use('/api/v1/IncomingRequests',IncomingRequest)

 app.use('/api/v1/GeneratePDF',PDFRoutes)

 app.use(ErrorController);

 // Global error handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err); // ← ← ← importante ito
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong! Please try Again later...',
    });
  });
  

module.exports = app;

