const startup = (() => {
	'use strict';

	const batch = require('stream-batch'),
		log4js = require('log4js'),
		path = require('path'),
		process = require('process');

	const promise = require('@barchart/common-js/lang/promise');

	const DelegateTransformation = require('@barchart/common-node-js/stream/transformations/DelegateTransformation'),
		DynamoProvider = require('@barchart/common-node-js/aws/DynamoProvider'),
		DynamoScanReader = require('@barchart/common-node-js/aws/dynamo/stream/DynamoScanReader'),
		DynamoStreamWriter = require('@barchart/common-node-js/aws/dynamo/stream/DynamoStreamWriter'),
		Environment = require('@barchart/common-node-js/environment/Environment'),
		ObjectTransformer = require('@barchart/common-node-js/stream/ObjectTransformer'),
		OperatorType = require('@barchart/common-node-js/aws/dynamo/query/definitions/OperatorType'),
		ScanBuilder = require('@barchart/common-node-js/aws/dynamo/query/builders/ScanBuilder'),
		SplitTransformer = require('@barchart/common-node-js/stream/SplitTransformer');

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
			'Updates system expiration',
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

		Promise.resolve({ })
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
					context.table = lambdaInvocationsTable;

					return context;
				});
			}).then((context) => {
				let count = 0;

				return promise.build((resolveCallback, rejectCallback) => {
					const builder = ScanBuilder.targeting(context.table.definition)
						.withDescription('Scan all items without expiration')
						.withFilterBuilder((fb) => {
							fb.withExpression('system.expiration', OperatorType.ATTRIBUTE_NOT_EXISTS);
						});

					const reader = new DynamoScanReader(builder.scan, context.dynamo);

					const splitter = new SplitTransformer();

					const processor =  ObjectTransformer.define('Touch', false)
						.addTransformation(new DelegateTransformation((item) => {
							count += 1;

							if (count % 10000 === 0) {
								logger.info(`Processed [ ${count} ] items`);
							}

							return item;
						}));

					const batcher = batch({ maxItems: 25 });

					const writer = new DynamoStreamWriter(context.table.definition, context.dynamo);

					writer.on('finish', () => {
						logger.info(`Finished, updated [ ${count} ] items.`);

						resolveCallback(context);
					});

					reader
						.pipe(splitter)
						.pipe(processor)
						.pipe(batcher)
						.pipe(writer);
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
