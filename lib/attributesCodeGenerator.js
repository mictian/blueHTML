//@module blueHTML
'use strict';

var attributesParser = require('./attributesParser')
,	_ = require('underscore');

//@class AttributesCodeGenerator
module.exports = (function ()
{
	//@class AttributesParseOptions
	var default_parsing_options = {
			//@property {ContextContainer} currentContextName Name of the initial context when running the returned string code. Default value: 'ctx'
			currentContextName: {
				value: 'ctx'
			}
			//@property {String} variableName Name of the variable used to accumulate all virtual dom nodes.
		,	objectName: 'obj'
			//@property {Array<ContextContainer>} contextStack Stack where all context names are saved. Used in functions like handlebars EACH that change the current context name.
		,	contextStack: []
		}
	//@class AttributesCodeGeneratorInitializer
	,	default_initialization_options = {
			//@property {String} compositeAttributeName Name of the attribute used composite views
		};
	//@class AttributesCodeGenerator

	//@method attributesCodeGenerator
	//@constructor
	//@param {AttributesCodeGeneratorInitializer} options
	//@return {Void}
	function attributesCodeGenerator (options)
	{
		/*jshint validthis:true */
		this._UNIQUE_ID_COUNTER = 0;
		this.options = _.defaults(options || {}, default_initialization_options);
	}

	//@method parse Parse the given string into a code that generate an object with the require properties
	//@param {String} attributes
	//@param {AttributesParseOptions} options
	//@return {AttributesParsingResult}
	attributesCodeGenerator.prototype.parse = function (attributes, options)
	{
		var attributes_ast = attributesParser.parse(attributes);
		attributes_ast = _.isArray(attributes_ast) ? attributes_ast : [attributes_ast];

		options = _.defaults(options || {}, default_parsing_options);

		this.communication_result = {
			compositeViews: []
		,	originalValue: ('"'+attributes.replace(/"/g,'\\"')+ '"') || '""'
		};

		//@class AttributesParsingContext
		var parsing_context = {
			//@property {AttributeASTNode} astNode Current node being processed
			astNode: {}
			//@property {Boolean} isSettingValue Indicate if in the current context the value of a property is being set or just the property itself
		,	isSettingValue: false
			//@property {String} objectName Name of the object where all the properties are added
		,	objectName: options.objectName
			//@property {String} keyName
		,	keyName: ''
			//property {ContextContainer} currentContextName
		,	currentContextName: options.currentContextName
			//@property {Array<ContextContainer>} contextStack Stack where all context names are saved. Used in functions like handlebars EACH that change the current context name.
		,	contextStack: options.contextStack
		};
		//@class AttributesCodeGenerator

		var result = '(function (){var '+parsing_context.objectName+' = {}; ';
		result += this.concatenateASTNodes(attributes_ast, parsing_context);
		result += 'return {attributes: '+parsing_context.objectName+'};})()';

		this.communication_result.value = result;
		return this.communication_result;
	};

	//@method getNodeHandle Auxiliary method that given a node, returns the method (of this class) that will handle/parse it
	//@param {AttributeASTNode} ast_node
	//@return {Function<AttributesParsingContext, String>}
	attributesCodeGenerator.prototype.getNodeHandle = function (ast_node)
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

	//@method extensionsBeforeHandling Internal method called for EACH ast node before calling its handle
	//@param {AttributeASTNode} ast_node
	//@param {Function<AttributesParsingContext, String>} final_fn_handler Final function that will handle this request
	//@param {NodesParsingContext} parsing_context
	//@return {Void}
	attributesCodeGenerator.prototype.extensionsBeforeHandling = function (ast_node, final_fn_handler, parsing_context)
	{
		//TODO USE SOME KIND OF PLUGIN CONTAINER HERE!
		if (ast_node.type === 'keyValue' && this.options.compositeAttributeName === ast_node.key)
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
				else if (value_node.type === 'handlebars' && value_node.subType === 'REFERENCEEVALUATION')
				{
					var property_name = value_node.value.trim().substr(1);
					if (parsing_context.currentContextName[property_name])
					{
						composite_view_name += '+'+parsing_context.currentContextName.contextName + '.' + property_name;
					}
				}
			}, this);
			// this.communication_result.compositeViews.push(value_node.value);
			this.communication_result.compositeViews.push(composite_view_name);
		}
	};

	//@method _joinExternalFunctionParameters Internal method to join parameters used by external functions
	//@param {Array<ParameterNode>} parameters
	//@param {NodesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype._joinExternalFunctionParameters = function (parameters, parsing_context)
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
	};

	//@method runtimeGenericSingleHandle
	//@param {AttributesParsingContext} parsing_context
	// This means, in case it is true, that the result must be concatenated with the current variable name.
	//@return {Function<AttributesParsingContext, Boolean, String>}
	attributesCodeGenerator.prototype.runtimeGenericSingleHandle = function (parsing_context)
	{
		var fn = this['singleInstance' + parsing_context.astNode.value].toString()
		,	result = '(function(){var fn = '+fn+'; return fn.call(this'+this._joinExternalFunctionParameters(parsing_context.astNode.params, parsing_context)+');})()';

		if (parsing_context.isSettingValue)
		{
			return parsing_context.objectName + '["'+parsing_context.keyName+'"]+=' + result +';';
		}
		else
		{
			return parsing_context.objectName + '['+result+']="";';
		}
	};

	//@method concatenateASTNodes Given a list of ast nodes, generate the concatenated string that represent the result of applying all the action specified in all the nodes
	//@param {Array<AttributeASTNode>} nodes List of node to concatenate
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.concatenateASTNodes = function (nodes, parsing_context)
	{
		var self = this
		,	is_setting_value = parsing_context.isSettingValue;

		nodes = _.isArray(nodes) ? nodes : [nodes];

		return _.reduce(nodes, function (acc, ast_node)
		{
			parsing_context.astNode = ast_node;

			var handle_function = self.getNodeHandle(ast_node);

			self.extensionsBeforeHandling(ast_node, handle_function, parsing_context);

			acc += handle_function.call(self, parsing_context);
			parsing_context.isSettingValue = is_setting_value;

			return acc;
		}, '');
	};

	//@method keyValue Handle the parsing of all node of type keyValue
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.keyValue = function (parsing_context)
	{
		parsing_context.isSettingValue = true;
		parsing_context.keyName = parsing_context.astNode.key; //FIX HERE (class to className?)

		var key_property_definition = parsing_context.objectName + '["'+parsing_context.keyName+'"]="";'
		,	key_property_setting = this.concatenateASTNodes(parsing_context.astNode.value, parsing_context);

		return key_property_definition + key_property_setting;
	};

	//@method singleValue Handle the parsing of all node of type stringValue (Generally one single word used to set a property's value)
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.singleValue = function (parsing_context)
	{
		if (parsing_context.isSettingValue)
		{
			return parsing_context.objectName + '["'+parsing_context.keyName+'"]+="' + parsing_context.astNode.value +'";';
		}
		else
		{
			//Single properties like checked or disable are parsed as singleValue
			return parsing_context.objectName + '["'+parsing_context.astNode.value+'"]="";';
		}
	};

	//@method singleValue Handle the parsing of all node of type singleKey (Generally one single word used to set a property name)
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.singleKey = function (parsing_context)
	{
		if (parsing_context.isSettingValue)
		{
			if ((parsing_context.astNode.subType === 'extraSpaces' && parsing_context.astNode.value !== '') ||
					parsing_context.astNode.subType !== 'extraSpaces')
			{
				//This case can happen because inside a handlebar code single expression are recognized as single key instead of single value!
				return parsing_context.objectName + '["'+parsing_context.keyName+'"]+="' + parsing_context.astNode.value +'";';
			}
		}
		else if (parsing_context.astNode.subType !== 'extraSpaces')
		{
			return parsing_context.objectName + '["'+parsing_context.astNode.value+'"]="";';
		}
		return '';
	};

	//@method handlebarsSAFEEVALUATION Handle the parsing of all safe evaluation handlebars node
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.handlebarsSAFEEVALUATION = function (parsing_context)
	{
		if (parsing_context.isSettingValue)
		{
			return parsing_context.objectName + '["'+parsing_context.keyName+'"]+=_.escape(' + parsing_context.currentContextName.value + '.' + parsing_context.astNode.value +');';
		}
		else
		{
			return parsing_context.objectName + '["'+parsing_context.astNode.value+'"]="";';
		}
	};

	//@method handlebarsCONTEXTLOOKUP Handle the parsing of all context lookup
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.handlebarsCONTEXTLOOKUP = function (parsing_context)
	{
		if (parsing_context.isSettingValue)
		{
			return parsing_context.objectName + '["'+parsing_context.keyName+'"]+=_.escape(' + this._getLookUpContextName(parsing_context, parsing_context.astNode) +');';
		}
		else
		{
			return parsing_context.objectName + '["'+this._getLookUpContextName(parsing_context, parsing_context.astNode)+'"]="";';
		}
	};

	//@method handlebarsUNSAFEEVALUATION Handle the parsing of all un-safe evaluation handlebars node
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.handlebarsUNSAFEEVALUATION = function (parsing_context)
	{
		if (parsing_context.isSettingValue)
		{
			return parsing_context.objectName + '["'+parsing_context.keyName+'"]+= ' + parsing_context.currentContextName.value + '.' + parsing_context.astNode.value +';';
		}
		else
		{
			return parsing_context.objectName + '["'+parsing_context.astNode.value+'"]="";';
		}
	};

	//@method _getLookUpContextName Internal method to find the context name in the case of look ups
	//@param {AttributesParsingContext} parsing_context
	//@param {NodeASTNode} node
	//@return {String}
	attributesCodeGenerator.prototype._getLookUpContextName = function (parsing_context, node)
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
	//@param {AttributesParsingContext} parsing_context
	//@param {ConditionNode} condition
	//@return {String}
	attributesCodeGenerator.prototype._handlebarsEvaluateCondition = function (parsing_context, condition)
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

	//@method handlebarsIF Handle the parsing of all IF handlebars node
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.handlebarsIF = function (parsing_context)
	{
		var ast_node = parsing_context.astNode
		,	result = 'if ('+this._handlebarsEvaluateCondition(parsing_context, ast_node.condition)+') {';

		if (!ast_node.ifBody)
		{
			throw new Error('Invalid if statement. An IF body is require: ' + JSON.stringify(ast_node));
		}

		result += this.concatenateASTNodes(ast_node.ifBody, parsing_context);

		if (ast_node.elseBody.length)
		{
			//there could be values that only returns empty string, like the extra added spaces.
			var aux = this.concatenateASTNodes(ast_node.elseBody, parsing_context);
			if (aux)
			{
				result += '} else {';
				result += aux;
			}
		}

		result += '}';
		return result;
	};

	//@method _serializeContext Internal method used to serialize a context object. This method is used by each handlebar block object that defines a new context. For example EACH
	// Notice that the presence of any property called contextName will NOT be included in the final result
	//@param {Object} context Any plain javascript object with one 'value' property
	//@param {String} variable_name Name of the object in the returned string
	//@param {String} value_name Name of the value property in the returned string
	//@return {String}
	attributesCodeGenerator.prototype._serializeContext = function (context, variable_name, value_name)
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

	//@method handlebarsEACH Handle the parsing of all EACHs handlebars node
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.handlebarsEACH = function (parsing_context)
	{
		var ast_node = parsing_context.astNode
		,	iterator_variable_name = this._generateUniqueId('eachIterator')
		,	iterator_index = iterator_variable_name+'Index'
		,	each_context_name = this._generateUniqueId('contextName')
		,	iterator_name = this._handlebarsEvaluateCondition(parsing_context, ast_node.iterator)
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
		parsing_context.contextStack.push(parsing_context.currentContextName);
		parsing_context.currentContextName = each_context;

		result += this.concatenateASTNodes(ast_node.eachBody, parsing_context);
		result += '});';

		parsing_context.currentContextName = parsing_context.contextStack.pop();

		//TODO Give support for ELSE statement in EACH iterators!!!

		// if (ast_node.elseBody.length)
		// {
		// 	result += '} else {'
		// 	result += this.concatenateASTNodes(ast_node.elseBody, parsing_context, true);
		// }
		return result;
	};

	//@method handlebarsREFERENCEEVALUATION Handle the parsing of safe reference evaluation handlebar nodes
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.handlebarsREFERENCEEVALUATION = function (parsing_context)
	{
		var property_name = parsing_context.astNode.value.trim().substr(1);

		if (parsing_context.currentContextName[property_name])
		{
			var referenced_property = parsing_context.currentContextName.contextName + '.' + property_name;

			if (parsing_context.isSettingValue)
			{
				return parsing_context.objectName + '["'+parsing_context.keyName+'"]+= _.escape(' + referenced_property +');';
			}
			else
			{
				return parsing_context.objectName + '[""'+referenced_property+']="";';
			}
		}

		console.log(parsing_context.astNode, 'Invalid safe reference evaluation');
		throw new Error('Invalid safe reference evaluation.');
	};

	//@method handlebarsUNLESS Handle the parsing of all UNLESS handlebars node
	//@param {AttributesParsingContext} parsing_context
	//@return {String}
	attributesCodeGenerator.prototype.handlebarsUNLESS = function (parsing_context)
	{
		var ast_node = parsing_context.astNode
		,	result = 'if (!'+this._handlebarsEvaluateCondition(parsing_context, ast_node.condition)+') {';

		if (!ast_node.unlessBody)
		{
			throw new Error('Invalid if statement. An UNLESS body is require: ' + JSON.stringify(ast_node));
		}

		result += this.concatenateASTNodes(ast_node.unlessBody, parsing_context);

		if (ast_node.elseBody)
		{
			result += '} else {';
			result += this.concatenateASTNodes(ast_node.elseBody, parsing_context);
		}

		result += '}';
		return result;
	};

	//@method _generateUniqueId Internal method used to create unique identifiers. Copy of underscore.uniqueId. It is copy here in order to
	// control it's internal state.
	//@param {String?} prefix Optional prefix string
	//@return {String}
	attributesCodeGenerator.prototype._generateUniqueId = function (prefix)
	{
		var id = ++this._UNIQUE_ID_COUNTER + '';
		return prefix ? prefix + id : id;
	};

	return attributesCodeGenerator;
})();

//@class AttributeASTNode
//@property {String} type

//@class AttributesParsingResult
//@property {String} value Concrete parsing result. String virtual-dom code
//@property {Aray<String>} compositeViews List of require composite views
//@property {String} originalValue Original attributes string
