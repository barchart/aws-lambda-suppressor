const Day = require('@barchart/common-js/lang/Day'),
	Timestamp = require('@barchart/common-js/lang/Timestamp');

const DataType = require('@barchart/common-node-js/aws/dynamo/schema/definitions/DataType'),
	KeyType = require('@barchart/common-node-js/aws/dynamo/schema/definitions/KeyType'),
	TableContainer = require('@barchart/common-node-js/aws/dynamo/TableContainer');

const LambdaTriggerType = require('@barchart/common-node-js/aws/lambda/LambdaTriggerType');

module.exports = (() => {
	'use strict';

	/**
	 * A DynamoDB table for tracking AWS Lambda invocations.
	 *
	 * @public
	 * @param {DynamoProvider} provider
	 * @extends {TableContainer}
	 */
	class LambdaInvocationsTable extends TableContainer {
		constructor(provider) {
			super(provider, getTableSchema(provider));
		}

		/**
		 * Saves a Lambda invocation. Returns a rejected promise if an invocation,
		 * having the same identifier already exists.
		 *
		 * @public
		 * @async
		 * @param {LambdaInvocation} invocation
		 * @returns {Promise<Boolean>}
		 */
		async createInvocation(invocation) {
			return this._createItem(invocation, true);
		}

		toString() {
			return '[LambdaInvocationsTable]';
		}
	}

	function toSeconds(timestamp) {
		return Math.floor(timestamp / 1000);
	}

	const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

	function getTableSchema(provider) {
		return provider.getTableBuilder('invocations')
			.withOnDemandThroughput()
			.withAttribute('name', DataType.STRING)
			.withAttribute('event.id', DataType.STRING)
			.withAttribute('event.type', DataType.forEnum(LambdaTriggerType, 'LambdaTriggerType'))
			.withAttribute('timestamp', DataType.TIMESTAMP)
			.withAttributeBuilder('key.master', (ab) => {
				ab.withDataType(DataType.STRING)
					.withDerivationBuilder((db) => {
						db.withAttribute('name')
							.withAttribute('event.id')
							.withAttribute('event.type')
							.withGenerator(data => `${data[0]}-${data[2].code}-${data[1]}`);
					});
			})
			.withAttributeBuilder('system.day', (ab) => {
				ab.withDataType(DataType.DAY)
					.withDerivationBuilder((db) => {
						db.withGenerator(ignored => Day.getToday());
					});
			})
			.withAttributeBuilder('system.timestamp', (ab) => {
				ab.withDataType(DataType.TIMESTAMP)
					.withDerivationBuilder((db) => {
						db.withGenerator(ignored => Timestamp.now());
					});
			})
			.withAttributeBuilder('system.expiration', (ab) => {
				ab.withDataType(DataType.NUMBER)
					.withDerivationBuilder((db) => {
						db.withGenerator((ignored) => {
							return toSeconds(Timestamp.now().timestamp + ONE_MONTH);
						});
					});
			})
			.withTimeToLive('system.expiration')
			.withKey('key.master', KeyType.HASH)
			.table;
	}

	/**
	 * Data regarding a single Lambda function invocation
	 *
	 * @typedef LambdaInvocation
	 * @type {Object}
	 * @property {String} function - The name of the Lambda function
	 * @property {String} event.id - The identifier of the event trigger
	 * @property {String} event.type - The type of event trigger
	 * @property {Timestamp} timestamp - Time the event was received
	 */

	return LambdaInvocationsTable;
})();
