const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    name: {
        type: String, 
        required: true
    },
    project_id: {
        type: Schema.Types.ObjectId, 
        ref: 'Project',
        required: true
    },
    capacities: {
        type: Object, 
        required: false
    }
});

teamSchema.index({ "name": 1, "project_id": 1}, { "unique": true });

module.exports = mongoose.model('Team', teamSchema);
