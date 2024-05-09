const exec = require('child_process').exec;

const fs = require('fs');

const git = require('gulp-git'),
	gitStatus = require('git-get-status'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	prompt = require('gulp-prompt');

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

gulp.task('bump-choice', (cb) => {
	const processor = prompt.prompt({
		type: 'list',
		name: 'bump',
		message: 'What type of bump would you like to do?',
		choices: ['patch', 'minor', 'major'],
	}, (res) => {
		global.bump = res.bump;

		return cb();
	});

	return gulp.src(['./package.json']).pipe(processor);
});

gulp.task('bump-version', (cb) => {
	exec(`npm version ${global.bump || 'patch'} --no-git-tag-version`, {
		cwd: './'
	}, (error) => {
		if (error) {
			cb(error);
		}

		cb();
	});
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
	'bump-choice',
	'bump-version',
	'commit-changes',
	'push-changes',
	'create-tag'
));

gulp.task('lint', () => {
	return gulp.src(['./lib/**/*.js', './scripts/**/*.js', './test/specs/**/*.js'])
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('default', gulp.series('lint'));