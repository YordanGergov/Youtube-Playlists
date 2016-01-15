var playlists = require('../data/playlists');

function getStats(req, res, next) {
    var today = new Date();
    playlists.count({date: { $lt: today }}, function (err, totalplaylists) {
        if (err) throw err;        
        res.render('index', {passedplaylists: totalplaylists });
    });
} 

module.exports = {
    getStats: getStats   
}