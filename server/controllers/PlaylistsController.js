var encryption = require('../utilities/encryption');
var playlists = require('../data/playlists');
var users = require('../data/users');
var moment = require('moment');
var initiatives = require('../data/category');

var CONTROLLER_NAME = 'playlists';
var URL_PASSWORD = 'magic unicorns pesho gosho1';
var playlistTypes = ['public', 'initiative-based', 'initiative-and-season-based'];

function hasInitiative(user, playlist) {
    var hasInitiative = false;
    user.initiatives.forEach(function (initiative) {
        if (initiative.name == playlist.initiative)
            hasInitiative = true;
    });
    
    return hasInitiative;
}

function hasInitiativeSeason(user, playlist) {
    var hasInitiative = false;
    user.initiatives.forEach(function (initiative) {
        if (initiative.name == playlist.initiative && initiative.season == playlist.season)
            hasInitiative = true;
    });
    
    return hasInitiative;
}

module.exports = {
    getCreate : function(req, res, next) {
        res.render(CONTROLLER_NAME + '/create', {initiatives: JSON.stringify(initiatives)});
    },
    postCreate: function(req, res, next) {

        var newplaylistForm = req.body;

        newplaylistForm.rating = Math.floor((Math.random() * 5) + 1);

        newplaylistForm.comments = [];
        if (newplaylistForm.type == 'public') {
            newplaylistForm.intiative = undefined;
            newplaylistForm.season = undefined;
        }
        
        if (newplaylistForm.type == 'initiative-based') {
            newplaylistForm.season = undefined;
        }
        
        newplaylistForm.owner = req.user._id;
        newplaylistForm.date = new Date();
    
        playlists.create(newplaylistForm, function(err, user) {
            if (err) {
                return res.status(403).send({ message: 'Error saving playlist!', err: err});
            }
            
            res.redirect('/passed-playlists');
        });
    },
    getActive: function (req, res) {

        var today = new Date();    
        playlists.find({date: { $gt: today }}, {'date' : 'desc'}, function (err, playlists) {
            playlists.forEach(function (playlist) {
                playlist.joined = false;
                if (req.user.joinedplaylists.indexOf(playlist._id) >= 0)
                    playlist.joined = true;
            });
            res.render(CONTROLLER_NAME + '/active-playlists', {playlists: playlists, moment: moment});
        });
    },
    getPassed: function (req, res) {

        var today = new Date();    
        playlists.find({date: { $lt: today }}, {'date' : 'desc'}, function (err, playlists) {
            playlists.forEach(function (playlist) {
                playlist.joined = false;
                if (req.user.joinedplaylists.indexOf(playlist._id) >= 0)
                    playlist.joined = true;
            });
            res.render(CONTROLLER_NAME + '/passed-playlists', {playlists: playlists, moment: moment});
        });
    },
    getDetail: function(req, res, next) {   
    
        playlists.findOne({_id: req.params.id}, function(err, playlist) {
            if (!playlist) {
                return res.status(400).send({ message: 'playlist does not exist!'});
            }

            playlist.joined = false;
            if (req.user.joinedplaylists.indexOf(playlist._id) >= 0)
                playlist.joined = true;
    
            res.render(CONTROLLER_NAME + '/playlist-detail', {playlist: playlist, moment: moment});
        });
    },
    join: function(req, res, next) {   
    
        playlists.findOne({_id: req.params.id}, function(err, playlist) {

            if (!playlist) {
                req.session.error = 'Playlist does not exist!';
                return res.status(400).send({ message: 'Playlist does not exist!'});
            }            
    
            if (playlist.owner.equals(req.user)) {
                req.session.error = 'You already rated this playlist!';
                return res.status(400).send({ message: 'You already rated this playlist!'});
            }
            
            if (req.user.joinedplaylists.indexOf(playlist._id) >= 0) {
                req.session.error = 'You already rated this playlist!';
                return res.status(400).send({ message: 'You already rated this playlist!'});
            }
            
            // ['public', 'initiative-based', 'initiative-and-season-based']
            if (playlist.type == 'initiative-based' && !hasInitiative(req.user, playlist)) {
                req.session.error = 'You are not part of this initiative!';
                return res.status(400).send({ message: 'You are not part of this initiative!'});
            }
            
            if (playlist.type == 'initiative-and-season-based' && !hasInitiativeSeason(req.user, playlist)) {
                req.session.error = 'You are not part of this initiative and season!';
                return res.status(400).send({ message: 'You are not part of this initiative and season!'});
            }
            
            req.user.joinedplaylists.push(playlist._id);
            users.update(req.user, {joinedplaylists: req.user.joinedplaylists}, function (err) {
                if (err) throw err;
                res.send('Playlist rated!');
            });            
        });
    },
    leave: function(req, res, next) {   
    
        playlists.findOne({_id: req.params.id}, function(err, playlist) {
            console.log(playlist);
            if (!playlist) {
                req.session.error = 'playlist does not exist!';
                return res.status(400).send({ message: 'playlist does not exist!'});
            }            
    
            if (playlist.owner.equals(req.user)) {
                req.session.error = 'You cannot leave your own playlist!';
                return res.status(400).send({ message: 'You cannot leave your own playlist!'});
            }
            
            if (req.user.joinedplaylists.indexOf(playlist._id) < 0) {
                req.session.error = 'You are not part of this playlist!';
                return res.status(400).send({ message: 'You are not part of this playlist!'});
            }    
            
            req.user.joinedplaylists.remove(playlist._id);
            users.update(req.user, {joinedplaylists: req.user.joinedplaylists}, function (err) {
                if (err) throw err;
                res.send('playlist left!');
            });            
        });
    },
};