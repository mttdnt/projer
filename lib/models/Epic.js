const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const epicSchema = new Schema({
    project_id: { 
        type: Schema.Types.ObjectId, 
        ref: "Project",
        required: true
    },
    epic_key: {
        type: String,
        required: false,
        unique: true
    },
    summary: {
        type: String,
        required: false
    },
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
    priority: {
        type: String,
        required: false
    },
    dependencies: {
        type: Array,
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

module.exports = mongoose.model('Epic', epicSchema);