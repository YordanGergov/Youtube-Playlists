var UsersController = require('./UsersController'),
    playlistsController = require('./playlistsController');
var StatsController = require('./StatsController');

module.exports = {
    users: UsersController,
    playlists: playlistsController,
    stats: StatsController
};