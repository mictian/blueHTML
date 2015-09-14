//@module blueHTML
var _ = require('underscore')
,	codeGeneratorBase = require('./codeGenerator.Base');

//@class CodeGenerator
module.exports = {


	//@method concatenateAttributeNodes Given a list of ast nodes, generate the concatenated string that represent the result of applying all the action specified in all the nodes
	//@param {Array<AttributeASTNode>} nodes List of node to concatenate
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	concatenateAttributeNodes: function (nodes, code_generation_context)
	{
		'use strict';

		var self = this
		,	is_setting_value = code_generation_context.isSettingValue;

		nodes = _.isArray(nodes) ? nodes : [nodes];

		return _.reduce(nodes, function (acc, ast_node)
		{
			code_generation_context.astNode = ast_node;

			ast_node = codeGeneratorBase.beforeAttributeHandlerRetrieved.execute(ast_node, code_generation_context);

			var handler_function = self.getNodeHandle(ast_node)
			,	current_result = '';

			ast_node = codeGeneratorBase.beforeAttributeHandlerExecuted.execute(ast_node, code_generation_context, {handler: handler_function});

			current_result = handler_function.call(self, code_generation_context);
			acc += current_result;
			code_generation_context.isSettingValue = is_setting_value;

			ast_node = codeGeneratorBase.afterAttributeHandlerExecuted.execute(ast_node
			,	code_generation_context
			,	{
					acummulatedValue: acc
				,	currentResult: current_result
				});

			return acc;
		}, '');
	},

	//@method parseAttributes Internal method call when any attributes string need to be parsed. This method delegate the parsing task to the Attributes Parser Manager
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	parseAttributes: function (code_generation_context)
	{
		'use strict';

		code_generation_context.astNode = codeGeneratorBase.beforeAttributeCodeGeneration.execute(code_generation_context.astNode, code_generation_context);

		//@class CodeGenerationContext
		//@property {Boolean} isSettingValue Indicate if in the current context the value of a property is being set or just the property itself
		code_generation_context.isSettingValue = false;
		//@property {String} objectName Name of the object where all the properties are added. Property used in the context of the Attributes code generation.
		code_generation_context.objectName = this.options.attributeObjectName;
		//@property {String} keyName Property used in the context of the Attributes code generation to indicate the name of the property being generated
		code_generation_context.keyName = '';
		//@property {Boolean} isSettingAttributes. Property used in the context of the Attributes code generation. Falsy otherwise
		code_generation_context.isSettingAttributes = true;
		//@class CodeGenerator

		var result = ''
		,	original_ast_node = code_generation_context.astNode
		,	adapter = code_generation_context.adapter
		,	attributes_ast = code_generation_context.astNode.attributes;

		if (attributes_ast.length)
		{
			result = adapter.accumulateFinalAttributesResult.call(adapter, code_generation_context, this.concatenateAttributeNodes(attributes_ast, code_generation_context));
		}
		else
		{
			result = adapter.accumulateFinalAttributesResult.call(adapter, code_generation_context, '');
		}

		code_generation_context.isSettingValue = null;
		code_generation_context.objectName = null;
		code_generation_context.keyName = null;
		code_generation_context.astNode = original_ast_node;
		code_generation_context.isSettingAttributes = null;

		result = codeGeneratorBase.afterAttributeCodeGeneration.execute(result, code_generation_context);

		return result;
	},

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//													HTML 																	//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//@method keyValue Handle the parsing of all node of type keyValue
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	keyValue: function (code_generation_context)
	{
		'use strict';

		code_generation_context.isSettingValue = true;
		code_generation_context.keyName = code_generation_context.astNode.key;

		var key_name = code_generation_context.keyName
		,	adapter = code_generation_context.adapter
		,	key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName,'"'+ key_name+'"')
		,	key_property_setting = this.concatenateAttributeNodes(code_generation_context.astNode.value, code_generation_context);

		return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, key_property_setting);
	},

	//@method singleValue Handle the parsing of all node of type stringValue (Generally one single word used to set a property's value)
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	singleValue: function (code_generation_context)
	{
		'use strict';

		var adapter = code_generation_context.adapter
		,	key_name = code_generation_context.keyName;

		if (code_generation_context.isSettingValue)
		{
			return adapter.accumulateAttributeValue.call(adapter, code_generation_context, code_generation_context.objectName,'"'+ code_generation_context.astNode.value+'"');
		}
		else
		{
			//Single properties like checked or disable are parsed as singleValue
			var key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName,'"'+ key_name+'"');
			return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, '');
		}
	},

	//@method singleValue Handle the parsing of all node of type singleKey (Generally one single word used to set a property name)
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	singleKey: function (code_generation_context)
	{
		'use strict';

		var adapter = code_generation_context.adapter;

		if (code_generation_context.isSettingValue)
		{
			if ((code_generation_context.astNode.subType === 'extraSpaces' && code_generation_context.astNode.value !== '') ||
					code_generation_context.astNode.subType !== 'extraSpaces')
			{
				//This case can happen because inside a handlebar code single expression are recognized as single key instead of single value!
				return adapter.accumulateAttributeValue.call(adapter, code_generation_context, code_generation_context.objectName,'"'+  code_generation_context.astNode.value+'"');
			}
		}
		else if (code_generation_context.astNode.subType !== 'extraSpaces')
		{
			var key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName, '"'+ code_generation_context.astNode.value+'"');
			return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, '');
		}
		return '';
	},


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//													HANDLEBARS																//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



	//@method handlebarsATTRSINGLEEVALUATION Handle the parsing of all safe evaluation handlebars node
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTRSINGLEEVALUATION: function (code_generation_context)
	{
		'use strict';

		var expression = '_.escape(' + code_generation_context.currentContextName.value + '.' + code_generation_context.astNode.value + ')'
		,	adapter = code_generation_context.adapter;

		if (code_generation_context.isSettingValue)
		{
			return adapter.accumulateAttributeValue.call(adapter, code_generation_context, code_generation_context.objectName, expression);
		}
		else
		{
			var key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName, expression);
			return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, '');
		}
	},

	//@method handlebarsATTRLOOKUPSINGLE Handle the parsing of all context lookup
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTRLOOKUPSINGLE: function (code_generation_context)
	{
		'use strict';

		var expression = '_.escape(' + this._getLookUpContextName(code_generation_context, code_generation_context.astNode) + ')'
		,	adapter = code_generation_context.adapter;

		if (code_generation_context.isSettingValue)
		{
			return adapter.accumulateAttributeValue.call(adapter, code_generation_context, code_generation_context.objectName, expression);
		}
		else
		{
			var key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName, expression);
			return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, '');
		}
	},

	//@method handlebarsATTRUNSAFESINGLEEVALUATION Handle the parsing of all un-safe evaluation handlebars node
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTRUNSAFESINGLEEVALUATION: function (code_generation_context)
	{
		'use strict';

		var expression = code_generation_context.currentContextName.value + '.' + code_generation_context.astNode.value
		,	adapter = code_generation_context.adapter;

		if (code_generation_context.isSettingValue)
		{
			return adapter.accumulateAttributeValue.call(adapter, code_generation_context, code_generation_context.objectName, expression);
		}
		else
		{
			var key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName, expression);
			return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, '');
		}
	},

	//@method handlebarsATTRREFERENCEEVALUATION Handle the code generation of safe reference evaluation handlebar nodes
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTRREFERENCEEVALUATION: function (code_generation_context)
	{
		'use strict';

		var property_name = code_generation_context.astNode.value.trim().substr(1)
		,	expression = ''
		,	adapter = code_generation_context.adapter;

		if (code_generation_context.currentContextName[property_name])
		{
			expression = ' _.escape(' + code_generation_context.currentContextName.contextName + '.' + property_name + ')';

			if (code_generation_context.isSettingValue)
			{
				return adapter.accumulateAttributeValue.call(adapter, code_generation_context, code_generation_context.objectName, expression);
			}
			else
			{
				//This case is currently not supported by handlebarsX
				var key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName, expression);
				return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, '');
			}
		}

		// console.log(code_generation_context.astNode, 'Invalid safe reference evaluation');
		throw new Error('Invalid safe reference evaluation.');
	},

	//@method handlebarsATTRUNSAFEREFERENCEEVALUATION Handle the code generation of unsafe reference evaluation handlebar nodes
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTRUNSAFEREFERENCEEVALUATION: function (code_generation_context)
	{
		'use strict';

		var property_name = code_generation_context.astNode.value.trim().substr(1)
		,	expression = ''
		,	adapter = code_generation_context.adapter;

		if (code_generation_context.currentContextName[property_name])
		{
			expression = code_generation_context.currentContextName.contextName + '.' + property_name;

			if (code_generation_context.isSettingValue)
			{
				return adapter.accumulateAttributeValue.call(adapter, code_generation_context, code_generation_context.objectName, expression);
			}
			else
			{
				//This case is currently not supported by handlebarsX
				var key_property_definition = adapter.defineAttribute.call(adapter, code_generation_context, code_generation_context.objectName, expression);
				return adapter.setAttributeValue.call(adapter, code_generation_context, key_property_definition, '');
			}
		}

		// console.log(code_generation_context.astNode, 'Invalid unsafe reference evaluation');
		throw new Error('Invalid unsafe reference evaluation.');
	},

	//@method handlebarsATTRIF Handle the parsing of all IF handlebars node
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTRIF: function (code_generation_context)
	{
		'use strict';

		var ast_node = code_generation_context.astNode
		,	result = 'if ('+this._handlebarsEvaluateCondition(code_generation_context, ast_node.condition)+') {';

		if (!ast_node.ifBody)
		{
			throw new Error('Invalid if statement. An IF body is require: ' + JSON.stringify(ast_node));
		}

		result += this.concatenateAttributeNodes(ast_node.ifBody, code_generation_context);

		if (ast_node.elseBody.length)
		{
			//there could be values that only returns empty string, like the extra added spaces.
			var aux = this.concatenateAttributeNodes(ast_node.elseBody, code_generation_context);
			if (aux)
			{
				result += '} else {';
				result += aux;
			}
		}

		result += '}';
		return result;
	},

	//@method handlebarsATTREACH Handle the parsing of all EACHs handlebars node
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTREACH: function (code_generation_context)
	{
		'use strict';

		var ast_node = code_generation_context.astNode
		,	iterator_variable_name = this._generateUniqueId('eachIterator')
		,	iterator_index = iterator_variable_name+'Index'
		,	each_context_name = this._generateUniqueId('contextName')
		,	iterator_name = this._handlebarsEvaluateCondition(code_generation_context, ast_node.iterator)
		,	result = ''
		,	each_context = {
				value: iterator_variable_name
			,	first: iterator_index + ' === 0'
			,	last: iterator_index + ' === ('+iterator_name+'.length - 1)'
			,	index: iterator_index
			,	contextName: each_context_name
			};

		//reduce/EACH header
		result = '_.each( '+ iterator_name +', function ('+ iterator_variable_name+','+iterator_index+') {';
		//new context definition
		result += this._serializeContext(each_context, each_context_name, each_context.value);

		//adapt context default value. It is needed to add the context name to the serialized context value
		each_context.value = each_context_name + '.' + each_context.value;
		code_generation_context.contextStack.push(code_generation_context.currentContextName);
		code_generation_context.currentContextName = each_context;

		result += this.concatenateAttributeNodes(ast_node.eachBody, code_generation_context);
		result += '});';

		code_generation_context.currentContextName = code_generation_context.contextStack.pop();

		//TODO Give support for ELSE statement in EACH iterators!!!

		// if (ast_node.elseBody.length)
		// {
		// 	result += '} else {'
		// 	result += this.concatenateAttributeNodes(ast_node.elseBody, code_generation_context, true);
		// }
		return result;
	},

	//@method handlebarsATTRUNLESS Handle the parsing of all UNLESS handlebars node
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsATTRUNLESS: function (code_generation_context)
	{
		'use strict';

		var ast_node = code_generation_context.astNode
		,	result = 'if (!'+this._handlebarsEvaluateCondition(code_generation_context, ast_node.condition)+') {';

		if (!ast_node.unlessBody)
		{
			throw new Error('Invalid if statement. An UNLESS body is require: ' + JSON.stringify(ast_node));
		}

		result += this.concatenateAttributeNodes(ast_node.unlessBody, code_generation_context);

		if (ast_node.elseBody)
		{
			result += '} else {';
			result += this.concatenateAttributeNodes(ast_node.elseBody, code_generation_context);
		}

		result += '}';
		return result;
	},
};