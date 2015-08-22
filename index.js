//@module blueHTML
var codeGenerator = require('./lib/codeGenerator')
,	_ = require('underscore')
,	compositeViewPlugin = require('./defaultPlugins/compositionViews');

var local_parser = new codeGenerator();

//@class blueHTML
module.exports = {
	//@property {CodeGenerator} codeGenerator
	codeGenerator: codeGenerator

	//@method generateVirtualDOM Shortcut method to easily start converting handlebars to virtual-dom
	//@param {String} string_html Handlebar HTML template
	//@param {VirtualDOMGenerationOptions} options List of option to configure the parsing process
	//@return {String} Final virtual-dom string code already wrapped in a fuctions
,	generateVirtualDOM: function (string_html, options)
	{
		'use strict';

		options = _.defaults(options || {}, {
			notGenerateContext: false
		});

		var result = local_parser.parse(string_html, options)
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
			return result.value;
		}

		deps = result.contextName + (result.externalDependencies.length > 0 ? ',' +result.externalDependenciesObjectName : '' );

		return 'function ('+deps+') { return ' + result.value + ';}';
	}
	//@property {Object} defaultPlugins Each proprety of this object is of type Plugin
,	defaultPlugins: {
		'compositeViews': compositeViewPlugin
	}
	//@method addCustomHandler Method used to define a new custom Handlebars Helper
	//@param {ExtenderCodeGeneratorObject} handlebars_custom_handlers
	//@return {Void}
,	addCustomHandler: local_parser.addCustomHandler
	//@method installPlugin Install a plugin inside the code generator
	//@param {Plugin} plugin_container
	//@return {Void}
,	installPlugin: local_parser.installPlugin
};


// @class ExtenderCodeGeneratorObject Object used to extend any of the code generators.
//  In this object each property must be a function. Two kind of functions are supported:
// *   **Extension Functions**: These are functions that will take the parameters from the Code generator and output a string code.
//         This can be seen as a point to extend the code generator it self.
//         This functions are distinguish by the property name they are atteched to. In this case the name MUST start with the word 'single' and MUST NOT be 'singleInstance'
//         Sample:
//     ```javascript
//     var blueHTML = require('blueHTML');
//     blueHTML.addCustomHandler({
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
//     blueHTML.addCustomHandler({
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
// 2.  The examples here applies to both Attributes and Tags







