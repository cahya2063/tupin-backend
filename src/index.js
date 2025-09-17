import express from 'express';

import path from 'path';
import url from 'url';
import routes from './routes/index.js';
import cors from 'cors'


const app = express()
const port = 3000
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET','POST','PUT','DELETE'],
    credetials: true
}))

// Middleware untuk parsing JSON
app.use(express.json());

// Kalau pakai form-urlencoded juga bisa aktifkan:
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use(routes)

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})

export default app