import express from 'express';

import path from 'path';
import url from 'url';
import routes from './routes/index.js';
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io';


const app = express()
const port = 3000
const origin = '*'

const server = http.createServer(app)
app.use(cors({
    origin: origin,
    methods: ['GET','POST','PUT','DELETE'],
    credetials: true
}))

//middleware
// Middleware untuk parsing JSON
app.use(express.json());

// Kalau pakai form-urlencoded juga bisa aktifkan:
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use(routes)


const io = new Server(server, {
    cors:{
        origin: origin,
        methods: ['GET', 'POST']
    }
})

//event koneksi
io.on('connection', (socket)=>{
    // console.log('user connected : ', socket.id);

    // user join room berdasarkan chatId
    socket.on('join_room', (chatId)=>{
        socket.join(chatId)
        // console.log(`user ${socket.id} join room ${chatId}`);

        
    })

    socket.on('send_message', (data)=>{
        console.log('pesan baru : ', data);
        // kirim pesan ke user yang satu room
        io.to(data.chatId).emit('receive_message', data)

    })

    socket.on('disconnect', ()=>{
        // console.log('user disconected : ', socket.id);
        
    })

    
})

// Middleware error handler global
app.use((err, req, res, next) => {
    console.error('Terjadi error:', err.stack)
    res.status(500).json({
        message: err.message || 'Terjadi kesalahan pada server'
    })
})

server.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})

export {io}