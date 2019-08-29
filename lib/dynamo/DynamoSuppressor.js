const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	is = require('@barchart/common-js/lang/is');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('aws-lambda-suppressor/lib/dynamo/DynamoSuppressor');

	class DynamoSuppressor extends Disposable {
		constructor() {
			super();

			this._invocationTable = null;

			this._startPromise = null;
			this._started = false;

			this._disposeStack = null;
		}

		start() {
			if (this._startPromise === null) {

			}

			return this._startPromise();
		}

		validate() {

		}

		static forLambdaHelper() {

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
			throw new Error('The Table has been disposed.');
		}

		if (!this._started) {
			throw new Error('The Table has not been started.');
		}
	}

	return DynamoSuppressor;
})();
