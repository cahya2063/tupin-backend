import mongoos from 'mongoose';
import "dotenv/config";

mongoos.connect(process.env.MONGO_URI).then(()=>{
    console.log("Connected to MongoDB");
    console.log("MONGO_URI = ", process.env.MONGO_URI);

    
}).catch((err)=>{
    console.log("Error connecting to MongoDB:", err);
    
})


export default mongoos;