const Day = require('@barchart/common-js/lang/Day'),
	Timestamp = require('@barchart/common-js/lang/Timestamp');

const DataType = require('@barchart/common-node-js/aws/dynamo/schema/definitions/DataType'),
	KeyType = require('@barchart/common-node-js/aws/dynamo/schema/definitions/KeyType'),
	TableContainer = require('@barchart/common-node-js/aws/dynamo/TableContainer');

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
		 * @param {LambdaInvocation} invocation
		 * @returns {Promise<Boolean>}
		 */
		createInvocation(invocation) {
			return this._createItem(invocation, true);
		}

		toString() {
			return '[LambdaInvocationsTable]';
		}
	}


	function getTableSchema(provider) {
		return provider.getTableBuilder('invocations')
			.withOnDemandThroughput()
			.withAttribute('function', DataType.STRING)
			.withAttribute('event.id', DataType.STRING)
			.withAttribute('event.type', DataType.STRING)
			.withAttribute('timestamp', DataType.TIMESTAMP)
			.withAttributeBuilder('key', (ab) => {
				ab.withDataType(DataType.STRING)
					.withDerivationBuilder((db) => {
						db.withAttribute('function')
							.withAttribute('event.id')
							.withAttribute('event.type')
							.withGenerator(data => `${data[0]}-${data[2]}-${data[1]}`);
					});
			})
			.withAttributeBuilder('system.day', (ab) => {
				ab.withDataType(DataType.DAY)
					.withDerivationBuilder((db) => {
						db.withGenerator(ignored => `${Day.getToday()}`);
					});
			})
			.withAttributeBuilder('system.timestamp', (ab) => {
				ab.withDataType(DataType.TIMESTAMP)
					.withDerivationBuilder((db) => {
						db.withGenerator(ignored => `${Timestamp.now()}`);
					});
			})
			.withKey('key', KeyType.HASH)
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
