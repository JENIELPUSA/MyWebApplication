const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const ErrorController = require('./Controller/errorController');

const PDFRoutes = require('./Routes/PDFRoutes');
const usersroutes = require('./Routes/UserRoutes');
const IncomingRequest = require('./Routes/IncomingRequestRoute');
const categoryroutes = require('./Routes/CategoryRoutes');
const departmentroutes = require('./Routes/DepartmentRoutes');
const laboratoryroutes = require('./Routes/LaboratoryRoutes');
const Equipmentroutes = require('./Routes/EquipmentRoutes');
const AssignEquipment = require('./Routes/AssignRoutes');
const MaintenanceRoutes = require('./Routes/RequestMaintenanceRoutes');
const MessageRequestRoutes = require('./Routes/MessaRoute');
const MaintenanceTypess = require('./Routes/TypesMaintenancRoute');
const authentic = require('./Routes/authRouter');

const app = express();

// Correct logger
const logger = function(req, res, next) {
    console.log('Middleware Called');
    next();
};

// Middleware
app.use(express.json());

app.use(session({
  secret: process.env.SECRET_STR,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.CONN_STR,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
}));

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://equipment-preventive-maintenance-front.onrender.com"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));

app.use(logger);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/users', usersroutes);
app.use('/api/v1/departments', departmentroutes);
app.use('/api/v1/authentication', authentic);
app.use('/api/v1/categorys', categoryroutes);
app.use('/api/v1/laboratory', laboratoryroutes);
app.use('/api/v1/equipment', Equipmentroutes);
app.use('/api/v1/AssignEquipment', AssignEquipment);
app.use('/api/v1/MaintenanceRequest', MaintenanceRoutes);
app.use('/api/v1/TypesMaintenanceRequest', MaintenanceTypess);
app.use('/api/v1/MessageRequest', MessageRequestRoutes);
app.use('/api/v1/IncomingRequests', IncomingRequest);
app.use('/api/v1/GeneratePDF', PDFRoutes);

app.use(ErrorController);

// 404 Fallback
app.all("*", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server!`,
        method: req.method
    });
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));  // <-- Serve static files
    
    // Handle all other routes by sending 'index.html' (for frontend routing)
    app.all('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}


module.exports = app;
