const fs = require('fs');

const bump = require('gulp-bump'),
	git = require('gulp-git'),
	gitStatus = require('git-get-status'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint');

function getVersionFromPackage() {
	return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
}

gulp.task('ensure-clean-working-directory', (cb) => {
	gitStatus((err, status) => {
		if (err, !status.clean) {
			throw new Error('Unable to proceed, your working directory is not clean.');
		}

		cb();
	});
});

gulp.task('bump-version', () => {
	return gulp.src([ './package.json' ])
		.pipe(bump({ type: 'patch' }))
		.pipe(gulp.dest('./'));
});

gulp.task('commit-changes', () => {
	return gulp.src(['./', './package.json' ])
		.pipe(git.add())
		.pipe(git.commit('Release. Bump version number'));
});

gulp.task('push-changes', (cb) => {
	git.push('origin', 'master', cb);
});

gulp.task('create-tag', (cb) => {
	const version = getVersionFromPackage();

	git.tag(version, 'Release ' + version, function (error) {
		if (error) {
			return cb(error);
		}

		git.push('origin', 'master', {args: '--tags'}, cb);
	});
});

gulp.task('release', gulp.series(
	'ensure-clean-working-directory',
	'bump-version',
	'commit-changes',
	'push-changes',
	'create-tag'
));

gulp.task('lint', () => {
	return gulp.src(['./lib/**/*.js', './scripts/**/*.js', './test/specs/**/*.js'])
		.pipe(jshint({'esversion': 6}))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('default', gulp.series('lint'));