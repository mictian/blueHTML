
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//													UTILS 																	//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//@module blueHTML
//@class CodeGenerator
module.exports = {

	//@method _generateUniqueId Internal method used to create unique identifiers. Copy of underscore.uniqueId. It is copy here in order to
	// control it's internal state.
	//@param {String?} prefix Optional prefix
	//@return {String}
	_generateUniqueId: function (prefix)
	{
		'use strict';

		var id = ++this._UNIQUE_ID_COUNTER + '';
		return prefix ? prefix + id : id;
	},

	//@method _serializeContext Internal method used to serialize a context object. This method is used by each handlebar block object that defines a new context. For example EACH
	// Notice that the presence of any property called contextName will NOT be included in the final result
	//@param {Object} context Any plain javascript object with one 'value' property
	//@param {String} variable_name Name of the object in the returned string
	//@param {String} value_name Name of the value property in the returned string
	//@return {String}
	_serializeContext: function (context, variable_name, value_name)
	{
		'use strict';

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
	},

	//@method _getLookUpContextName Internal method to find the context name in the case of look Ups
	//@param {CodeGenerationContext} code_generation_context
	//@param {NodeASTNode} node
	//@return {String}
	_getLookUpContextName: function (code_generation_context, node)
	{
		'use strict';

		//We remove one as the length returns the amount of items in the array and we need the index
		var number_of_elements_to_exclude = code_generation_context.contextStack.length - 1
		//We remove 2 because; 1 for the name of the variable inside the value array and 1 because the current context name is not the parsing context stack
		,	inverted_index = node.value.length - 2
		,	context_index = (number_of_elements_to_exclude - inverted_index) < 0 ? 0 : number_of_elements_to_exclude - inverted_index
		,	selected_context_name = code_generation_context.contextStack[context_index] ? code_generation_context.contextStack[context_index].value : code_generation_context.currentContextName.value;

		return selected_context_name + '.' + node.value[node.value.length - 1];
	},

	//@method _handlebarsEvaluateCondition Evaluates the condition of IFs, UNLESSs and EACHs. As these values can be single evaluation or lookups
	//@param {CodeGenerationContext} code_generation_context
	//@param {ConditionNode} condition
	//@return {String}
	_handlebarsEvaluateCondition: function (code_generation_context, condition)
	{
		'use strict';

		if (condition.subType === 'SINGLEEVALUATION' || condition.subType === 'ATTRSINGLEEVALUATION')
		{
			return code_generation_context.currentContextName.value + '.' + condition.value;
		}
		else if (condition.subType === 'REFERENCEEVALUATION' || condition.subType === 'ATTRREFERENCEEVALUATION')
		{
			var property_name = condition.value.trim().substr(1);
			if (code_generation_context.currentContextName[property_name])
			{
				return code_generation_context.currentContextName.contextName + '.' + property_name;
			}
			console.log(condition, 'Invalid reference evaluation');
			throw new Error('Invalid reference evaluation.');
		}
		else if (condition.subType === 'LOOKUPSINGLE' || condition.subType === 'ATTRLOOKUPSINGLE')
		{
			return this._getLookUpContextName(code_generation_context, condition);
		}
		else
		{
			console.log(condition, 'Non supported evaluation!');
			throw new Error('Non supported evaluation!');
		}
	}
};