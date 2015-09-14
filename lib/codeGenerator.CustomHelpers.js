//@module blueHTML
var _ = require('underscore');


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//													TAGS 																	//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//@class CodeGenerator
module.exports = {

	//@method _joinExternalFunctionParameters Internal method to join parameters used by external functions
	//@param {Array<ParameterNode>} parameters
	//@param {CodeGenerationContext} code_generation_context
	//@return {String}
	_joinExternalFunctionParameters: function (parameters, code_generation_context)
	{
		'use strict';

		var self = this;

		//TODO TAKE INTO ACCOUNT THAT PARAMETERS CAN BE REFERENCE VALUES (@index)
		return _.reduce(parameters, function (acc, param)
		{
			switch (param.subType) {
				case 'SIMPLEVALUE':
					acc += ',' + param.value;
					break;
				case 'LOOKUPSINGLE':
					acc += ',' + self._getLookUpContextName(code_generation_context, param);
					break;
				case 'SINGLEEVALUATION':
					if ((+param.value).toString() === param.value)
					{
						//This is the case of numbers
						acc += ',' + param.value;
					}
					else
					{
						acc += ',' + code_generation_context.currentContextName.value + '.' + param.value;
					}
					break;
				default:
					acc += ',' + param.value;
			}
			return acc;
		}, '');
	},

	//@method runtimeGenericSingleHandle This method converts all passed in function that represent extra helpers to string in a safe way
	//@param {CodeGenerationContext} code_generation_context
	//@return {Function<CodeGenerationContext, Boolean, String>}
	runtimeGenericSingleHandle: function (code_generation_context)
	{
		'use strict';

		var fn = this['singleInstance' + code_generation_context.astNode.value].toString()
		,	result = '(function(){var fn = '+fn+'; return fn.call(this'+ this._joinExternalFunctionParameters(code_generation_context.astNode.parameters, code_generation_context)+'); })()';

		if (code_generation_context.isSettingAttributes)
		{
			if (code_generation_context.isSettingValue)
			{
				return code_generation_context.objectName + '["'+code_generation_context.keyName+'"]+=' + result +';';
			}
			else
			{
				return code_generation_context.objectName + '['+result+']="";';
			}
		}
		else
		{
			return code_generation_context.isInsideContext ?  code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+result+']);' : result;
		}
	},

	//@method runtimeGenericBlockHandle This method converts all passed in function that represent extra helpers to string in a safe way
	//@param {CodeGenerationContext} code_generation_context
	//@return {Function<CodeGenerationContext, Boolean, String>}
	runtimeGenericBlockHandle: function (code_generation_context)
	{
		'use strict';

		var fn = this['blockInstance' + code_generation_context.astNode.openTag].toString()
		,	result = '(function(){var fn = '+fn+'; return fn.call(this'+ this._joinExternalFunctionParameters(code_generation_context.astNode.parameters, code_generation_context)+'); })()';

		return code_generation_context.isInsideContext ?  code_generation_context.variableName + '=' + code_generation_context.variableName + '.concat(['+result+']);' : result;
	}
};