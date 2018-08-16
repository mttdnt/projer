const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    epics: [{ type: Schema.Types.ObjectId, ref: 'Epic' }],
    project_key: {
        type: String, 
        required: true
    },
    sprints: {
        type: Array, 
        required: false
    },
    burndown: {
        type: Object, 
        required: false,
    },
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],

});

module.exports = mongoose.model('Project', projectSchema);