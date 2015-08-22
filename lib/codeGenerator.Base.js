//@module blueHTML
'use strict';

var handlebars_parser = require('handlebars-ex')
,	HookContainer = require('./hookContainer')
,	_ = require('underscore');

//@class CodeGenerator Class responsible to call the Handlebars parsers and from that result generate Virtual-DOM code
module.exports = (function ()
{
	//@class ParseOptions
	var default_parsing_options = {
			//@property {ContextContainer} contextName Name of the initial context when running the returned string code. Default value: 'ctx'
			contextName: {
				value: 'ctx'
			}
			//@property {String} variableName Name of the variable used to accumulate all virtual dom nodes.
		,	variableName: 'children'
			//@property {Boolean} allowMultiplesFathers
		,	allowMultiplesFathers: false
			//@property {Sring} attributeObjectName
		,	attributeObjectName: 'obj'
			//@property {Sring} externalDependenciesObjectName
		,	externalDependenciesObjectName: 'external_dependencies'
		};

	//@method codeGenerator
	//@constructor
	//@return {Void}
	function codeGenerator ()
	{
		/*jshint validthis:true */
		this._UNIQUE_ID_COUNTER = 0;
	}

	//@method parse Parse the given string into a virtual-dom string
	//@param {String} string HTML/Handlebar code to parse
	//@param {ParseOptions} options
	//@return {String} String code that contains all the virtual-dom
	codeGenerator.prototype.parse = function (string, options)
	{
		this.options = _.defaults(options || {}, default_parsing_options);

		var	nodes_ast
		//@class CodeGenerationResult
		,	communication_result = {
				//@property {String} contextName
				contextName: this.options.contextName.value
				//@property {String} value Final string result
			,	value: ''
				//@property {Arra<String>} externalDependencies General purpose array to be used by plugins to add any external dependency
			,	externalDependencies: []
				//@property {String} externalDependenciesObjectName Name of the object that will carry all external dependencies
			,	externalDependenciesObjectName: this.options.externalDependenciesObjectName
			}
		//@class CodeGenerationContext This class holds all the information and data used during the code generation process
		,	code_generation_context = {
				//@property {NodeASTNode} astNode Current node being processed
				astNode: {}
				//property {ContextContainer} currentContextName
			,	currentContextName: this.options.contextName
				//@property {Array<ContextContainer>} contextStack Stack where all context names are saved. Used in functions like handlebars EACH that change the current context name.
			,	contextStack: []
				//@property {String} variableName Name of the variable that accumulate all virtual-dom elements
			,	variableName: this.options.variableName
				//@param {Boolean} isInsideContext Indicate if this function is invoked being inside a new execution context.
				// This means, in case it is true, that the result must be concatenated with the current variable name.
			,	isInsideContext: false
				//@property {String} externalDependenciesObjectName Name of the object that will carry all external dependencies
			,	externalDependenciesObjectName: this.options.externalDependenciesObjectName
			};
		//@class CodeGenerator

		string = codeGenerator.beforeTagCodeGeneration.execute(string, code_generation_context);

		nodes_ast = handlebars_parser.parse(string);

		if (nodes_ast.length > 1 && !this.options.allowMultiplesFathers)
		{
			throw new Error('Invalid handlebars template. Please make sure there is only one parent node!');
		}

		communication_result.value = this.concatenateTagNodes(nodes_ast, code_generation_context, false);

		communication_result = codeGenerator.afterTagCodeGeneration.execute(communication_result, code_generation_context);

		return communication_result;
	};

	//@method getNodeHandle Auxiliary method that given a node, returns the method (of this class) that will handle/parse it
	// Please notice that the searched function must fulfill the criteria based on the name of the type of the ast node
	//@param {NodeASTNode} ast_node Node used to look a handle for
	//@return {Function<CodeGenerationContext, Boolean, String>}
	codeGenerator.prototype.getNodeHandle = function (ast_node)
	{
		var fn;

		if (ast_node.type === 'handlebars' && (ast_node.subType === 'GENERICSINGLE' || ast_node.subType === 'ATTRGENERICSINGLE'))
		{
			fn = _.isFunction(this['single' + ast_node.value]) ? this['single' + ast_node.value] :
					_.isFunction(this['singleInstance' + ast_node.value]) ? this.runtimeGenericSingleHandle :
					null;
		}
		else if (ast_node.type === 'handlebars' && ast_node.subType === 'GENERICBLOCK')
		{
			fn = _.isFunction(this['block' + ast_node.openTag]) ? this['block' + ast_node.openTag] :
					_.isFunction(this['blockInstance' + ast_node.openTag]) ? this.runtimeGenericBlockHandle :
					null;
		}
		else if (ast_node.type === 'handlebars')
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



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//													PLUGINS DEFINITION														//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//@property {HookContainer} beforeAttributeHandlerRetrieved Static plugin property invoked before the attributes handlebars handler is detected/retrieved.
	//Aim: Edit the selected attribute AST Node before being used to detect the handler
	//Its invocation has the following signature: Function<AttributeASTNode, CodeGenerationContext,	AttributeASTNode> where the last value is the optional return one.
	codeGenerator.beforeAttributeHandlerRetrieved = new HookContainer();

	//@property {HookContainer} beforeAttributeHandlerExecuted Static plugin property invoked before the attributes handlebars handler is executed
	//Aim: Edit the selected attribute AST node before being used by the selected handle and wrap the selected handler function
	//Its invocation has the following signature: Function<AttributeASTNode, CodeGenerationContext, Object<handler:function>, AttributeASTNode> where the last value is the optional return one.
	codeGenerator.beforeAttributeHandlerExecuted = new HookContainer();
	//@property {HookContainer} afterAttributeHandlerExecuted Static plugin property invoked after the attributes handlebars handler is executed
	//Aim: Access the accumulated attribute generated code up to the moment, access the result of the function handler and add another step to edit the selected attribute AST node
	//Its invocation has the following signature: Function<AttributeASTNode, CodeGenerationContext, Object<acummulatedValue:String, currentResult:String>, AttributeASTNode> where the last value is the optional return one.
	codeGenerator.afterAttributeHandlerExecuted = new HookContainer();

	//@property {HookContainer} beforeAttributeCodeGeneration Static plugin property invoked when at the beginning of the attributes code generation process for each tag node.
	//Aim: Access the entire Tag node that contains the attributes sub-tree, and to initialize plugin's state related with the attributes code generation
	//Its invocation has the following signature: Function<AttributeASTNode, CodeGenerationContext, AttributeASTNode> where the last value is the optional return one.
	codeGenerator.beforeAttributeCodeGeneration = new HookContainer();
	//@property {HookContainer} afterAttributeCodeGeneration Static plugin property invoked when at the end of the attributes code generation process for each tag node.
	//Aim: Access/Edit the entire result of attributes code generation, also to clean up any plugin's state
	//Its invocation has the following signature: Function<String, CodeGenerationContext, String> where the last value is the optional return one.
	codeGenerator.afterAttributeCodeGeneration = new HookContainer();

	//@property {HookContainer} beforeTagCodeGeneration Static plugin property invoked at the beginning of the entire code generation process
	//Aim: Access/Edit the entire string template and initalize any plugin state
	//Its invocation has the following signature: Function<String, CodeGenerationContext, String> where the last value is the optional return one.
	codeGenerator.beforeTagCodeGeneration = new HookContainer();
	//@property {HookContainer} afterTagCodeGeneration Static plugin property invoked at the end of the entire code generation process
	//Aim: Access/Edit the entire code generation process result
	//Its invocation has the following signature: Function<CodeGenerationResult, CodeGenerationContext, CodeGenerationResult> where the last value is the optional return one.
	codeGenerator.afterTagCodeGeneration = new HookContainer();

	//@property {HookContainer} afterTagEachContextCreation Static plugin property invoked after handlebars 'EACH' tags context is created
	//Aim: Access the current AST node
	//Its invocation has the following signature: Function<NodeASTNode, CodeGenerationContext, NodeASTNode> where the last value is the optional return one. It is not recommend to return anything in this plugin.
	codeGenerator.afterTagEachContextCreation = new HookContainer();
	//@property {HookContainer} afterTagEachContextCreation Static plugin property invoked before handlebars 'EACH' tags context is created
	//Aim: Augment the EACH context
	//Its invocation has the following signature: Function<HandlebarsEACHContext, CodeGenerationContext, HandlebarsEACHContext> where the last value is the optional return one.
	codeGenerator.beforeTagEachContextCreation = new HookContainer();

	return codeGenerator;
})();