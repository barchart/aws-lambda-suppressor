const LambdaValidator = require('@barchart/common-node-js/aws/lambda/LambdaValidator');

const DynamoMessageValidator = require('./DynamoMessageValidator');

module.exports = (() => {
	'use strict';

	// 2020/11/29, BRI. This class will be removed in the next major release.
	// See the @barchart/common-node-js package for more details. Going forward,
	// please use the DynamoMessageValidator class instead.

	/**
	 * A {@LambdaValidator} that prevents duplicate invocation of Lambda
	 * functions by writing the invocation's unique identifier to a DynamoDB
	 * table using a conditional check to ensure the identifier does not already
	 * exist (an operation with guaranteed to be atomic and consistent by DynamoDB).
	 *
	 * @public
	 * @extends {LambdaValidator}
	 * @param {String} region
	 * @param {String} prefix
	 * @deprecated
	 */
	class DynamoLambdaValidator extends LambdaValidator {
		constructor(region, prefix) {
			super();

			this._messageValidator = new DynamoMessageValidator(region, prefix);
		}

		_validate(name, trigger, messageId) {
			return this._messageValidator.validate(name, null, null, trigger, messageId);
		}

		toString() {
			return 'DynamoLambdaValidator';
		}
	}

	return DynamoLambdaValidator;
})();
