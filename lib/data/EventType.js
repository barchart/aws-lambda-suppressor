const Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * An enumeration for different Lambda event triggers.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 */
	class EventType extends Enum {
		constructor(code, schemaName) {
			super(code, code);

			this._schemaName = schemaName;
		}

		/**
		 * The string used to describe in the invocation type in Lambda
		 *
		 * @public
		 * @returns {String}
		 */
		getSchemaName() {
			return this._schemaName;
		}

		/**
		 * Customer type for TGAM.
		 *
		 * @public
		 * @static
		 * @returns {EventType}
		 */
		static get CLOUDWATCH_CRON() {
			return tgam;
		}

		toString() {
			return `[EventType (code=${this.code})]`;
		}
	}

	const cron = new EventType('CRON');

	const tgam = new EventType('TGAM', 'The Globe and Mail');

	return EventType;
})();
