const express= require('express');
const cors = require('cors');

const morgan =require('morgan');

const ErrorController = require('./Controller/errorController');
const session = require('express-session');




const usersroutes = require('./Routes/UserRoutes');

const categoryroutes = require('./Routes/CategoryRoutes');

const departmentroutes = require('./Routes/DepartmentRoutes');

const laboratoryroutes = require('./Routes/LaboratoryRoutes');

const Equipmentroutes = require('./Routes/EquipmentRoutes');

const AssignEquipment = require('./Routes/AssignRoutes');

const MaintenanceRoutes = require ('./Routes/RequestMaintenanceRoutes')

const MessageRequestRoutes = require('./Routes/MessaRoute')

const authentic = require('./Routes/authRouter');
let app = express();

const logger =function(res,req,next){
    console.log('Middleware Called')
    next();
}

app.use(express.json());

app.use(session({
    secret: process.env.SECRET_STR,  // Use an environment variable for session secret
    resave: false,                       // Don't resave session if not modified
    saveUninitialized: false,            // Don't create session until something is stored
}));

app.use(cors({
    origin:["http://localhost:5173"],
    methods:["GET","POST","PATCH","DELETE"],
    Credential:true
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
 app.use('/api/v1/MessageRequest',MessageRequestRoutes )
 

 app.use(ErrorController);

module.exports = app;

