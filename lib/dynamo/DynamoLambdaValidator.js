const assert = require('@barchart/common-js/lang/assert'),
	Timestamp = require('@barchart/common-js/lang/Timestamp');

const DynamoProvider = require('@barchart/common-node-js/aws/DynamoProvider'),
	LambdaValidator = require('@barchart/common-node-js/aws/lambda/LambdaValidator'),
	LambdaTriggerType = require('@barchart/common-node-js/aws/lambda/LambdaTriggerType');

const LambdaInvocationsTable = require('./data/LambdaInvocationsTable');

module.exports = (() => {
	'use strict';

	/**
	 * A utility for checking for duplicate invocations of AWS Lambda
	 * functions which uses DynamoDB to persist message identifiers.
	 *
	 * @public
	 * @param {String} region
	 * @param {String} prefix
	 */
	class DynamoLambdaValidator extends LambdaValidator {
		constructor(region, prefix) {
			super();

			assert.argumentIsRequired(region, 'region', String);
			assert.argumentIsRequired(prefix, 'prefix', String);

			this._invocationTable = null;

			this._region = region;
			this._prefix = prefix;

			this._startPromise = null;
		}

		/**
		 * Initializes the suppressor.
		 *
		 * @public
		 * @returns {Promise}
		 */
		start() {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						const configuration = { };

						configuration.region = this._region;
						configuration.prefix = this._prefix;

						const provider = new DynamoProvider(configuration);

						return provider.start()
							.then(() => {
								this._invocationTable = new LambdaInvocationsTable(provider);

								return this._invocationTable.start(true)
									.then(() => {
										return this;
									});
							});
					});
			}

			return this._startPromise;
		}

		/**
		 * Returns promise with a Boolean value, indicating if a message
		 * with the given identifier has already been processed.
		 *
		 * @public
		 * @param {String} name
		 * @param {LambdaTriggerType} type
		 * @param {String} id
		 * @returns {Promise<Boolean>}
		 */
		_validate(name, type, id) {
			return this.start()
				.then(() => {
					const invocation = { };

					invocation.id = id;
					invocation.name = name;
					invocation.type = type;
					invocation.timestamp = Timestamp.now();

					this._invocationTable.createInvocation(invocation)
						.then(() => {
							return Promise.resolve(true);
						}).catch((e) => {
							return Promise.resolve(false);
						});
				});
		}

		toString() {
			return 'DynamoLambdaValidator';
		}
	}

	return DynamoLambdaValidator;
})();
