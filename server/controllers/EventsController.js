var encryption = require('../utilities/encryption');
var events = require('../data/events');
var users = require('../data/users');
var moment = require('moment');
var initiatives = require('../data/category');

var CONTROLLER_NAME = 'events';
var URL_PASSWORD = 'magic unicorns pesho gosho1';
var eventTypes = ['public', 'initiative-based', 'initiative-and-season-based'];

function hasInitiative(user, event) {
    var hasInitiative = false;
    user.initiatives.forEach(function (initiative) {
        if (initiative.name == event.initiative)
            hasInitiative = true;
    });
    
    return hasInitiative;
}

function hasInitiativeSeason(user, event) {
    var hasInitiative = false;
    user.initiatives.forEach(function (initiative) {
        if (initiative.name == event.initiative && initiative.season == event.season)
            hasInitiative = true;
    });
    
    return hasInitiative;
}

module.exports = {
    getCreate : function(req, res, next) {
        res.render(CONTROLLER_NAME + '/create', {initiatives: JSON.stringify(initiatives)});
    },
    postCreate: function(req, res, next) {

        var newEventForm = req.body;

        newEventForm.rating = Math.floor((Math.random() * 5) + 1);

        newEventForm.comments = [];
        if (newEventForm.type == 'public') {
            newEventForm.intiative = undefined;
            newEventForm.season = undefined;
        }
        
        if (newEventForm.type == 'initiative-based') {
            newEventForm.season = undefined;
        }
        
        newEventForm.owner = req.user._id;
        newEventForm.date = new Date();
    
        events.create(newEventForm, function(err, user) {
            if (err) {
                return res.status(403).send({ message: 'Error saving event!', err: err});
            }
            
            res.redirect('/passed-events');
        });
    },
    getActive: function (req, res) {

        var today = new Date();    
        events.find({date: { $gt: today }}, {'date' : 'desc'}, function (err, events) {
            events.forEach(function (event) {
                event.joined = false;
                if (req.user.addedRights.indexOf(event._id) >= 0)
                    event.joined = true;
            });
            res.render(CONTROLLER_NAME + '/active-events', {events: events, moment: moment});
        });
    },
    getPassed: function (req, res) {

        var today = new Date();    
        events.find({date: { $lt: today }}, {'date' : 'desc'}, function (err, events) {
            events.forEach(function (event) {
                event.joined = false;
                if (req.user.addedRights.indexOf(event._id) >= 0)
                    event.joined = true;
            });
            res.render(CONTROLLER_NAME + '/passed-events', {events: events, moment: moment});
        });
    },
    getDetail: function(req, res, next) {   
    
        events.findOne({_id: req.params.id}, function(err, event) {
            if (!event) {
                return res.status(400).send({ message: 'Event does not exist!'});
            }

            event.joined = false;
            if (req.user.addedRights.indexOf(event._id) >= 0)
                event.joined = true;
    
            res.render(CONTROLLER_NAME + '/event-detail', {event: event, moment: moment});         
        });
    },
    join: function(req, res, next) {   
    
        events.findOne({_id: req.params.id}, function(err, event) {

            if (!event) {
                req.session.error = 'Playlist does not exist!';
                return res.status(400).send({ message: 'Playlist does not exist!'});
            }            
    
            if (event.owner.equals(req.user)) {
                req.session.error = 'You already rated this playlist!';
                return res.status(400).send({ message: 'You already rated this playlist!'});
            }
            
            if (req.user.addedRights.indexOf(event._id) >= 0) {
                req.session.error = 'You already rated this playlist!';
                return res.status(400).send({ message: 'You already rated this playlist!'});
            }
            
            // ['public', 'initiative-based', 'initiative-and-season-based']
            if (event.type == 'initiative-based' && !hasInitiative(req.user, event)) {
                req.session.error = 'You are not part of this initiative!';
                return res.status(400).send({ message: 'You are not part of this initiative!'});
            }
            
            if (event.type == 'initiative-and-season-based' && !hasInitiativeSeason(req.user, event)) {
                req.session.error = 'You are not part of this initiative and season!';
                return res.status(400).send({ message: 'You are not part of this initiative and season!'});
            }
            
            req.user.addedRights.push(event._id);
            users.update(req.user, {addedRights: req.user.addedRights}, function (err) {
                if (err) throw err;
                res.send('Playlist rated!');
            });            
        });
    },
    leave: function(req, res, next) {   
    
        events.findOne({_id: req.params.id}, function(err, event) {
            console.log(event);
            if (!event) {
                req.session.error = 'Event does not exist!';
                return res.status(400).send({ message: 'Event does not exist!'});
            }            
    
            if (event.owner.equals(req.user)) {
                req.session.error = 'You cannot leave your own event!';
                return res.status(400).send({ message: 'You cannot leave your own event!'});
            }
            
            if (req.user.addedRights.indexOf(event._id) < 0) {
                req.session.error = 'You are not part of this event!';
                return res.status(400).send({ message: 'You are not part of this event!'});
            }    
            
            req.user.addedRights.remove(event._id);
            users.update(req.user, {addedRights: req.user.addedRights}, function (err) {
                if (err) throw err;
                res.send('Event left!');    
            });            
        });
    },
};