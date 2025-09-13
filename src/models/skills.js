import mongoos from "../utils/db.js";
const skillSchema = new mongoos.Schema({
  label: {
    type: String,
    required: true
  },
  skill: {
    type: Array,
    required: true
  }
})

const SkillCollection = mongoos.model('skills', skillSchema)
export default SkillCollection






