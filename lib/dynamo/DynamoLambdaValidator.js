const LambdaValidator = require('@barchart/common-node-js/aws/lambda/LambdaValidator'),
	LambdaTriggerType = require('@barchart/common-node-js/aws/lambda/LambdaTriggerType');

const DynamoMessageValidator = require('./DynamoMessageValidator');

module.exports = (() => {
	'use strict';

	// 2020/11/29, BRI. This class will be removed in the next major release.
	// See the @barchart/common-node-js package for more details. Going forward,
	// please use the DynamoMessageValidator class instead.

	/**
	 * A utility for checking for duplicate invocations of AWS Lambda
	 * functions which uses DynamoDB to persist message identifiers.
	 *
	 * @public
	 * @deprecated
	 * @param {String} region
	 * @param {String} prefix
	 */
	class DynamoLambdaValidator extends LambdaValidator {
		constructor(region, prefix) {
			super();

			this._messageValidator = new DynamoMessageValidator(region, prefix);
		}

		/**
		 * Returns promise with a Boolean value, indicating if a message
		 * with the given identifier has already been processed.
		 *
		 * @public
		 * @param {String} name
		 * @param {LambdaTriggerType} trigger
		 * @param {String} messageId
		 * @returns {Promise<Boolean>}
		 */
		_validate(name, trigger, messageId) {
			return this._messageValidator.validate(name, null, null, trigger, messageId);
		}

		toString() {
			return 'DynamoLambdaValidator';
		}
	}

	return DynamoLambdaValidator;
})();
