//@module blueHTML
'use strict';

var attrsCodeGenerator = require('./lib/attributesCodeGenerator')
,	nodesCodeGenerator = require('./lib/nodesCodeGenerator')
,	_ = require('underscore');

//@class Index
module.exports = {
	//@property {NodesCodeGenerator} Parser Although this is a code generator from the client of this api point of view, the name parser is ok.
	Parser: nodesCodeGenerator
	//@property {AttributesCodeGenerator} AttributesParser Although this is a code generator from the client of this api point of view, the name parser is ok.
,	AttributesParser: attrsCodeGenerator
	//@method getNewParser Creates a new instance of the code generatos by setting all require information.
	//@return {NodesCodeGenerator} A new instance of the code generator
,	getNewParser: function ()
	{
		return new nodesCodeGenerator({attributesParser: attrsCodeGenerator});
	}
	//@method generateVirtualDOM Shortcut method to easily start converting handlebars to virtual-dom
	//@param {String} string_html Handlebar HTML template
	//@param {VirtualDOMGenerationOptions} options List of option to configure the parsing process
	//@return {String} Final virtual-dom string code already wrapped in a fuctions
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
	//@method addAttributesHandlers Method used to define a new custom Handlebars Helper used by the Attributes code generator
	//@param {ExtenderCodeGeneratorObject} handlebars_attributes_handlers
	//@return {Void}
,	addAttributesHandlers: function (handlebars_attributes_handlers)
	{
		_.extend(attrsCodeGenerator.prototype, handlebars_attributes_handlers || {});
	}
	//@method addNodesHandlers Method used to define a new custom Handlebars Helper used by the Nodes code generator
	//@param {ExtenderCodeGeneratorObject} handlebars_nodes_handlers
	//@return {Void}
,	addNodesHandlers: function (handlebars_nodes_handlers)
	{
		_.extend(nodesCodeGenerator.prototype, handlebars_nodes_handlers || {});
	}
};

//@class VirtualDOMGenerationOptions @extend NodesCodeGeneratorInitializer
//@prpoerty {Boolean} notGenerateContext Indicate if the final function wrapper must be generator or not. Default value: false (Wrapper function IS generated)


// @class ExtenderCodeGeneratorObject Object used to extend any of the code generators, Attributes code generator or Node code generator.
//  In this object each property must be a function. Two kind of functions are supported:
// *   **Extension Functions**: These are functions that will take the parameters from the Code generator and output a string code.
//         This can be seen as a point to extend the code generator it self.
//         This functions are distinguish by the property name they are atteched to. In this case the name MUST start with the word 'single' and MUST NOT be 'singleInstance'
//         Sample:
//     ```javascript
//     var blueHTML = require('blueHTML');
//     blueHTML.addNodesHandlers({
//         'singleTranslate': function (parsing_context, is_inside_context)
//         {
//             return 'h("div",[])';
//         }
//     });
//     ```
//     In this sample, that function will be called each time that in the HTML code appears something like:

//     ```html
//     <span>{{Translate 'some options'}}</span>
//     ```

//     Each function MUST fulfill the following signature:
//     **Function<NodesParsingContext,Boolean,Boolean>** where the output is string and the rest are the input parameter types.

//     For the previous codes, the output will be:
//     ```javascript
//     function render(ctx)
//     {
//         return h('span', {}, [h('div',[])]);
//     }
//     ```

// *   **Helper Functions:** The second options are functions defined in almost the same way you define custom helpers in Handlebars. These functions are distinguish by the property name they are atteched to. In this case the name MUST start with the word 'singleInstance'

//     Sample:
//     ```javascript
//     var blueHTML = require('blueHTML');
//     blueHTML.addNodesHandlers({
//         'singleInstanceTranslate': function (string_key_to_translate)
//         {
//             return 'key not found :(';
//         }
//     });
//     ```
//     In this sample, that function will be called each time that in the HTML code appears something like:

//     ```html
//     <span>{{Translate 'some options'}}</span>
//     ```

//     The big difference with previous functions is the signature. While extension function must have a rigid signature that will be called by the code generator, helper functions can have any signature. In the same way you did with Handlebars.

// **Important Note:**
// 1.   As you can guess, this functions are prefixed with the word *single* as their aim is to handle single helpers. In order word, by the time being **generic block are not supported!!**
// 2.  The examples here shows how to extend the Node generator, but exactly the same restriction and options apply for the Attribute code generator.







