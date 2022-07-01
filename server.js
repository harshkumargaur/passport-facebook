const  fs  = require('fs');
const path = require('path');
const https = require('https');

const mongoose = require('mongoose');
const app = require('./app');

mongoose.connection.on('connected',()=>console.log('connected'))
mongoose.connection.on('error',(err)=>console.log(err.message))
mongoose.connection.on('disconnected',()=>console.log('disconnected'))


const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname,'./key.pem')),
    cert: fs.readFileSync(path.join(__dirname,'./cert.pem'))
},app);

server.listen(3000, async ()=> {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('app running on port 3000 (https)')
});