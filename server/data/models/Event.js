var mongoose = require('mongoose');

module.exports.init = function() {
    
    var eventSchema = mongoose.Schema({
        title: { type: String, require: '{PATH} is required'},
        description: { type: String, require: '{PATH} is required'},
        videoUrl: String,
        comments: [{
            comments: String
        }],
        date: Date,
        type: String,
        rating: Number,
        category: String,
        season: String,
        owner : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    });

    var Event = mongoose.model('Event', eventSchema);
};