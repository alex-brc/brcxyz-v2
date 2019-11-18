// Gulp task for a local server

var gulp = require('gulp');
var bs   = require('browser-sync').create();   

gulp.task('server', function() {
  bs.init({
    server: {
       baseDir: "./",
    },
    port: 5000,
    reloadOnRestart: true,
    browser: "Vivaldi"
  });
  gulp.watch('./**/*', function() {
  	bs.reload();
  });
});