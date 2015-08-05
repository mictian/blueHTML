//@module blueHTML
'use strict';

var nodesParser = require('./nodesParser')
,	_ = require('underscore');

//@class NodesCodeGenerator Class responsible to parse all the HTML. Notice that the logic here will only take place over the HTML/Handlebar
// code present in all the input string but not in the attributes. That task is delegated to the attributes parser.
module.exports = (function ()
{
	//@class NodeParseOptions
	var default_parsing_options = {
			//@property {ContextContainer} contextName Name of the initial context when running the returned string code. Default value: 'ctx'
			contextName: {
				value: 'ctx'
			}
			//@property {String} variableName Name of the variable used to accumulate all virtual dom nodes.
		,	variableName: 'children'
			//@property {String} externalDependencyVariableName Name of the variable used to call external composite views.
		,	externalDependencyVariableName: 'children_views_dependencies'
			//@property {Boolean} allowMultiplesFathers
		,	allowMultiplesFathers: false
		}
	//@class NodesCodeGeneratorInitializer
	,	default_initialization_options = {
			//@property {AttributesParserManager} attributesParser CLASS used to create a new instance
			//@property {AttributesParserManager} attributesParserInstance Concrete INSTANCE of the attribute parser
			//@property {AttributesParserManagerInitializer} attributeParserOptions
		};
	//@class NodesCodeGenerator

	//@method nodesCodeGenerator
	//@param {NodesCodeGeneratorInitializer} options
	//@constructor
	//@return {Void}
	function nodesCodeGenerator (options)
	{
		/*jshint validthis:true */
		options = _.defaults(options || {}, default_initialization_options);

		this._UNIQUE_ID_COUNTER = 0;
		if (options.attributesParserInstance)
		{
			this.attributes_parser = options.attributesParserInstance;
		}
		else if (options.attributesParser)
		{
			this.attributes_parser = new options.attributesParser(options.attributeParserOptions);
		}
	}

	//@method parseAttributes Internal method call when any attributes string need to be parsed. This method delegate the parsing task to the Attributes Parser Manager
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	nodesCodeGenerator.prototype.parseAttributes = function (parsing_context)
	{
		parsing_context.astNode.attributes = parsing_context.astNode.attributes.trim().replace(/\t/g, ' ').replace(/\n/g, ' ');
		if (this.attributes_parser && parsing_context.astNode.attributes)
		{
			// console.log(parsing_context.astNode.attributes);
			return this.attributes_parser.parse(parsing_context.astNode.attributes, {
				currentContextName: parsing_context.currentContextName
			,	contextStack: parsing_context.contextStack
			});
		}
		return '{}';
	};

	//@method parse Parse the given string into a virtual-dom string
	//@param {String} string HTML/Handlebar code to parse
	//@param {NodeParseOptions} options
	//@return {String} String code that contains all the virtual-dom
	nodesCodeGenerator.prototype.parse = function (string, options)
	{
		options = _.defaults(options || {}, default_parsing_options);

		var nodes_ast = nodesParser.parse(string)
		//@class NodesParsingContext This class group all the information to carry on all the parsing process at a give time.
		,	parsing_context = {
				//@property {NodeASTNode} astNode Current node being processed
				astNode: {}
				//property {ContextContainer} currentContextName
			,	currentContextName: options.contextName
				//@property {Array<ContextContainer>} contextStack Stack where all context names are saved. Used in functions like handlebars EACH that change the current context name.
			,	contextStack: []
				//@property {String} variableName Name of the variable that accumulate all virtual-dom elements
			,	variableName: options.variableName
				//@property {String} externalDependencyVariableName Name of the variable used to call external composite views.
			,	externalDependencyVariableName: options.externalDependencyVariableName
			};
		//@class NodesCodeGenerator

		this.communication_result = {
			compositeViews: []
		,	contextName: options.contextName.value
		,	externalDependencyVariableName: options.externalDependencyVariableName
		};

		if (nodes_ast.length > 1 && !options.allowMultiplesFathers)
		{
			throw new Error('Invalid handlebars template. Please make sure there is only one parent node!');
		}

		this.communication_result.value = this.concatenateASTNodes(nodes_ast, parsing_context, false);
		return this.communication_result
	};

	//@method concatenateASTNodes Given a list of ast nodes, iterate over them and returns a string that represent it union.
	//@param {Array<NodeASTNode>} nodes List of nodes to iterate
	//@param {NodesParsingContext} parsing_context Current parsing context
	//@param {Boolean} parent_require_new_context Indicate if the parent, the function that calls this function, requires that the result be in another
	// execution context or not.
	//@return {String} Portion of code that group all the nodes passed in
	nodesCodeGenerator.prototype.concatenateASTNodes = function (nodes, parsing_context, parent_require_new_context)
	{
		var self = this
		,	handle_function
		,	result = ''
		,	variableName = parsing_context.variableName

		,	there_is_NO_handlebars = _.all(nodes, function (node)
			{
				return node.type !== 'handlebars';
			})

		,	create_new_context = parent_require_new_context || !there_is_NO_handlebars;

		if (nodes.length)
		{
			if (create_new_context)
			{
				result = '(function () {';
				result +=  variableName+ '= [];';
				result += _.map(nodes, function (ast_node)
				{
					parsing_context.astNode = ast_node;
					handle_function = self.getNodeHandle(ast_node);
					return handle_function.call(self, parsing_context, true);
				}, '').join('');

				result += 'return '+variableName+'; })()';
			}
			else
			{
				result = '[' + _.map(nodes, function (ast_node)
				{
					parsing_context.astNode = ast_node;
					handle_function = self.getNodeHandle(ast_node);
					return handle_function.call(self, parsing_context, false);
				}, '').join(',') + ']';
			}
		}
		else
		{
			result = '[]';
		}

		return result;
	};

	//@method getNodeHandle Auxiliary method that given a node, returns the method (of this class) that will handle/parse it
	// Please notice that the searched function must fulfill the criteria based on the name of the type of the ast node
	//@param {NodeASTNode} ast_node Node used to look a handle for
	//@return {Function<NodesParsingContext, Boolean, String>}
	nodesCodeGenerator.prototype.getNodeHandle = function (ast_node)
	{
		var fn;

		if (ast_node.type === 'handlebars' && ast_node.subType === 'GENERICSINGLE')
		{
			fn = _.isFunction(this['single' + ast_node.value]) ? this['single' + ast_node.value] :
					_.isFunction(this['singleInstance' + ast_node.value]) ? this.runtimeGenericSingleHandle :
					null;
		}
		else if (ast_node.type === 'handlebars' )
		{
			fn = this['handlebars' + ast_node.subType];
		}
		else
		{
			fn = this[ast_node.type];
		}

		if (!fn)
		{
			console.log(ast_node);
		}

		return fn;
	};

	//@method _joinExternalFunctionParameters Internal method to join parameters used by external functions
	//@param {Array<ParameterNode>} parameters
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	nodesCodeGenerator.prototype._joinExternalFunctionParameters = function (parameters, parsing_context)
	{
		var self = this;

		//TODO TAKE INTO ACCOUNT THAT PARAMETERS CAN BE REFERENCE VALUES (@index)
		return _.reduce(parameters, function (acc, param)
		{
			switch (param.subType) {
				case 'SIMPLEVALUE':
					acc += ',' + param.value;
					break;
				case 'LOOKUPSINGLE':
					acc += ',' + self._getLookUpContextName(parsing_context, param);
					break;
				case 'SINGLEEVALUATION':
					if ((+param.value).toString() === param.value)
					{
						//This is the case of numbers
						acc += ',' + param.value;
					}
					else
					{
						acc += ',' + parsing_context.currentContextName.value + '.' + param.value;
					}
					break;
				default:
					acc += ',' + param.value;
			}
			return acc;
		}, '');
	}

	//@method runtimeGenericSingleHandle This method converts all passed in function that represent extra helpers to string in a safe way
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {Function<NodesParsingContext, Boolean, String>}
	nodesCodeGenerator.prototype.runtimeGenericSingleHandle = function (parsing_context, is_inside_context)
	{
		//TODO CHECK EACH PARAMETER, IF IT IS STRING LEAVE AS IT IS, CAN BE A REFERENCE VALUES, LOOKUP VALUE AND A SINGLE EVALUATION VALUE!
		var fn = this['singleInstance' + parsing_context.astNode.value].toString()
		,	result = '(function(){var fn = '+fn+'; return fn.call(this'+ this._joinExternalFunctionParameters(parsing_context.astNode.parameters, parsing_context)+'); })()';

		return is_inside_context ?  parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+result+']);' : result;
	};

	//@method _augmentNodeChildrenForCompositeViews Internal method to add for each NodeASTNode that has properties the can indicate that the node is a composite point
	// an extra child to express that composite point
	//@param {Array<NodeASTNode>} node_children
	//@param {AttributesParsingResult} attributes_result
	//@return {Array<NodeASTNode>}
	nodesCodeGenerator.prototype._augmentNodeChildrenForCompositeViews = function (node_children, attributes_result)
	{
		node_children = node_children || [];

		_.each(attributes_result.compositeViews, function (require_composite_view)
		{
			node_children.push({
				type: 'handlebars'
			,	subType: 'CompositeView'
			,	value: require_composite_view
			,	parameters: attributes_result.value
			});
		});
		this.communication_result.compositeViews = this.communication_result.compositeViews.concat(attributes_result.compositeViews)

		return node_children;
	};

	//@method compositeView Handle for composite nodes
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsCompositeView = function (parsing_context, is_inside_context)
	{
		var invokable_fn = parsing_context.externalDependencyVariableName+'['+parsing_context.astNode.value+']'
		,	string_virtual_dom = '(function (){ '+
			'if (_.isFunction('+invokable_fn+')) { return '+invokable_fn+'('+parsing_context.astNode.parameters+'); }' +
			'return []; })()';

		if (is_inside_context)
		{
			return parsing_context.variableName + '=' + parsing_context.variableName + '.concat('+string_virtual_dom+');';
		}

		return string_virtual_dom;
	};

	//@method htmlBlockNode Handle standard HTML blocks
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.htmlBlockNode = function (parsing_context, is_inside_context)
	{
		var result = ''
		,	string_virtual_dom = ''
		,	attributes_result = this.parseAttributes(parsing_context)
		,	ast_node_children = this._augmentNodeChildrenForCompositeViews(parsing_context.astNode.children, attributes_result);

		string_virtual_dom = 'h("' + parsing_context.astNode.openTag+ '",'+ (attributes_result.value || '{}') +',';
		string_virtual_dom += this.concatenateASTNodes(ast_node_children, parsing_context, true);
		string_virtual_dom += ')';

		if (is_inside_context)
		{
			result = parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+string_virtual_dom+']);';
		}
		else
		{
			result = string_virtual_dom;
		}

		return result;
	};

	//@method htmlComment Handle standard HTML comments
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	nodesCodeGenerator.prototype.htmlComment = function (parsing_context)
	{
		//TODO MAKE A BETTER MANAGEMENT OF HTML COMMENT NODES!!
		return '';
	};

	//@method htmlSingleNode Handle standard one liner HTML
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.htmlSingleNode = function (parsing_context, is_inside_context)
	{
		var result = ''
		,	string_virtual_dom = ''
		,	attributes_result = this.parseAttributes(parsing_context)
		,	ast_node_children = this._augmentNodeChildrenForCompositeViews(parsing_context.astNode.children, attributes_result);

		//As this is a single (one line / a tag that does not have an open and a closing name) html node we do not calcualte its children
		string_virtual_dom = 'h("'+parsing_context.astNode.tag+'",'+ (attributes_result.value || '{}') +',';
		string_virtual_dom += this.concatenateASTNodes(ast_node_children, parsing_context, true);
		string_virtual_dom += ')';

		if (is_inside_context)
		{
			result = parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+string_virtual_dom+']);';
		}
		else
		{
			result = string_virtual_dom;
		}

		return result;
	};

	//@method text Handle plain text inside the HTML document
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.text = function (parsing_context, is_inside_context)
	{
		var string_virtual_dom = '"'+ parsing_context.astNode.value +'"';

		return is_inside_context ?  parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+string_virtual_dom+']);' : string_virtual_dom;
	};

	//@method handlebarsSINGLECOMMENTS Handle the parsing of handlebar line comments
	// Notice that the second param 'not_consider_context' is indeed being passed in to this function, it is just the it does not make sense to used,
	// as we always need to run any handlebars conversion in the context of a function, '(function () {}()'
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsSINGLECOMMENTS = function (parsing_context)
	{
		//TODO Provide some support for handlebars comments
		return '';//+  parsing_context;
	};

	//@method handlebarsSAFEEVALUATION Handle the parsing of safe evaluation handlebar nodes
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsSAFEEVALUATION = function (parsing_context, is_inside_context)
	{
		var string_virtual_dom = '_.escape('+ parsing_context.currentContextName.value + '.'+ parsing_context.astNode.value +')';

		return is_inside_context ? parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+string_virtual_dom+']);' : string_virtual_dom;
	};

	//@method handlebarsUNSAFEEVALUATION Handle the parsing of unsafe evaluation handlebar nodes
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsUNSAFEEVALUATION = function (parsing_context, is_inside_context)
	{
		var string_virtual_dom = '""+'+ parsing_context.currentContextName.value + '.'+ parsing_context.astNode.value;

		return is_inside_context ? parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+string_virtual_dom+']);' : string_virtual_dom;
	};

	//@method handlebarsLOOKUPSINGLE Handle the parsing of single lookup variable evaluation
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsLOOKUPSINGLE = function (parsing_context, is_inside_context)
	{
		var string_virtual_dom = '_.escape('+ this._getLookUpContextName(parsing_context, parsing_context.astNode) + ')';

		return is_inside_context ? parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+string_virtual_dom+']);' : string_virtual_dom;
	};

	//@method handlebarsSAFEREFERENCEEVALUATION Handle the parsing of safe reference evaluation handlebar nodes
	//@param {NodesParsingContext} parsing_context
	//@param {Boolean} is_inside_context Indicate if this function is invoked being inside a new execution context.
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsSAFEREFERENCEEVALUATION = function (parsing_context, is_inside_context)
	{
		var string_virtual_dom = ''
		,	property_name = parsing_context.astNode.value.trim().substr(1);

		if (parsing_context.currentContextName[property_name])
		{
			string_virtual_dom = '_.escape('+ parsing_context.currentContextName.contextName + '.' + property_name+')';
			return is_inside_context ? parsing_context.variableName + '=' + parsing_context.variableName + '.concat(['+string_virtual_dom+']);' : string_virtual_dom;
		}

		console.log(parsing_context.astNode, 'Invalid safe reference evaluation');
		throw new Error('Invalid safe reference evaluation.');
	};

	//@method _generateUniqueId Internal method used to create unique identifiers. Copy of underscore.uniqueId. It is copy here in order to
	// control it's internal state.
	//@param {String?} prefix Optional prefix
	//@return {String}
	nodesCodeGenerator.prototype._generateUniqueId = function (prefix)
	{
		var id = ++this._UNIQUE_ID_COUNTER + '';
		return prefix ? prefix + id : id;
	};

	//@method _serializeContext Internal method used to serialize a context object. This method is used by each handlebar block object that defines a new context. For example EACH
	// Notice that the presence of any property called contextName will NOT be included in the final result
	//@param {Object} context Any plain javascript object with one 'value' property
	//@param {String} variable_name Name of the object in the returned string
	//@param {String} value_name Name of the value property in the returned string
	//@return {String}
	nodesCodeGenerator.prototype._serializeContext = function (context, variable_name, value_name)
	{
		var result = 'var ' + variable_name + '= {'
		,	prefix = '';

		for (var key in context)
		{
			if (context.hasOwnProperty(key) && key !== 'contextName')
			{
				if (key === 'value')
				{
					result += prefix + value_name + ':' + context[key];
				}
				else
				{
					result += prefix + key + ':' + context[key];
				}

				prefix = ',';
			}
		}

		result += '};';
		return result;
	};

	//@method handlebarsEACH Handle the parsing of each handlebar nodes
	// Notice that the second param 'is_inside_context' is indeed being passed in to this function, it is just the it does not make sense to used,
	// as we always need to run any handlebars conversion in the context of a function, '(function () {}()'
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsEACH = function (parsing_context)
	{
		var ast_node = parsing_context.astNode
		,	iterator_variable_name = this._generateUniqueId('eachIterator')
		,	iterator_index = iterator_variable_name+'Index'
		,	accumulator_variable_name = this._generateUniqueId('eachAccumulator')
		,	each_context_name = this._generateUniqueId('contextName')
		,	iterator_name = this._handlebarsEvaluateCondition(parsing_context, ast_node.iterator)
		,	result = ''
		,	each_context = {
				value: iterator_variable_name
			,	first: iterator_index + ' === 0'
			,	last: iterator_index + ' === ('+iterator_name+'.length - 1)'
			,	index: iterator_index
			,	contextName: each_context_name

			//This SHOULD NOT BE IN THE CORE, THIS OPTIONS MUST BE ADDED BY ONE EXTENSION!
			//I added here just to make it fast and easy :P
			,	indexPlusOne: iterator_index + '+1'
			};

		//reduce/EACH header
		result = parsing_context.variableName + '=' + parsing_context.variableName + '.concat(' +
			'_.reduce( '+ iterator_name +', function ('+
					accumulator_variable_name+',' + iterator_variable_name+','+iterator_index+') {';
		//new context definition
		result += this._serializeContext(each_context, each_context_name, each_context.value);

		//adapt context default value. It is needed to add the context name to the serialized context value
		each_context.value = each_context_name + '.' + each_context.value;
		parsing_context.contextStack.push(parsing_context.currentContextName);
		parsing_context.currentContextName = each_context;

		result += accumulator_variable_name +'='+ accumulator_variable_name +'.concat('+ this.concatenateASTNodes(ast_node.eachBody, parsing_context, true)+ ');';
		result += 'return ' + accumulator_variable_name;
		result += '}, []));';

		parsing_context.currentContextName = parsing_context.contextStack.pop();

		//TODO Give support for ELSE statement in EACH iterators!!!

		// if (ast_node.elseBody.length)
		// {
		// 	result += '} else {'
		// 	result += this.concatenateASTNodes(ast_node.elseBody, parsing_context, true);
		// }
		return result;
	};

	//@method _getLookUpContextName Internal method to find the context name in the case of look ups
	//@param {NodesParsingContext} parsing_context
	//@param {NodeASTNode} node
	//@return {String}
	nodesCodeGenerator.prototype._getLookUpContextName = function (parsing_context, node)
	{
		//We remove one as the length returns the amount of items in the array and we need the index
		var number_of_elements_to_exclude = parsing_context.contextStack.length - 1
		//We remove 2 because; 1 for the name of the variable inside the value array and 1 because the current context name is not the parsing context stack
		,	inverted_index = node.value.length - 2
		,	context_index = (number_of_elements_to_exclude - inverted_index) < 0 ? 0 : number_of_elements_to_exclude - inverted_index
		,	selected_context_name = parsing_context.contextStack[context_index] ? parsing_context.contextStack[context_index].value : parsing_context.currentContextName.value;

		return selected_context_name + '.' + node.value[node.value.length - 1];
	};

	//@method _handlebarsEvaluateCondition Evaluates the condition of IFs, UNLESSs and EACHs. As these values can be single evaluation or lookups
	//@param {NodesParsingContext} parsing_context
	//@param {ConditionNode} condition
	//@return {String}
	nodesCodeGenerator.prototype._handlebarsEvaluateCondition = function (parsing_context, condition)
	{
		if (condition.subType === 'SINGLEEVALUATION')
		{
			return parsing_context.currentContextName.value + '.' + condition.value;
		}
		else if (condition.subType === 'REFERENCEEVALUATION')
		{
			var property_name = condition.value.trim().substr(1);
			if (parsing_context.currentContextName[property_name])
			{
				return parsing_context.currentContextName.contextName + '.' + property_name;
			}
			console.log(condition, 'Invalid reference evaluation');
			throw new Error('Invalid reference evaluation.');
		}
		else if (condition.subType === 'LOOKUPSINGLE')
		{
			return this._getLookUpContextName(parsing_context, condition);
		}
		else
		{
			console.log(condition, 'Non supported evaluation!');
			throw new Error('Non supported evaluation!');
		}
	};

	//@method handlebarsIF Handle the parsing of IF handlebar nodes
	// Notice that the second param 'not_consider_context' is indeed being passed in to this function, it is just the it does not make sense to used,
	// as we always need to run any handlebars conversion in the context of a function, '(function () {}()'
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsIF = function (parsing_context)
	{
		var ast_node = parsing_context.astNode
		,	result = 'if ('+ this._handlebarsEvaluateCondition(parsing_context, ast_node.condition) +') {';

		result += parsing_context.variableName + '=' + parsing_context.variableName + '.concat('+
				this.concatenateASTNodes(ast_node.ifBody, parsing_context, true) + ');';

		if (ast_node.elseBody.length)
		{
			result += '} else {';
			result += parsing_context.variableName + '=' + parsing_context.variableName + '.concat('+
				this.concatenateASTNodes(ast_node.elseBody, parsing_context, true) +');';
		}
		result += '}';
		return result;
	};

	//@method handlebarsUNLESS Handle the parsing of UNLESS handlebar nodes
	// Notice that the second param 'is_inside_context' is indeed being passed in to this function, it is just the it does not make sense to used,
	// as we always need to run any handlebars conversion in the context of a function, '(function () {}()'
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	nodesCodeGenerator.prototype.handlebarsUNLESS = function (parsing_context)
	{
		var ast_node = parsing_context.astNode
		,	result = 'if (!'+this._handlebarsEvaluateCondition(parsing_context, ast_node.condition) +') {';

		result += this.concatenateASTNodes(ast_node.unlessBody, parsing_context, true);

		if (ast_node.elseBody.length)
		{
			result += '} else {';
			result += this.concatenateASTNodes(ast_node.elseBody, parsing_context, true);
		}
		result += '}';
		return result;
	};

	return nodesCodeGenerator;
})();


//@class NodesCodeGeneratorInitializer
//@property {AttributesParserManager} attributesParser

//@class NodeASTNode

//@class ConditionNode
//@property {String} type This should always be 'handlebars'
//@property {String} subType Possible values: LOOKUPSINGLE, SINGLEEVALUATION
//@property {String|Array<String>} value String in case it is a SINGLEEVALUATION or an array in the of a

//@class ContextContainer The aim of this class is allow to define custom variables each time a new context is defined
//@property {String} value Default string context name
//@property {String?} last This value will be only present when executing inside an each block
//@property {String?} first This value will be only present when executing inside an each block
//@property {String?} index This value will be only present when executing inside an each block
//@property {String?} contextName This value will be only present when executing inside an each block


//@class ParameterNode
//@property {String} type This String must be always 'parameter'
//@property {String} subType Possible values are: SIMPLEVALUE, LOOKUPSINGLE, REFERENCEEVALUATION or SINGLEEVALUATION
//@property {String|Array<String>} value Array in the case of a lookup value or a string otherwise
