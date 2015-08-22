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

describe('Simple HTML Attributes', function ()
{
	describe('key value nodes', function ()
	{
		it('Should recognize key-value with one value using double quotes', function ()
		{
			var result = parse('<div data-type="controller"></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["data-type"]="";obj["data-type"]+="controller";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize key-value with none value using double quotes', function ()
		{
			var result = parse('<div data-type=""></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["data-type"]="";obj["data-type"]+="";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize key-value with two value using double quotes', function ()
		{
			var result = parse('<div class="blue red"></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["class"]="";obj["class"]+="blue";obj["class"]+=" ";obj["class"]+="red";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize key-value with one value using single quotes', function ()
		{
			var result = parse('<div data-type=\'controller\'></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["data-type"]="";obj["data-type"]+="controller";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize key-value with none value using single quotes', function ()
		{
			var result = parse('<div data-type=\'\'></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["data-type"]="";obj["data-type"]+="";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize key-value with two value using single quotes', function ()
		{
			var result = parse('<div class=\'blue red\'></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["class"]="";obj["class"]+="blue";obj["class"]+=" ";obj["class"]+="red";
							return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});
	});

	describe('single keys nodes', function ()
	{
		it('Should recognize single key', function ()
		{
			var result = parse('<div checked ></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["checked"]="";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize two single keys', function ()
		{
			var result = parse('<div checked disabled ></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["checked"]="";obj["disabled"]="";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize two single keys (one with single quotes)', function ()
		{
			var result = parse('<div checked \'disabled\' ></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["checked"]="";obj["disabled"]="";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize two single keys (one with double quotes)', function ()
		{
			var result = parse('<div checked "disabled" ></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["checked"]="";obj["disabled"]="";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize two single keys (one with double quotes and the other with single quotes)', function ()
		{
			var result = parse('<div \'checked\' "disabled" ></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["checked"]="";obj["disabled"]="";return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize single keys nodes mixed', function ()
		{
			var result = parse('<div \'checked\' ok-value testing "disabled" ></div>')
			,	expeted = h("div",(function (){var obj = {}; obj["checked"]="";obj["ok-value"]="";obj["testing"]="";obj["disabled"]="";
				return {attributes: obj};})(),[]);

			expect(result).toEqual(expeted);
		});
	});
});