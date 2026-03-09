const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
{
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    summary: {
        type: String
    },
    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }
    ]
},
{
    timestamps: true
}
);

sessionSchema.index({ lessonId: 1 });
module.exports = mongoose.model("Session", sessionSchema);