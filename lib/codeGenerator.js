//@module blueHTML
var base = require('./codeGenerator.Base')
,	utils = require('./codeGenerator.Utils')
,	tags = require('./codeGenerator.Tags')
,	attributes = require('./codeGenerator.Attributes')
,	customHelpers = require('./codeGenerator.CustomHelpers')
,	_ = require('underscore');

//@class CodeGenerator
base.prototype = _.extend(
		base.prototype
	,	utils
	,	tags
	,	attributes
	,	customHelpers
	,	{
			//@method addCustomHandler Add a new handlebars handler
			//@param {Function }
			//@return {Void}
			addCustomHandler: function (handlebars_handlers)
			{
				'use strict';

				_.extend(base.prototype, handlebars_handlers || {});
			}
			//@method installPlugin Install a plugin inside the code generator
			//@param {Plugin} plugin_container
			//@return {Void}
		,	installPlugin: function (plugin_container)
			{
				'use strict';

				/*jshint -W030 */
				plugin_container && plugin_container.install && plugin_container.install.call(plugin_container, base);
			}
		}
	);

module.exports = base;


//@class Plugin
//@method install Public method invoked by blueHTML when adding a new plugin.
//@param {CodeGenerator} codeGenerator
//@return {Void}
