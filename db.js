const mongoose = require('mongoose');
require('dotenv').config();


// const mongoURL = process.env.MONGODB_URL_LOCAL;
const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;


db.on('connected', () => {
    console.log('connected to mongoDB server');
})


db.on('error', () => {
    console.log('connected to mongoDB server');
})


db.on('disconnected', () => {
    console.log('connected to mongoDB server');
})

module.exports = db;