import mongoose from "mongoose";
import userCollection from "../models/users.js"
import updateProfileValidation from "../validation/profile.js"
const ObjectId = mongoose.Types.ObjectId


const getProfile = async (req, res, next) => {// client, teknisi
    try {
        const { id } = req.params
        const user = await userCollection
            .findOne({ _id: new ObjectId(id) }, { password: 0 }) // Exclude password
            .lean()
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' })
        }
        return res.status(200).json({ user })
    } catch (error) {
        next(error)
    }
}
const updateProfile = async (req, res, next)=>{// client, teknisi
    try {        
        const {id} = req.params
        
        const validasi = updateProfileValidation(req.body)
        if(validasi?.status === false){
            return res.status(400).json({
                'message': validasi.message
            })
        }

        const result = await userCollection.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: validasi.data }
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' })
        }

        if (result.modifiedCount > 0) {
            return res.status(200).json({ message: 'Berhasil update profile' })
        }

        return res.status(400).json({ message: 'Tidak ada perubahan data' })
    } catch (error) {
        next(error)
    }
    
}

const updateAvatar = async (req, res, next) => {// client, teknisi
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diupload" });
    }

    const avatarPath = `/uploads/profile/${req.file.filename}`;

    const result = await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { avatar: avatarPath } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res
      .status(200)
      .json({ message: "Avatar berhasil diupdate", avatar: avatarPath });
  } catch (error) {
    next(error);
  }
};

export { updateProfile, getProfile, updateAvatar };