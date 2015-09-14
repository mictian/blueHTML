var parser = require('../index')
,	h = require('virtual-dom/h')
,	_ = require('underscore')
,	deafult_parsing_options = {
		notGenerateContext: true
	}
	//GLOBAL CONTEXT!
,	ctx = {};

function parse (template_str, return_string, options)
{
	var vd_str = parser.generateVirtualDOM(template_str, _.extend({}, deafult_parsing_options, options));

	return return_string ? vd_str : eval(vd_str);
}

xdescribe('Combination Handlebars & HTML', function ()
{
	xit ('Should recognize a simple address template', function ()
	{
		var result = parser.parse(
				'<span class="address-container-line"> \
					<p class="address-container-city" name="city"> \
						{{city}} \
					</p> \
					{{#if showState}} \
						<p class="address-container-state" name="state"> \
							{{state}} \
						</p> \
					{{/if}} \
					<p class="address-container-zip" name="zip"> \
						{{zip}} \
					</p> \
				</span>')
		,	expeted = 12;

		expect(result).toEqual(expeted);
	});

	xdescribe('Reference Values', function ()
	{
		describe('Inside an invalid context', function ()
		{
			xit('Should fails setting a reference values as an attribute', function ()
			{
				var result = parse('<div {{@first}}="controller"></div>')
				,	expeted = h("div",(function (){var obj = {}; obj["data-type"]="";obj["data-type"]+="controller";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});
		});

		describe('Inside a Valid context', function ()
		{
			it('Should create a property which name is the the refence values when used in attributes definitions', function ()
			{
				var result = parse('{{#each list}} <div {{@first}}="controller"></div> {{/each}}', true)
				 ,	expeted = 12// h("div",(function (){var obj = {}; obj["data-type"]="";obj["data-type"]+="controller";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});
		});

	});

	//REFENCE VALUES
	//Inside an invalid context (without context at all)
		//Safe evaluation as a single statement
		//Safe evaluation as a single statement in an attribute
		//Safe evaluation in a generic block as parameter
		//UnSafe evaluation as a single statement
		//UnSafe evaluation as a single statement in an attribute
		//UnSafe evaluation in a generic single as parameter
	//Inside a valid context
		//Safe evaluation as a single statement
		//Safe evaluation as a single statement in an attribute
		//Safe evaluation in a generic block as parameter
		//UnSafe evaluation as a single statement
		//UnSafe evaluation as a single statement in an attribute
		//UnSafe evaluation in a generic single as parameter
	//Inside multiples valid contexts
		//Safe evaluation as a single statement
		//Safe evaluation as a single statement in an attribute
		//Safe evaluation in a generic block as parameter
		//UnSafe evaluation as a single statement
		//UnSafe evaluation as a single statement in an attribute
		//UnSafe evaluation in a generic single as parameter

	//GENERICS
	//For Nodes
		//SAFE GENERIC BLOCKS
		//UNSAFE GENERIC BLOCKS
		//SAFE GENERIC SINGLE (Already tested!)
		//UNSAFE GENERIC SINGLE
	//For Attributes
		//SAFE GENERIC BLOCKS
		//UNSAFE GENERIC BLOCKS
		//SAFE GENERIC SINGLE (Already tested!)
		//UNSAFE GENERIC SINGLE

	//HTML COMMENTS
	//HANDLEBARS COMMENTS


	it('Should recognize reference values as a block statement inside an each block', function ()
	{
		expect(12).toBe('FAIL');
	});

	it('Should recognize reference values as properties in a generic BLOCK node inside an each block', function ()
	{
		expect(12).toBe('FAIL');
	});

	it('Should recognize reference values as properties in a generic SINGLE node inside an each block', function ()
	{
		expect(12).toBe('FAIL');
	});

	it('Should recognize lookup values inside an each block', function ()
	{
		//The idea here is test with multiples nested each block and at diff levels with crossed reference values @value
		expect(12).toBe('FAIL');
	});
});