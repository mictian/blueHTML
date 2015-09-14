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

describe('Simple Handlebars Attributes', function ()
{
	describe ('blocks statements', function ()
	{
		describe('if block', function ()
		{
			it('Should recognize a simple Handlebars if block', function ()
			{
				var result = parser.parse('<div {{#if condition}} {{/if}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; if (ctx.condition) {}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body', function ()
			{
				var result = parser.parse('<div {{#if condition}} checked {{/if}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; if (ctx.condition) {obj["checked"]="";}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else', function ()
			{
				var result = parser.parse('<div {{#if condition}} checked {{else}} {{/if}} ></div>')
				,	expeted = h("div",(function (){var obj = {}; if (ctx.condition) {obj["checked"]="";}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with only else', function ()
			{
				var result = parser.parse('<span {{#if condition}}  {{else}} \'selected\' {{/if}}></span>')
				,	expeted = h("span",(function (){var obj = {}; if (ctx.condition) {} else {obj["selected"]="";}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else body', function ()
			{
				var result = parser.parse('<article {{#if condition}} data="red" {{else}} blue {{/if}}> </article>')
				,	expeted = h("article",(function (){var obj = {}; if (ctx.condition) {obj["data"]="";obj["data"]+="red";} else {obj["blue"]="";}
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else body (key values both)', function ()
			{
				var result = parser.parse('<article {{#if condition}} class="highlight" {{else}} name="Mictian" {{/if}}> </article>')
				,	expeted = h("article",(function (){var obj = {}; if (ctx.condition) {obj["class"]="";obj["class"]+="highlight";
								} else {obj["name"]="";obj["name"]+="Mictian";}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else body (two elements)', function ()
			{
				var result = parser.parse('<input {{#if condition}} selected {{else}} class="red" name="block" {{/if}} />')
				,	expeted = h("input",(function (){var obj = {}; if (ctx.condition) {obj["selected"]="";} else {
								obj["class"]="";obj["class"]+="red";obj["name"]="";obj["name"]+="block";}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body (two elements) and else body (one node)', function ()
			{
				var result = parser.parse('<div {{#if condition}} class="red" name="block" {{else}} uncehcked {{/if}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; if (ctx.condition) {obj["class"]="";obj["class"]+="red";obj["name"]="";obj["name"]+="block";}
								else {obj["uncehcked"]="";}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body (with two elements)', function ()
			{
				var result = parser.parse('<input {{#if condition}} type="text" class="brown"  {{/if}} >')
				,	expeted = h("input",(function (){var obj = {}; if (ctx.condition) {obj["type"]="";obj["type"]+="text";obj["class"]="";obj["class"]+="brown";}
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});
		});

		describe('each block', function ()
		{
			it('Should recognize a simple Handlebars each block', function ()
			{
				var result = parser.parse('<div {{#each iterator}} {{/each}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; _.each( ctx.iterator, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index};});
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body', function ()
			{
				var result = parser.parse('<div {{#each iterator}} checked {{/each}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; _.each( ctx.iterator, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index};obj["checked"]="";});
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else', function ()
			{
				var result = parser.parse('<div {{#each iterator}} checked {{else}} {{/each}} ></div>')
				,	expeted = h("div",(function (){var obj = {}; _.each( ctx.iterator, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index};
									obj["checked"]="";});return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with only else', function ()
			{
				var result = parser.parse('<span {{#each iterator}}  {{else}} \'selected\' {{/each}}></span>')
				,	expeted = h("span",(function (){var obj = {}; _.each( ctx.iterator, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index};});
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else body', function ()
			{
				var result = parser.parse('<article {{#each iteration}} data="red" {{else}} blue {{/each}}> </article>')
				,	expeted = h("article",(function (){var obj = {}; _.each( ctx.iteration, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iteration.length - 1),index:eachIterator1Index};
									obj["data"]="";obj["data"]+="red";});return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else body (key values both)', function ()
			{
				var result = parser.parse('<article {{#each iterator}} class="highlight" {{else}} name="Mictian" {{/each}}> </article>')
				,	expeted = h("article",(function (){var obj = {}; _.each( ctx.iteration, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iteration.length - 1),index:eachIterator1Index};
									obj["data"]="";obj["data"]+="red";});return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else body (two elements)', function ()
			{
				var result = parser.parse('<input {{#each array}} selected {{else}} class="red" name="block" {{/each}} />')
				,	expeted = h("input",(function (){var obj = {}; _.each( ctx.array, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.array.length - 1),index:eachIterator1Index};
									obj["selected"]="";});return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body (two elements) and else body (one node)', function ()
			{
				var result = parser.parse('<div {{#each people}} class="red" name="block" {{else}} uncehcked {{/each}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; _.each( ctx.people, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.people.length - 1),index:eachIterator1Index};
									obj["class"]="";obj["class"]+="red";obj["name"]="";obj["name"]+="block";});return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body (with two elements)', function ()
			{
				var result = parser.parse('<input {{#each condition}} type="text" class="brown"  {{/each}} >')
				,	expeted = h("input",(function (){var obj = {}; _.each( ctx.condition, function (eachIterator1,eachIterator1Index) {
								var contextName2= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.condition.length - 1),index:eachIterator1Index};
									obj["type"]="";obj["type"]+="text";obj["class"]="";obj["class"]+="brown";});return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});
		});

		describe('unless block', function ()
		{
			it('Should recognize a simple Handlebars unless block', function ()
			{
				var result = parser.parse('<div {{#unless iterator}} {{/unless}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; if (!ctx.iterator) {} else {}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body', function ()
			{
				var result = parser.parse('<div {{#unless iterator}} checked {{/unless}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; if (!ctx.iterator) {obj["checked"]="";} else {}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else', function ()
			{
				var result = parser.parse('<div {{#unless iterator}} checked {{else}} {{/unless}} ></div>')
				,	expeted = h("div",(function (){var obj = {}; if (!ctx.iterator) {obj["checked"]="";} else {}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with only else', function ()
			{
				var result = parser.parse('<span {{#unless iterator}}  {{else}} \'selected\' {{/unless}}></span>')
				,	expeted = h("span",(function (){var obj = {}; if (!ctx.iterator) {} else {obj["selected"]="";}return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else body', function ()
			{
				var result = parser.parse('<article {{#unless iteration}} data="red" {{else}} blue {{/unless}}> </article>')
				,	expeted = h("article",(function (){var obj = {}; if (!ctx.iteration) {obj["data"]="";obj["data"]+="red";} else {obj["blue"]="";}
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else body (key values both)', function ()
			{
				var result = parser.parse('<article {{#unless iterator}} class="highlight" {{else}} name="Mictian" {{/unless}}> </article>')
				,	expeted = h("article",(function (){var obj = {}; if (!ctx.iterator) {obj["class"]="";obj["class"]+="highlight";} else {obj["name"]="";obj["name"]+="Mictian";}
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else body (two elements)', function ()
			{
				var result = parser.parse('<input {{#unless array}} selected {{else}} class="red" name="block" {{/unless}} />')
				,	expeted = h("input",(function (){var obj = {}; if (!ctx.array) {obj["selected"]="";} else {obj["class"]="";obj["class"]+="red";obj["name"]="";obj["name"]+="block";}
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body (two elements) and else body (one node)', function ()
			{
				var result = parser.parse('<div {{#unless people}} class="red" name="block" {{else}} uncehcked {{/unless}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; if (!ctx.people) {obj["class"]="";obj["class"]+="red";obj["name"]="";obj["name"]+="block";} else {obj["uncehcked"]="";}
								return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body (with two elements)', function ()
			{
				var result = parser.parse('<input {{#unless condition}} type="text" class="brown"  {{/unless}} >')
				,	expeted = h("input",(function (){var obj = {}; if (!ctx.condition) {obj["type"]="";obj["type"]+="text";obj["class"]="";obj["class"]+="brown";} else {}
						return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});
		});

		xdescribe('generic block', function ()
		{
			it('Should recognize a simple generic Handlebars block', function ()
			{
				var result = parser.parse('<div {{#generic}} {{/generic}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body', function ()
			{
				var result = parser.parse('<input {{#generic }} type="date" {{/generic}} />')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and (two elements)', function ()
			{
				var result = parser.parse('<input {{#generic }} class="error" type="blue" {{/generic}} >')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a simple parameter', function ()
			{
				var result = parser.parse('<article {{#generic param1}} disabled {{/generic}}></article>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and simple parameters', function ()
			{
				var result = parser.parse('<span {{#generic param1 param2}} enable {{/generic}}></span>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a string parameter', function ()
			{
				var result = parser.parse('<div {{#generic "param1" }} type=\'HTML\' {{/generic}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a number parameter', function ()
			{
				var result = parser.parse('<div {{#generic 1 }} type="blueHTML"  {{/generic}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a reference parameter', function ()
			{
				var result = parser.parse('<div {{#generic @index }} data-type="tranformer" {{/generic}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a lookup parameter', function ()
			{
				var result = parser.parse('<code {{#generic ../../grandParent }} style=""  {{/generic}}></code>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and multi parameters', function ()
			{
				var result = parser.parse('<div {{#generic ../../grandParent 123 "string" simpleEval }} works  {{/generic}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});
		});
	});

	describe('single statements', function ()
	{
		describe('Safe evaluation', function ()
		{
			it('Should recognize a simple safe evaluation', function ()
			{
				var result = parse('<div {{evaluateMe}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; obj[""+_.escape(ctx.evaluateMe)]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple safe evaluation with dots', function ()
			{
				ctx.evaluate = {Me: {}};
				var result = parse('<input {{evaluate.Me.again}} />')
				,	expeted = h("input",(function (){var obj = {}; obj[""+_.escape(ctx.evaluate.Me.again)]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			afterEach(function ()
			{
				ctx = {};
			});
		});

		describe('Safe reference evaluation', function ()
		{
			it('Should throw an error on a simple reference evaluation without a valid context', function ()
			{
				expect(function () {return parse('<input data-index="{{@index}}">')}).toThrowError('Invalid safe reference evaluation.');
			});

			it('Should throw an error on a simple reference evaluation with dots without a valid context', function ()
			{
				expect(function () {return parse('<div data-value=\'{{@evaluate.Me.again}}\'></div>')}).toThrowError('Invalid safe reference evaluation.');
			});

			it('Should recognize a simple reference evaluation with dots', function ()
			{
				var result = parse('<div> {{#each collection}} <input value="{{ @index  }}"/> {{/each}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								children=children.concat(_.reduce( ctx.collection, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
									var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.collection.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
									eachAccumulator2=eachAccumulator2.concat((function () {
										var children=[];children=children.concat([h("input",(function (){var obj = {}; obj["value"]="";
											obj["value"]+= _.escape(contextName3.index);return {attributes: obj};})(),[])]);
										return children; })());
									return eachAccumulator2}, []));
								return children; })());

				expect(result).toEqual(expeted);
			});
		});

		describe('Unsafe evaluation', function ()
		{
			it('Should recognize a simple unsafe evaluation', function ()
			{
				var result = parse('<div {{{evaluateMe}}}> </div>')
				,	expeted = h("div",(function (){var obj = {}; obj[""+ctx.evaluateMe]="";return {attributes: obj};})(),[])

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple unsafe evaluation with dots', function ()
			{
				ctx.evaluate = {Me: {}};
				var result = parse('<input {{{evaluate.Me.again}}}/>')
				,	expeted = h("input",(function (){var obj = {}; obj[""+ctx.evaluate.Me.again]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			afterEach(function ()
			{
				ctx = {};
			});
		});

		describe('Unsafe reference evaluation', function ()
		{
			it('Should throw an error on a simple reference evaluation without a valid context', function ()
			{
				expect(function () {return parse('<input data-index="{{{@index}}}">')}).toThrowError('Invalid unsafe reference evaluation.');
			});

			it('Should throw an error on a simple reference evaluation with dots without a valid context', function ()
			{
				expect(function () {return parse('<div data-value=\'{{{@evaluate.Me.again}}}\'></div>')}).toThrowError('Invalid unsafe reference evaluation.');
			});

			it('Should recognize a simple reference evaluation with dots as attribute value', function ()
			{
				var result = parse('<div> {{#each collection}} <input value="{{{ @index  }}}"/> {{/each}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								children=children.concat(_.reduce( ctx.collection, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
									var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.collection.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
									eachAccumulator2=eachAccumulator2.concat((function () {
										var children=[];children=children.concat([h("input",(function (){var obj = {}; obj["value"]="";
											obj["value"]+= contextName3.index;return {attributes: obj};})(),[])]);
										return children; })());
									return eachAccumulator2}, []));
								return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple reference evaluation with dots as attribute name', function ()
			{
				var result = parse('<div> {{#each collection}} <input {{ @index  }}/> {{/each}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								children=children.concat(_.reduce( ctx.collection, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
									var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.collection.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
									eachAccumulator2=eachAccumulator2.concat((function () {
										var children=[];children=children.concat([h("input",(function (){var obj = {};
											obj[ _.escape(contextName3.index)]="";
											return {attributes: obj};})(),[])]);
										return children; })());
									return eachAccumulator2}, []));return children; })());

				expect(result).toEqual(expeted);
			});
		});

		describe('Look expression', function ()
		{
			it('Should recognize a simple look up expression', function ()
			{
				var result = parse('<article{{../parent}} ></article>')
				,	expeted = h("article",(function (){var obj = {}; obj[_.escape(ctx.parent)]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a look up expression of many levels', function ()
			{
				var result = parse('<span {{../../../parent}}></span>')
				,	expeted = h("span",(function (){var obj = {}; obj[_.escape(ctx.parent)]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});
		});

		xdescribe('Comments', function ()
		{
			it('Should recognize a simple handlebars comment', function ()
			{
				var result = parse('<div {{!-- Simple Comments 01 --}} ></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a handlebars comment with enters and spaces', function ()
			{
				var result = parse('<input {{!-- Simple \n \t Comments    --}}>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});
		});

		describe('Safe Generic expressions', function ()
		{
			it('Should recognize a simple generic Handlebars statement with a simple parameter', function ()
			{
				var result = parse('<div {{generic param1 }}></div>')
				,	expeted = h("div",(function (){var obj = {}; obj[(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.param1);})()]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with two simple parameters', function ()
			{
				var result = parse('<input {{generic param1 param2 }}/>')
				,	expeted = h("input",(function (){var obj = {}; obj[(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.param1,ctx.param2);})()]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a string parameter', function ()
			{
				var result = parse('<article{{generic "param1"  }}> </article>')
				,	expeted = h("article",(function (){var obj = {}; obj[(function(){var fn = function (){return 'OK!';};
								return fn.call(this,"param1");})()]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a number parameter', function ()
			{
				var result = parse('<div {{generic 1 }}></div>')
				,	expeted = h("div",(function (){var obj = {}; obj[(function(){var fn = function (){return 'OK!';};
								return fn.call(this,1);})()]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a lookup parameter', function ()
			{
				var result = parse('<div {{generic ../../grandParent }}></div>')
				,	expeted = h("div",(function (){var obj = {}; obj[(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.grandParent);})()]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with multi parameters', function ()
			{
				var result = parse('<div {{generic ../../grandParent 123 "string" simpleEval }}></div>')
				,	expeted = h("div",(function (){var obj = {}; obj[(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.grandParent,123,"string",ctx.simpleEval);})()]="";return {attributes: obj};})(),[]);

				expect(result).toEqual(expeted);
			});
		});

		xdescribe('UnSafe Generic expressions', function ()
		{
			it('Should recognize a simple generic Handlebars statement with a simple parameter', function ()
			{
				var result = parse('<div {{{generic param1 }}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with two simple parameters', function ()
			{
				var result = parse('<input {{{generic param1 param2 }}}/>')
				,	expeted = 'wrong';
				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a string parameter', function ()
			{
				var result = parse('<article{{{generic "param1"  }}}> </article>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a number parameter', function ()
			{
				var result = parse('<div {{{generic 1 }}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a reference parameter', function ()
			{
				var result = parse('<input {{{generic @index }}}>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a lookup parameter', function ()
			{
				var result = parse('<div {{{generic ../../grandParent }}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with multi parameters', function ()
			{
				var result = parse('<div {{{generic ../../grandParent 123 "string" simpleEval }}}></div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});
		});
	});
});