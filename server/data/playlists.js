var playlist = require('mongoose').model('playlist');

module.exports = {
    create: function(playlist, callback) {
        playlist.create(playlist, callback);
    },
    find: function(criteria, sortBy, callback) {        
        playlist.find(criteria)
            .populate('owner', 'username firstName lastName phone')
            .sort(sortBy)
            .exec(callback); 
    },
    findOne: function(criteria, callback) {        
        playlist.findOne(criteria)
            .populate('owner', 'username firstName lastName phone')
            .exec(callback); 
    },
    update: function(fileId, update, callback) {  
        playlist.findOneAndUpdate({ _id: fileId }, update, callback);
    },
    delete: function(fileId, callback) {  
        playlist.remove({ _id: fileId }, callback);
    },
    count: function(criteria, callback) {
        playlist.count(criteria, callback);
    }
};