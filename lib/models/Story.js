const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
    project_id: { 
        type: Schema.Types.ObjectId, 
        ref: "Project",
        required: true
    },
    epic_key: {
        type: String,
        required: true
    },
    story_key: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: false
    },
    team: {
        type: String,
        required: false
    },
    points: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Story', storySchema);