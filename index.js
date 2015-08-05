
'use strict';

var attrsCodeGenerator = require('./lib/attributesCodeGenerator')
,	nodesCodeGenerator = require('./lib/nodesCodeGenerator')
,	_ = require('underscore');

module.exports = {
	Parser: nodesCodeGenerator
,	AttributesParser: attrsCodeGenerator
,	getNewParser: function ()
	{
		return new nodesCodeGenerator({attributesParser: attrsCodeGenerator});
	}
,	generateVirtualDOM: function (string_html, options)
	{
		options = _.defaults(options || {}, {
			notGenerateContext: false
		,	attributeParserOptions: {}
		,	attributesParser: attrsCodeGenerator
		});

		var parser = new nodesCodeGenerator(options)
		,	result = parser.parse(string_html)
		,	deps = [];


		if (result.value.indexOf('[') === 0)
		{
			result.value = result.value.substr(1);
		}
		if (result.value.indexOf(']', result.value.length - 1) !== -1)
		{
			result.value = result.value.substr(0, result.value.length -1);
		}

		if (options.notGenerateContext)
		{
			return result;
		}

		deps = result.contextName + (result.compositeViews.length > 0 ? ',' +result.externalDependencyVariableName : '' );

		return 'function ('+deps+') { return ' + result.value + ';}';

	}
,	addAttributesHandlers: function (handlebars_attributes_handlers)
	{
		_.extend(attrsCodeGenerator.prototype, handlebars_attributes_handlers || {});
	}
,	addNodesHandlers: function (handlebars_nodes_handlers)
	{
		_.extend(nodesCodeGenerator.prototype, handlebars_nodes_handlers || {});
	}
};
