const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{
    timestamps: true
}
);

studentSchema.index({ parentId: 1 });
module.exports = mongoose.model("Student", studentSchema);