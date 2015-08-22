var parser = require('../index');

xdescribe('Combination Handlebars & HTML', function ()
{
	it ('Should recognize a simple address template', function ()
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