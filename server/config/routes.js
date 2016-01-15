var auth = require('./auth'),
    controllers = require('../controllers');

module.exports = function(app) {
    // User
    app.get('/register', controllers.users.getRegister);
    app.post('/register', controllers.users.postRegister);
    app.get('/login', controllers.users.getLogin);
    app.get('/profile', auth.isAuthenticated, controllers.users.getProfile);
    app.post('/profile', auth.isAuthenticated, controllers.users.postProfile);
    
    // Auth
    app.post('/login', auth.login);
    app.get('/logout', auth.isAuthenticated, auth.logout);

    // playlists
    app.get('/playlists/:id', auth.isAuthenticated, controllers.playlists.getDetail);
    app.post('/playlists/join/:id', auth.isAuthenticated, controllers.playlists.join);
    app.post('/playlists/leave/:id', auth.isAuthenticated, controllers.playlists.leave);
    app.get('/create', auth.isAuthenticated, controllers.playlists.getCreate);
    app.post('/create', auth.isAuthenticated, controllers.playlists.postCreate);
    app.get('/active-playlists', auth.isAuthenticated, controllers.playlists.getActive);
    app.get('/passed-playlists', auth.isAuthenticated, controllers.playlists.getPassed);

    app.get('/', controllers.stats.getStats);

    app.get('*', function(req, res) {
        res.render('index');
    });
};