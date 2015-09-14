var parser = require('../index')
,	h = require('virtual-dom/h')
,	_ = require('underscore')
,	deafult_parsing_options = {
		notGenerateContext: true
	}
	//GLOBAL CONTEXT!
,	ctx = {};

parser.parse = function (template_str, return_string, options)
{
	var vd_str = parser.generateVirtualDOM(template_str, _.extend({}, deafult_parsing_options, options));

	return return_string ? vd_str : eval(vd_str);
}

describe('Simple HTLM', function ()
{
	describe('block tags', function ()
	{
		it('Should recognize simple block elements (div)', function ()
		{
			var result = parser.parse('<div></div>')
			,	expeted = h("div",{},[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize simples block elements (div) together', function ()
		{
			//IMPORTANT: Notice that here the comparison is made using string as the evaluation will only take into account the first
			//div. For this reason is that more than one root tag is discouraged
			var result = parser.parse('<div></div><div></div>', true, {allowMultiplesFathers: true})
			,	expeted = 'h("div",{},[]),h("div",{},[])';

			expect(result).toEqual(expeted);
		});

		it('Should recognize simple block elements (span)', function ()
		{
			var result = parser.parse('<span></span>')
			,	expeted = h("span",{},[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize nested simple block elements', function ()
		{
			var result = parser.parse('<div><div></div></div>')
			,	expeted = h("div",{},(function () {children= [];children=children.concat([h("div",{},[])]);return children; })());

			expect(result).toEqual(expeted);
		});

		it('Should recognize nested simple block elements, divs and block inputs', function ()
		{
			var result = parser.parse('<div><input></input></div>')
			,	expeted = h("div",{},(function () {children= [];children=children.concat([h("input",{},[])]);return children; })());

			expect(result).toEqual(expeted);
		});

		it('Should recognize nested simple block elements omitting spaces', function ()
		{
			var result = parser.parse('<div>   \n  <div>\n</div>    </div>')
			,	expeted = h("div",{},(function () {children= [];children=children.concat([h("div",{},[])]);return children; })());

			expect(result).toEqual(expeted);
		});
	});

	describe('single tags', function ()
	{
		it('Should recognize simple single elements (input)', function ()
		{
			var result = parser.parse('<input/>')
			,	expeted = h("input",{},[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize simple single elements (hr)', function ()
		{
			var result = parser.parse('<hr/>')
			,	expeted = h("hr",{},[]);

			expect(result).toEqual(expeted);
		});

		it('Should recognize a simple single elements (hr) in-line with a block element', function ()
		{
			var result = parser.parse('<hr/><input></input>', true, {allowMultiplesFathers: true})
			,	expeted = 'h("hr",{},[]),h("input",{},[])';

			expect(result).toEqual(expeted);
		});

		it('Should recognize simple text', function ()
		{
			var result = parser.parse('This is a text tag')
			,	expeted = "This is a text tag";

			expect(result).toEqual(expeted);
		});

		it('Should recognize simple text nested in block tags', function ()
		{
			var result = parser.parse('<div>This is a text tag</div>')
			,	expeted = h("div",{},(function () {children= [];children=children.concat(["This is a text tag"]);return children; })());

			expect(result).toEqual(expeted);
		});

		it('Should recognize simple text nested in block tags with a single tag in-line', function ()
		{
			var result = parser.parse('<div>This is a text tag<hr/></div>')
			,	expeted = h("div",{},(function () {children= [];children=children.concat(["This is a text tag"]);children=children.concat([h("hr",{},[])]);return children; })());

			expect(result).toEqual(expeted);
		});


		xdescribe ('HTML comments', function ()
		{
			it('Should recognize html comments', function ()
			{
				var result = parser.parse('<!-- This is a comment -->')
				,	expeted = [{"type":"htmlComment","value":" This is a comment "}];

				expect(result).toEqual(expeted);
			});

			it('Should recognize two html comments', function ()
			{
				var result = parser.parse('<!-- This is a comment --><!-- This is a comment also -->')
				,	expeted = [	{"type":"htmlComment","value":" This is a comment "},
								{"type":"htmlComment","value":" This is a comment also "}];

				expect(result).toEqual(expeted);
			});

			it('Should recognize nested html comments in block tags', function ()
			{
				var result = parser.parse('<span> <!-- This is a comment --> </span>')
				,	expeted = [{"type":"htmlBlockNode","openTag":"span","closeTag":"span","attributes":[],"children":[{"type":"htmlComment","value":" This is a comment "}]}];

				expect(result).toEqual(expeted);
			});
		});
	});
});