var mongoose = require('mongoose');

module.exports.init = function() {
    
    var eventSchema = mongoose.Schema({
        title: { type: String, require: '{PATH} is required'},
        description: { type: String, require: '{PATH} is required'},
        videoUrl: { String: Array },
        date: Date,
        type: String,
        category: String,
        season: String,
        comments: [String],
        owner : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    });

    var Event = mongoose.model('Event', eventSchema);
};