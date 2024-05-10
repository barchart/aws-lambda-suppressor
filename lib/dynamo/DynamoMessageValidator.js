const assert = require('@barchart/common-js/lang/assert'),
	Timestamp = require('@barchart/common-js/lang/Timestamp');

const DynamoProvider = require('@barchart/common-node-js/aws/DynamoProvider'),
	LambdaMessageValidator = require('@barchart/common-node-js/aws/lambda/validators/LambdaMessageValidator');

const LambdaInvocationsTable = require('./tables/LambdaInvocationsTable');

module.exports = (() => {
	'use strict';

	/**
	 * A {@LambadMessageValidator} that prevents duplicate invocation of Lambda
	 * functions by writing the invocation's unique identifier to a DynamoDB
	 * table using a conditional check to ensure the identifier does not already
	 * exist (an operation with guaranteed to be atomic and consistent by DynamoDB).
	 *
	 * @public
	 * @extends {LambdaMessageValidator}
	 * @param {region} - The AWS region for the internal {@link LambdaInvocationsTable}.
	 * @param {prefix} - The DynamoDB naming prefix for the internal {@link LambdaInvocationsTable}.
	 */
	class DynamoMessageValidator extends LambdaMessageValidator {
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
		 * Initializes the instance.
		 *
		 * @public
		 * @async
		 * @returns {Promise}
		 */
		async start() {
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

								return this._invocationTable.start(true);
							}).then(() => {
								return this;
							});
					});
			}

			return this._startPromise;
		}

		_validate(name, message, event, trigger, messageId) {
			return Promise.resolve()
				.then(() => {
					if (!(name && messageId && trigger)) {
						return true;
					}

					return this.start()
						.then(() => {
							const invocation = { };

							invocation.name = name;

							invocation.event = { };
							invocation.event.id = messageId;
							invocation.event.type = trigger;

							invocation.timestamp = Timestamp.now();

							return this._invocationTable.createInvocation(invocation)
								.then(() => {
									return true;
								}).catch((e) => {
									return false;
								});
						});
				});
		}

		toString() {
			return '[DynamoMessageValidator]';
		}
	}

	return DynamoMessageValidator;
})();
