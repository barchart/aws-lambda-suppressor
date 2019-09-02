const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	Timestamp = require('@barchart/common-js/lang/Timestamp');

const DynamoProvider = require('@barchart/common-node-js/aws/DynamoProvider'),
	LambdaHelper = require('@barchart/common-node-js/aws/lambda/LambdaHelper'),
	LambdaTriggerType = require('@barchart/common-node-js/aws/lambda/LambdaTriggerType');

const LambdaInvocationsTable = require('./data/LambdaInvocationsTable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('aws-lambda-suppressor/lib/dynamo/DynamoSuppressor');

	/**
	 * A utility for checking for duplicate invocations of AWS Lambda
	 * functions which uses DynamoDB to persist message identifiers.
	 *
	 * @public
	 */
	class DynamoSuppressor extends Disposable {
		constructor() {
			super();

			this._invocationTable = null;

			this._started = false;

			this._startPromise = null;
			this._disposeStack = null;
		}

		/**
		 * Initializes the suppressor.
		 *
		 * @public
		 * @param {String} region
		 * @param {String} prefix
		 * @returns {Promise}
		 */
		start(region, prefix) {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						assert.argumentIsRequired(region, 'region', String);
						assert.argumentIsRequired(prefix, 'prefix', String);

						const configuration = { };

						configuration.region = region;
						configuration.prefix = prefix;

						const provider = new DynamoProvider(configuration);

						this._disposeStack.push(provider);

						return provider.start()
							.then(() => {
								this._invocationTable = new LambdaInvocationsTable(provider);

								this._disposeStack.push(this._invocationTable);

								return this._invocationTable.start(true)
									.then(() => {
										this._started = true;

										return this;
									});
							});


					});
			}

			return this._startPromise();
		}

		/**
		 * Returns a rejected promise if the message has already been processed.
		 *
		 * @public
		 * @param {String} id
		 * @param {String} name
		 * @param {LambdaTriggerType} type
		 * @returns {Promise<void>}
		 */
		validate(id, name, type) {
			return Promise.resolve()
				.then(() => {
					checkReady.call(this);

					const invocation = { };

					invocation.id = id;
					invocation.name = name;
					invocation.type = type;
					invocation.timestamp = Timestamp.now();

					this._invocationTable.createInvocation(invocation)
						.then(() => {
							return Promise.resolve();
						}).catch((e) => {
							return Promise.reject();
						});
				})
		}

		/**
		 * Returns a callback ({@link LambdaHelper~suppressor}) implemented with
		 * a {@link DynamoSuppressor}.
		 *
		 * @public
		 * @static
		 * @param {String} region
		 * @param {String} prefix
		 * @returns {Promise<LambdaHelper~suppressor>}
		 */
		static forLambdaHelper(region, prefix) {
			return Promise.resolve()
				.then(() => {
					const suppressor = new DynamoSuppressor();

					return suppressor.start(region, prefix)
						.then(() => {

						});
				});
		}

		_onDispose() {
			if (this._disposeStack !== null) {
				this._disposeStack.dispose();
				this._disposeStack = null;
			}
		}

		toString() {
			return 'DynamoSuppressor';
		}
	}

	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The DynamoSuppressor has been disposed.');
		}

		if (!this._started) {
			throw new Error('The DynamoSuppressor has not been started.');
		}
	}

	return DynamoSuppressor;
})();
