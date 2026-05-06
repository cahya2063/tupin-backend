import mongoose from 'mongoose'
import "dotenv/config"

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB")
  })
  .catch((err) => {
    console.log("❌ Error connecting to MongoDB:", err.message)
  })

export default mongoose