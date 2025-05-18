const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors'); 
require('dotenv').config();

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

//log requests to the console
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
