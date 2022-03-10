(() => {
	'use strict';

	const log4js = require('log4js'),
		path = require('path'),
		process = require('process');

	const DynamoProvider = require('@barchart/common-node-js/aws/DynamoProvider'),
		Environment = require('@barchart/common-node-js/environment/Environment');

	const LambdaInvocationsTable = require('../../lib/dynamo/tables/LambdaInvocationsTable');

	const NAMES = {
		AWS_ACCESS_KEY_ID: 'AWS_ACCESS_KEY_ID',
		AWS_SECRET_ACCESS_KEY: 'AWS_SECRET_ACCESS_KEY',
		AWS_REGION: 'AWS_REGION',
		AWS_DYNAMO_PREFIX: 'AWS_DYNAMO_PREFIX'
	};

	const SUPPRESSED = [
		NAMES.AWS_ACCESS_KEY_ID,
		NAMES.AWS_SECRET_ACCESS_KEY
	];

	const REQUIRED = [
		NAMES.AWS_ACCESS_KEY_ID,
		NAMES.AWS_SECRET_ACCESS_KEY,
		NAMES.AWS_DYNAMO_PREFIX
	];

	log4js.configure(path.join(__dirname, '..', 'config', 'log4js.json'));
	const logger = log4js.getLogger('app');
	const startTime = (new Date()).getTime();

	const exit = (code) => {
		logger.info('Stopping [ update/environment-create ] script, run', startTime);

		log4js.shutdown(() => {
			process.exit(code || 0);
		});
	};

	process.on('SIGINT', () => {
		logger.error('Interrupt signal received.');

		process.exit(130);
	});

	process.on('unhandledRejection', (error) => {
		logger.error('Unhandled Promise Rejection', error);

		process.exit(130);
	});

	process.on('uncaughtException', (error) => {
		logger.error('Unhandled Error', error);

		process.exit(130);
	});

	try {
		logger.info('Starting [ update/environment-create ] script, run', startTime);

		const description = [
			'Creates DynamoDB tables for event system'
		];

		const drawLine = (length) => {
			const character = '=';

			logger.info(character.repeat(length));
		};

		description.forEach((line, i, a) => {
			if (i === 0) {
				drawLine(a[0].length);
			}

			logger.info(`${i === 0 ? '' : i + '. '}${line}`);

			if (i === 0 || i === (a.length - 1)) {
				drawLine(a[0].length);
			}
		});

		const processArguments = Environment.parseProcessArguments();

		Object.keys(processArguments).forEach((key) => {
			const value = processArguments[key];

			logger.info('Using command line argument [', key ,'] = [', (SUPPRESSED.includes(key) ? '*suppressed*' : value), ']');

			process.env[key] = value;
		});

		const missing = REQUIRED.filter((key) => {
			return !process.env.hasOwnProperty(key);
		});

		if (missing.length > 0) {
			logger.error('Arguments missing, aborting [', missing.join(',') ,']');

			exit(1);

			return;
		}

		Promise.resolve({})
			.then((context) => {
				logger.info('Beginning environment check (and creation)');

				const dynamo = new DynamoProvider({
					region: process.env[NAMES.AWS_REGION] || 'us-east-1',
					prefix: process.env[NAMES.AWS_DYNAMO_PREFIX]
				});

				return dynamo.start()
					.then(() => {
						context.dynamo = dynamo;

						return context;
					});
			}).then((context) => {
				const lambdaInvocationsTable = new LambdaInvocationsTable(context.dynamo);

				return Promise.all([
					lambdaInvocationsTable.start(false)
				]).then(() => {
					return context;
				});
			}).then((context) => {
				logger.info('Script finishing normally');

				exit();
			}).catch((e) => {
				logger.error('Script encountered a rejected promise');
				logger.error(e);

				exit(1);
			});
	} catch (e) {
		try {
			logger.error('Script threw an unhandled error. This should never happen.', e);
		} catch (e) {
			console.log('Script threw an unhandled error. This should never happen.', e);
		}

		exit(1);
	}
})();
