//@module blueHTML
var _ = require('underscore')
,	codeGeneratorBase = require('./codeGenerator.Base');

//@class CodeGenerator
module.exports = {

	//@method concatenateTagNodes Given a list of ast nodes, iterate over them and returns a string that represent its union.
	//@param {Array<NodeASTNode>} nodes List of nodes to iterate
	//@param {CodeGenerationContext} code_generation_context Current code generation context
	//@param {Boolean} parent_require_new_context Indicate if the parent, the function that calls this function, requires that the result be in another
	// execution context or not.
	//@return {String} Portion of code that group all the nodes passed in
	concatenateTagNodes: function (nodes, code_generation_context, parent_require_new_context)
	{
		'use strict';

		var self = this
		,	handle_function
		,	result = ''
		,	variableName = code_generation_context.variableName

		,	there_is_NO_handlebars = _.all(nodes, function (node)
			{
				return node.type !== 'handlebars';
			});

		code_generation_context.isInsideContext = parent_require_new_context || !there_is_NO_handlebars;

		if (nodes.length)
		{

			if (code_generation_context.isInsideContext)
			{
				result = '(function () {';
				result +=  'var '+variableName+ '=[];';
				result += _.map(nodes, function (ast_node)
				{
					code_generation_context.astNode = ast_node;
					handle_function = self.getNodeHandle(ast_node);
					return handle_function.call(self, code_generation_context, true);
				}, '').join('');

				result += 'return '+variableName+'; })()';
			}
			else
			{
				result = '[' + _.map(nodes, function (ast_node)
				{
					code_generation_context.astNode = ast_node;
					code_generation_context.isInsideContext = false;
					handle_function = self.getNodeHandle(ast_node);
					return handle_function.call(self, code_generation_context, false);
				}, '').join(',') + ']';
			}
		}
		else
		{
			result = '[]';
		}

		return result;
	},


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//													HTML 																	//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	//@method htmlBlockNode Handle standard HTML blocks
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	htmlBlockNode: function (code_generation_context)
	{
		'use strict';

		var result = ''
		,	is_inside_context = code_generation_context.isInsideContext
		,	string_virtual_dom = ''
		,	attributes_result = this.parseAttributes(code_generation_context);

		string_virtual_dom = 'h("' + code_generation_context.astNode.openTag+ '",'+ (attributes_result || '{}') +',';
		string_virtual_dom += this.concatenateTagNodes(code_generation_context.astNode.children, code_generation_context, true);
		string_virtual_dom += ')';

		if (is_inside_context)
		{
			result = code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+string_virtual_dom+']);';
		}
		else
		{
			result = string_virtual_dom;
		}

		return result;
	},

	//@method htmlSingleNode Handle standard one liner HTML
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	htmlSingleNode: function (code_generation_context)
	{
		'use strict';

		var result = ''
		,	is_inside_context = code_generation_context.isInsideContext
		,	string_virtual_dom = ''
		,	attributes_result = this.parseAttributes(code_generation_context);

		string_virtual_dom = 'h("'+code_generation_context.astNode.tag+'",'+ (attributes_result || '{}') +',[])';

		if (is_inside_context)
		{
			result = code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+string_virtual_dom+']);';
		}
		else
		{
			result = string_virtual_dom;
		}

		return result;
	},

	//@method text Handle plain text inside the HTML document
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	text: function (code_generation_context)
	{
		'use strict';

		var string_virtual_dom = '"'+ code_generation_context.astNode.value +'"';

		return code_generation_context.isInsideContext ?  code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+string_virtual_dom+']);' : string_virtual_dom;
	},

	//@method htmlComment Handle standard HTML comments
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	htmlComment: function (code_generation_context)
	{
		'use strict';

		//TODO MAKE A BETTER MANAGEMENT OF HTML COMMENT NODES!!
		return '';
	},



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//													HANDLEBARS 																//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	//@method handlebarsSINGLECOMMENTS Handle the parsing of handlebar line comments
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsSINGLECOMMENTS: function (code_generation_context)
	{
		'use strict';

		//TODO Provide some support for handlebars comments
		return '';
	},

	//@method handlebarsSAFEEVALUATION Handle the parsing of safe evaluation handlebar nodes
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsSAFEEVALUATION: function (code_generation_context)
	{
		'use strict';

		var string_virtual_dom = '_.escape('+ code_generation_context.currentContextName.value + '.'+ code_generation_context.astNode.value +')';

		return code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+string_virtual_dom+']);';
	},

	//@method handlebarsUNSAFEEVALUATION Handle the parsing of unsafe evaluation handlebar nodes
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsUNSAFEEVALUATION: function (code_generation_context)
	{
		'use strict';

		var string_virtual_dom = '""+'+ code_generation_context.currentContextName.value + '.'+ code_generation_context.astNode.value;

		return code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+string_virtual_dom+']);';
	},

	//@method handlebarsLOOKUPSINGLE Handle the parsing of single lookup variable evaluation
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsLOOKUPSINGLE: function (code_generation_context)
	{
		'use strict';

		var string_virtual_dom = '_.escape('+ this._getLookUpContextName(code_generation_context, code_generation_context.astNode) + ')';

		return code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+string_virtual_dom+']);';
	},

	//@method handlebarsSAFEREFERENCEEVALUATION Handle the parsing of safe reference evaluation handlebar nodes
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsSAFEREFERENCEEVALUATION: function (code_generation_context)
	{
		'use strict';

		var string_virtual_dom = ''
		,	property_name = code_generation_context.astNode.value.trim().substr(1);

		if (code_generation_context.currentContextName[property_name])
		{
			string_virtual_dom = '_.escape('+ code_generation_context.currentContextName.contextName + '.' + property_name+')';
			return code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+string_virtual_dom+']);';
		}

		console.log(code_generation_context.astNode, 'Invalid safe reference evaluation');
		throw new Error('Invalid safe reference evaluation.');
	},

	//@method handlebarsEACH Handle the parsing of each handlebar nodes
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsEACH: function (code_generation_context)
	{
		'use strict';

		 code_generation_context.astNode = codeGeneratorBase.afterTagEachContextCreation.execute( code_generation_context.astNode, code_generation_context);

		var ast_node = code_generation_context.astNode
		,	iterator_variable_name = this._generateUniqueId('eachIterator')
		,	iterator_index = iterator_variable_name+'Index'
		,	accumulator_variable_name = this._generateUniqueId('eachAccumulator')
		,	each_context_name = this._generateUniqueId('contextName')
		,	iterator_name = this._handlebarsEvaluateCondition(code_generation_context, ast_node.iterator)
		,	result = ''
		//@class HandlebarsEACHContext
		,	each_context = {
				//@property {String} value
				value: iterator_variable_name
				//@property {String} first This string, when compiled will be converted to Boolean
 			,	first: iterator_index + ' === 0'
				//@property {String} last This string, when compiled will be converted to Boolean
			,	last: iterator_index + ' === ('+iterator_name+'.length - 1)'
				//@property {String} index This string, when compiled will be converted to Number
			,	index: iterator_index
				//@property {String} contextName
			,	contextName: each_context_name

			//This SHOULD NOT BE IN THE CORE, THIS OPTIONS MUST BE ADDED BY ONE EXTENSION!
			//I added here just to make it fast and easy :P
			,	indexPlusOne: iterator_index + '+1'
			};
			//@class CodeGenerator

		each_context = codeGeneratorBase.beforeTagEachContextCreation.execute(each_context, code_generation_context);

		//reduce/EACH header
		result = code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(' +
			'_.reduce( '+ iterator_name +', function ('+
					accumulator_variable_name+',' + iterator_variable_name+','+iterator_index+') {';
		//new context definition
		result += this._serializeContext(each_context, each_context_name, each_context.value);

		//adapt context default value. It is needed to add the context name to the serialized context value
		each_context.value = each_context_name + '.' + each_context.value;
		code_generation_context.contextStack.push(code_generation_context.currentContextName);
		code_generation_context.currentContextName = each_context;

		result += accumulator_variable_name +'='+ accumulator_variable_name +'.concat('+ this.concatenateTagNodes(ast_node.eachBody, code_generation_context, true)+ ');';
		result += 'return ' + accumulator_variable_name;
		result += '}, []));';

		code_generation_context.currentContextName = code_generation_context.contextStack.pop();

		//TODO Give support for ELSE statement in EACH iterators!!!

		// if (ast_node.elseBody.length)
		// {
		// 	result += '} else {'
		// 	result += this.concatenateTagNodes(ast_node.elseBody, code_generation_context, true);
		// }
		return result;
	},

	//@method handlebarsIF Handle the parsing of IF handlebar nodes
	// Notice that the second param 'not_consider_context' is indeed being passed in to this function, it is just the it does not make sense to used,
	// as we always need to run any handlebars conversion in the context of a function, '(function () {}()'
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsIF: function (code_generation_context)
	{
		'use strict';

		var ast_node = code_generation_context.astNode
		,	result = 'if ('+ this._handlebarsEvaluateCondition(code_generation_context, ast_node.condition) +') {';

		result += code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat('+
				this.concatenateTagNodes(ast_node.ifBody, code_generation_context, true) + ');';

		if (ast_node.elseBody.length)
		{
			result += '} else {';
			result += code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat('+
				this.concatenateTagNodes(ast_node.elseBody, code_generation_context, true) +');';
		}
		result += '}';
		return result;
	},

	//@method handlebarsUNLESS Handle the parsing of UNLESS handlebar nodes
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	handlebarsUNLESS: function (code_generation_context)
	{
		'use strict';

		var ast_node = code_generation_context.astNode
		,	result = 'if (!'+this._handlebarsEvaluateCondition(code_generation_context, ast_node.condition) +') {';

		result += this.concatenateTagNodes(ast_node.unlessBody, code_generation_context, true);

		if (ast_node.elseBody.length)
		{
			result += '} else {';
			result += this.concatenateTagNodes(ast_node.elseBody, code_generation_context, true);
		}
		result += '}';
		return result;
	}
};
