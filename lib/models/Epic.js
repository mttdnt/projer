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
        required: false
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

epicSchema.index({ "epic_key": 1, "project_id": 1}, { "unique": true });

module.exports = mongoose.model('Epic', epicSchema);
