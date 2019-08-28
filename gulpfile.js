const gulp = require('gulp'),
	jshint = require('gulp-jshint');

gulp.task('lint', () => {
	return gulp.src([ './**/*.js', '!./node_modules/**' ])
		.pipe(jshint({ esversion: 6 }))
		.pipe(jshint.reporter('default'));
});

gulp.task('default', ['lint']);
