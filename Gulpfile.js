var gulp = require('gulp');
var connect = require('connect');
var historyApiFallback = require('connect-history-api-fallback');

// Edit this values to best suit your app
var WEB_PORT = 5000;
var APP_DIR = '.';

// start local http server for development
gulp.task('server', function() {
    serveStatic = require('serve-static');
    connect()
    .use(historyApiFallback)
    .use(serveStatic(APP_DIR))
    .listen(WEB_PORT);

    console.log('Server listening on http://localhost:' + WEB_PORT);
});
