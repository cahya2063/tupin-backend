import express from 'express';

import path from 'path';
import url from 'url';
import routes from './routes/index.js';

const app = express()
const port = 3000

// Middleware untuk parsing JSON
app.use(express.json());

// Kalau pakai form-urlencoded juga bisa aktifkan:
app.use(express.urlencoded({ extended: true }));

app.use(routes)

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})

export default app