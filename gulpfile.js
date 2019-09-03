const fs = require('fs');

const bump = require('gulp-bump'),
	git = require('gulp-git'),
	gitStatus = require('git-get-status'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	runSequence = require('run-sequence'),
	util = require('gulp-util');

function getVersionFromPackage() {
	return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
}

gulp.task('lint', () => {
	return gulp.src([ './**/*.js', '!./node_modules/**' ])
		.pipe(jshint({ esversion: 6 }))
		.pipe(jshint.reporter('default'));
});

gulp.task('ensure-clean-working-directory', () => {
	gitStatus(function(err, status) {
		if (err, !status.clean) {
			throw new Error('Unable to proceed, your working directory is not clean.');
		}
	});
});

gulp.task('bump-version', () => {
	return gulp.src(['./package.json'])
		.pipe(bump({type: 'patch'}).on('error', util.log))
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

gulp.task('release', (callback) => {
	runSequence(
		'ensure-clean-working-directory',
		'bump-version',
		'commit-changes',
		'push-changes',
		'create-tag',

		function (error) {
			if (error) {
				console.log(error.message);
			} else {
				console.log('Release complete');
			}

			callback(error);
		});
});

gulp.task('default', ['lint']);
