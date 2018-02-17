// https://gist.github.com/webdesserts/5632955
const gulp = require('gulp');
const { spawn } = require('child_process');

let node;

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', () => {
  if (node) node.kill();
  node = spawn('node', ['app.js'], { stdio: 'inherit' });
  node.on('close', (code) => {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

/**
 * $ gulp
 * description: start the development environment
 */
gulp.task('default', ['server'], () => {
  gulp.watch(['./app.js', './lib/**/*.js', './routes/*.js'], ['server']);

  // Need to watch for sass changes too? Just add another watch call!
  // no more messing around with grunt-concurrent or the like. Gulp is
  // async by default.
});

// clean up if an error goes unhandled.
process.on('exit', () => {
  if (node) node.kill();
});
