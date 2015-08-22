//@module blueHTML.DefaultPlugins
var _ = require('underscore');

//@class CompositeViewPlugin @extend Plugin This plugin allows to composite views by adding a data-view attribute inside the Handlebars template
module.exports = {
	//@method install Public method invoked by blueHTML when adding a new plugin.
	//@param {CodeGenerator} codeGenerator
	//@return {Void}
	install: function (codeGenerator)
	{
		'use strict';

		this.accumulatedAttributesCompositeViewNames = [];
		this.compositeViewNames = [];
		this.lastAttributesResult = '';
		this.externalDependencyVariableName = 'children_views_dependencies';

		codeGenerator.beforeAttributeHandlerExecuted.add({
			name: 'Recollect data-view values'
		,	execute: this.beforeAttributeHandlerCalled
		,	priority: 10
		,	self: this
		});

		codeGenerator.afterAttributeCodeGeneration.add({
			execute: this.augmentNodeChildrenForCompositeViews
		,	name: 'Insert AST dataView nodes'
		,	priority: 10
		,	self: this
		});

		codeGenerator.beforeAttributeCodeGeneration.add({
			execute: this.cleanAttributeCompositeViews
		,	name: 'Reset local state'
		,	priority: 10
		,	self: this
		});

		codeGenerator.afterTagCodeGeneration.add({
			execute: this.generateResult
		,	name: 'Extend Generated code result'
		,	priority: 10
		,	self: this
		});

		this.extensionMethods.pluginCompositeViewsContext = this;

		_.extend(codeGenerator.prototype, this.extensionMethods);
	},

	//@method cleanAttributeCompositeViews
	//@return {Void}
	cleanAttributeCompositeViews: function ()
	{
		'use strict';

		this.self.accumulatedAttributesCompositeViewNames = [];
		this.self.lastAttributesResult = '';
	},

	//@method generateResult Extend the final result to return the list of view named collected
	//@param {CodeGenerationResult} codeResult
	//@return {CodeGenerationResult}
	generateResult: function (codeResult)
	{
		codeResult.externalDependencies = codeResult.externalDependencies.concat(this.self.compositeViewNames);
		return codeResult;
	},

	//@method beforeAttributeHandlerCalled Hook to accumulate data-view attributes
	//@param {AttributeASTNode} ast_node
	//@param {CodeGenerationContext} code_generation_context
	//@return {Void}
	beforeAttributeHandlerCalled: function (ast_node, code_generation_context)
	{
		'use strict';

		var self = this.self;

		if (ast_node.type === 'keyValue' && 'data-view' === ast_node.key)
		{
			var composite_view_name = '""';

			//Generate view name (It can be compose by code invocation)
			_.each(ast_node.value, function (value_node)
			{
				if (value_node.type === 'singleValue' ||
					(value_node.type === 'singleKey' && value_node.subType === 'extraSpaces' && value_node.value !== ''))
				{
					composite_view_name += '+"'+value_node.value+'"';
				}
				else if (value_node.type === 'handlebars' && value_node.subType === 'ATTRREFERENCEEVALUATION')
				{
					var property_name = value_node.value.trim().substr(1);
					if (code_generation_context.currentContextName[property_name])
					{
						composite_view_name += '+'+code_generation_context.currentContextName.contextName + '.' + property_name;
					}
				}
			});

			self.accumulatedAttributesCompositeViewNames.push(composite_view_name);
		}
	},

	//@method augmentNodeChildrenForCompositeViews Internal method to add for each NodeASTNode that has properties the can indicate that the node is a composite point
	// an extra child to express that composite point
	//@param {String} attributes_result
	//@param {CodeGenerationContext} code_generation_context
	//@return {Void}
	augmentNodeChildrenForCompositeViews: function (attributes_result, code_generation_context)
	{
		'use strict';

		var self = this.self
		,	node_children = code_generation_context.astNode.children || [];

		_.each(self.accumulatedAttributesCompositeViewNames, function (require_composite_view)
		{
			node_children.push({
				type: 'handlebars'
			,	subType: 'CompositeView'
			,	value: require_composite_view
			,	parameters: attributes_result.value
			});
		});
		self.compositeViewNames = self.compositeViewNames.concat(self.accumulatedAttributesCompositeViewNames);

		code_generation_context.astNode.children = node_children;
		self.lastAttributesResult = attributes_result;
	},

	extensionMethods: {

		//@method handlebarsCompositeView Handler for (extra added) composite nodes
		//@param {CodeGenerationContext} code_generation_context
		//@return {String}
		handlebarsCompositeView: function (code_generation_context)
		{
			'use strict';

			var self = this.pluginCompositeViewsContext;

			var invokable_fn = code_generation_context.externalDependenciesObjectName+'['+code_generation_context.astNode.value+']'
			,	string_virtual_dom = '(function (){ '+
				'if (_.isFunction('+invokable_fn+')) { return '+invokable_fn+'('+self.lastAttributesResult+'); }' +
				'return []; })()';

			if (code_generation_context.isInsideContext)
			{
				return code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat('+string_virtual_dom+');';
			}

			return string_virtual_dom;
		}
	}
};
