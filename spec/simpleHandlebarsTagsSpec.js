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

parser.addCustomHandler({
	singleInstancegeneric: function(){return 'OK!';}
});

describe('Handlebars nodes', function ()
{
	describe ('blocks statements', function ()
	{
		describe('if block', function ()
		{
			it('Should recognize a simple Handlebars if block', function ()
			{
				var result = parse('<div> {{#if condition}} {{/if}} </div>')
				,	expeted = h("div",{},(function () {var children=[];if (ctx.condition) {children=children.concat([]);}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body', function ()
			{
				var result = parse('<div> {{#if condition}} <div></div> {{/if}} </div>')
				,	expeted = h("div",{},(function () {var children=[];if (ctx.condition) {children=children.concat([]);}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else', function ()
			{
				var result = parse('<div> {{#if condition}} <div></div> {{else}} {{/if}} </div>')
				,	expeted = h("div",{},(function () {var children=[];
						if (ctx.condition) {children=children.concat((function () {var children=[];children=children.concat([h("div",{},[])]);return children; })());}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with only else', function ()
			{
				var result = parse('<div>{{#if condition}}  {{else}} <address></address> {{/if}} </div>')
				,	expeted = h("div",{},(function () {var children=[];if (ctx.condition) {children=children.concat([]);} else {
						children=children.concat((function () {var children=[];children=children.concat([h("address",{},[])]);return children; })());}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else body', function ()
			{
				var result = parse('<span>{{#if condition}} <div></div> {{else}} <div></div> {{/if}}</span>')
				,	expeted = h("span",{},(function () {var children=[];
						if (ctx.condition) {children=children.concat((function () {var children=[];children=children.concat([h("div",{},[])]);return children; })());
						} else {children=children.concat((function () {var children=[];children=children.concat([h("div",{},[])]);return children; })());}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else body (single node)', function ()
			{
				var result = parse('<article>{{#if condition}} <div></div> {{else}} <input/> {{/if}}</article>')
				,	expeted = h("article",{},(function () {var children=[];
						if (ctx.condition) {children=children.concat((function () {var children=[];children=children.concat([h("div",{},[])]);return children; })());
						} else {children=children.concat((function () {var children=[];children=children.concat([h("input",{},[])]);return children; })());}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body and else body (two elements)', function ()
			{
				var result = parse('<div>{{#if condition}} <div></div> {{else}} <input/><div></div> {{/if}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								if (ctx.condition) {children=children.concat((function () {var children=[];children=children.concat([h("div",{},[])]);return children; })());
								} else {children=children.concat((function () {var children=[];
									children=children.concat([h("input",{},[])]);
									children=children.concat([h("div",{},[])]);
									return children; })());}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body (two elements) and else body (single node)', function ()
			{
				var result = parse('<div>{{#if condition}} <div></div><hr/> {{else}} <input/> {{/if}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								if (ctx.condition) {children=children.concat((function () {
									var children=[];children=children.concat([h("div",{},[])]);
									children=children.concat([h("hr",{},[])]);return children; })());
								} else {children=children.concat((function () {
									var children=[];children=children.concat([h("input",{},[])]);
									return children; })());}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars if block with body (with two elements)', function ()
			{
				var result = parse('<address>{{#if iterator}} <address   > </address> <span></span>	 {{/if}}</address>')
				,	expeted = h("address",{},(function () {var children=[];
								if (ctx.iterator) {children=children.concat((function () {var children=[];children=children.concat([h("address",{},[])]);
										children=children.concat([h("span",{},[])]);return children; })());}
								return children; })());

				expect(result).toEqual(expeted);
			});
		});

		describe('each block', function ()
		{
			it('Should recognize a simple Handlebars each block', function ()
			{
				var result = parse('<article>{{#each iterator}} {{/each}}</article>')
				,	expeted = h("article",{},(function () {var children=[];
						children=children.concat(_.reduce( ctx.iterator, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
							var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
							eachAccumulator2=eachAccumulator2.concat([]);return eachAccumulator2}, []));return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body', function ()
			{
				var result = parse('<div>{{#each iterator}} <address></address> {{/each}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								children=children.concat(_.reduce( ctx.iterator, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
									var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
									eachAccumulator2=eachAccumulator2.concat((function () {var children=[];children=children.concat([h("address",{},[])]);return children; })());
									return eachAccumulator2}, []));return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else', function ()
			{
				var result = parse('<span>{{#each iterator}} <address></address> {{else}} {{/each}}</span>')
				,	expeted = h("span",{},(function () {var children=[];
						children=children.concat(_.reduce( ctx.iterator, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
							var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
							eachAccumulator2=eachAccumulator2.concat((function () {var children=[];children=children.concat([h("address",{},[])]);
								return children; })());return eachAccumulator2}, []));return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with only else', function ()
			{
				var result = parse('<div>  {{#each condition}}  {{else}} <address></address> {{/each}} 	</div>')
				,	expeted = h("div",{},(function () {
								var children=[];children=children.concat(_.reduce( ctx.condition, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
									var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.condition.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
									eachAccumulator2=eachAccumulator2.concat([]);return eachAccumulator2}, []));return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else body', function ()
			{
				var result = parse('<div>{{#each iterator}} <address></address> {{else}} <div></div> {{/each}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
							children=children.concat(_.reduce( ctx.iterator, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
								var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
								eachAccumulator2=eachAccumulator2.concat((function () {var children=[];children=children.concat([h("address",{},[])]);return children; })());
								return eachAccumulator2}, []));
							return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else body (single node)', function ()
			{
				var result = parse('<div>{{#each iterator}} <address></address> {{else}} <hr/> {{/each}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat(_.reduce( ctx.iterator, function (eachAccumulator2,eachIterator1,eachIterator1Index) {
						var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
						eachAccumulator2=eachAccumulator2.concat((function () {var children=[];children=children.concat([h("address",{},[])]);return children; })());
						return eachAccumulator2}, []));return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body and else body (two node)', function ()
			{
				var result = parse('<div> {{#each iterator}} <address></address> {{else}} <hr/><span></span> {{/each}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat(_.reduce( ctx.iterator,
								function (eachAccumulator2,eachIterator1,eachIterator1Index) {
									var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
									eachAccumulator2=eachAccumulator2.concat((function () {
										var children=[];children=children.concat([h("address",{},[])]);return children; })());
									return eachAccumulator2}, []));
				return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body (two elements) and else body (single node)', function ()
			{
				var result = parse('<code>{{#each iterator}} <address></address><div></div> {{else}} <hr/> {{/each}}</code>')
				,	expeted = h("code",{},(function () {var children=[];children=children.concat(_.reduce( ctx.iterator,
								function (eachAccumulator2,eachIterator1,eachIterator1Index) {
									var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
									eachAccumulator2=eachAccumulator2.concat((function () {
										var children=[];children=children.concat([h("address",{},[])]);children=children.concat([h("div",{},[])]);
										return children; })());
									return eachAccumulator2}, []));
							return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars each block with body (with two elements)', function ()
			{
				var result = parse('<body>{{#each iterator}} <address   > </address> <span></span>	 {{/each}}</body>')
				,	expeted = h("body",{},(function () {var children=[];children=children.concat(_.reduce( ctx.iterator,
						function (eachAccumulator2,eachIterator1,eachIterator1Index) {
							var contextName3= {eachIterator1:eachIterator1,first:eachIterator1Index === 0,last:eachIterator1Index === (ctx.iterator.length - 1),index:eachIterator1Index,indexPlusOne:eachIterator1Index+1};
							eachAccumulator2=eachAccumulator2.concat((function () {
								var children=[];children=children.concat([h("address",{},[])]);children=children.concat([h("span",{},[])]);
								return children; })());return eachAccumulator2}, []));
						return children; })());

				expect(result).toEqual(expeted);
			});
		});

		describe('unless block', function ()
		{
			it('Should recognize a simple Handlebars unless block', function ()
			{
				var result = parse('<div>{{#unless condition}} {{/unless}}</div>')
				,	expeted = h("div",{},(function () {var children=[];if (!ctx.condition) {[]}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body', function ()
			{
				var result = parse('<div>{{#unless condition}} <address></address> {{/unless}}</div>')
				,	expeted = h("div",{},(function () {var children=[];if (!ctx.condition) {(function () {
							var children=[];children=children.concat([h("address",{},[])]);return children; })()}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else', function ()
			{
				var result = parse('<div>{{#unless condition}} <address></address> {{else}} {{/unless}}</div>')
				,	expeted = h("div",{},(function () {var children=[];if (!ctx.condition) {(function () {
								var children=[];children=children.concat([h("address",{},[])]);
								return children; })()}return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with only else', function ()
			{
				var result = parse('<article>{{#unless condition}}  {{else}} <address></address> {{/unless}}</article>')
				,	expeted = h("article",{},(function () {var children=[];if (!ctx.condition) {[]}
								else {(function () {var children=[];children=children.concat([h("address",{},[])]);return children; })()}
								return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else body', function ()
			{
				var result = parse('<code>{{#unless condition}} <address></address> {{else}} <div></div> {{/unless}}</code>')
				,	expeted = h("code",{},(function () {var children=[];
							if (!ctx.condition) { (function () {var children=[];children=children.concat([h("address",{},[])]);
								return children; })()}
							else {(function () {var children=[];children=children.concat([h("div",{},[])]);
								return children; })()}
							return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else body (single node)', function ()
			{
				var result = parse('<article>{{#unless condition}} <address></address> {{else}} <hr/> {{/unless}}</article>')
				,	expeted = h("article",{},(function () {var children=[];
								if (!ctx.condition) {(function () {var children=[];children=children.concat([h("address",{},[])]);return children; })()
								} else {(function () {var children=[];children=children.concat([h("hr",{},[])]);return children; })()}
								return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body and else body (two node)', function ()
			{
				var result = parse('<div> {{#unless condition}} <address></address> {{else}} <hr/><span></span> {{/unless}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								if (!ctx.condition) {(function () {var children=[];children=children.concat([h("address",{},[])]);return children; })()}
								else {(function () {var children=[];children=children.concat([h("hr",{},[])]);children=children.concat([h("span",{},[])]);return children; })()}
								return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body (two elements) and else body (single node)', function ()
			{
				var result = parse('<div>{{#unless condition}} <address></address><div></div> {{else}} <hr/> {{/unless}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								if (!ctx.condition) {(function () {var children=[];children=children.concat([h("address",{},[])]);children=children.concat([h("div",{},[])]);return children; })()}
								else {(function () {var children=[];children=children.concat([h("hr",{},[])]);return children; })()}
								return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple Handlebars unless block with body (with two elements)', function ()
			{
				var result = parse('<div>{{#unless condition}} <address   > </address> <span></span>	 {{/unless}}</div>')
				,	expeted = h("div",{},(function () {var children=[];
								if (!ctx.condition) {(function () {var children=[];children=children.concat([h("address",{},[])]);children=children.concat([h("span",{},[])]);
									return children; })()}
								return children; })());

				expect(result).toEqual(expeted);
			});
		});

		// TODO This is wrong Give REAL support for generic block statements
		xdescribe('generic block', function ()
		{
			it('Should recognize a simple generic Handlebars block', function ()
			{
				var result = parse('<div>{{#generic}} {{/generic}}   </div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';	}; return fn.call(this); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body', function ()
			{
				var result = parse('<div>{{#generic }} <address></address> {{/generic}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
						return fn.call(this); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and (two elements)', function ()
			{
				var result = parse('<div>{{#generic }} <address></address><input/> {{/generic}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a simple parameter', function ()
			{
				var result = parse('<div>{{#generic param1}} <address></address> {{/generic}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){
								var fn = function (){return 'OK!';}; return fn.call(this,ctx.param1); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and simple parameters', function ()
			{
				var result = parse('<div>{{#generic param1 param2}} <address></address> {{/generic}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
						return fn.call(this,ctx.param1,ctx.param2); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a string parameter', function ()
			{
				var result = parse('<div>{{#generic "param1" }} <address></address> {{/generic}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,"param1"); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a number parameter', function ()
			{
				var result = parse('<div>{{#generic 1 }} <address></address>  {{/generic}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,1); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and a lookup parameter', function ()
			{
				var result = parse('<article>{{#generic ../../grandParent }} <address></address>  {{/generic}}</article>')
				,	expeted = h("article",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.grandParent); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with body and multi parameters', function ()
			{
				var result = parse('<div>{{#generic ../../grandParent 123 "string" simpleEval }} <address></address>  {{/generic}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.grandParent,123,"string",ctx.simpleEval); })()]);return children; })());

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
				var result = parse('<div>{{evaluateMe}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([_.escape(ctx.evaluateMe)]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple safe evaluation with dots', function ()
			{
				ctx.evaluate = {Me: {}};

				var result = parse('{{evaluate.Me.again}}')
				,	expeted = (function () {var children=[];children=children.concat([_.escape(ctx.evaluate.Me.again)]);return children; })();

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
				expect(function () {return parse('<input> {{@index}} </input>')}).toThrowError('Invalid safe reference evaluation.');
			});

			it('Should throw an error on a simple reference evaluation with dots without a valid context', function ()
			{
				expect(function () {return parse('<div> {{@evaluate.Me.again}}</div>')}).toThrowError('Invalid safe reference evaluation.');
			});

			it('Should recognize a simple reference evaluation with dots', function ()
			{
				var result = parse('<div> {{#each collection}} {{ @index  }} {{/each}}</div>')
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

		describe('Unsafe evaluation', function ()
		{
			it('Should recognize a simple unsafe evaluation', function ()
			{
				var result = parse('<div>{{{evaluateMe}}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([""+ctx.evaluateMe]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple unsafe evaluation with dots', function ()
			{
				ctx.evaluate = {Me: {}};
				var result = parse('<div>{{{evaluate.Me.again}}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([""+ctx.evaluate.Me.again]);return children; })());

				expect(result).toEqual(expeted);
			});

			afterEach(function ()
			{
				ctx = {};
			});
		});

		//TODO IMPLEMENT REFERENCE VALUES!
		xdescribe('Unsafe reference evaluation', function ()
		{
			it('Should recognize a simple unsafe reference evaluation', function ()
			{
				var result = parse('<div>{{{@index}}}</div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple unsafe reference evaluation with dots', function ()
			{
				var result = parse('{{{@evaluate.Me.again}}}')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});
		});

		describe('Look expression', function ()
		{
			it('Should recognize a simple look up expression', function ()
			{
				var result = parse('<div>{{../parent}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([_.escape(ctx.parent)]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a look up expression of many levels', function ()
			{
				var result = parse('<div>{{../../../parent}}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([_.escape(ctx.parent)]);return children; })());

				expect(result).toEqual(expeted);
			});
		});

		//TODO Search for a workaround to the Virtual-DOM limitation on not being able to produce comments
		xdescribe('Comments', function ()
		{
			it('Should recognize a simple handlebars comment', function ()
			{
				var result = parse('{{!-- Simple Comments 01 --}}')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a handlebars comment with enters and spaces', function ()
			{
				var result = parse('{{!-- Simple \n \t Comments    --}}')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});
		});

		describe('Safe Generic expressions', function ()
		{
			it('Should recognize a simple generic Handlebars statement with a simple parameter', function ()
			{
				var result = parse('<div>{{generic param1 }}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.param1); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with two simple parameters', function ()
			{
				var result = parse('<div>{{generic param1 param2 }}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.param1,ctx.param2); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a string parameter', function ()
			{
				var result = parse('<div>{{generic "param1"  }}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,"param1"); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a number parameter', function ()
			{
				var result = parse('<div>{{generic 1 }}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
							return fn.call(this,1); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a lookup parameter', function ()
			{
				var result = parse('<div>{{generic ../../grandParent }}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.grandParent); })()]);return children; })());

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with multi parameters', function ()
			{
				var result = parse('<div>{{generic ../../grandParent 123 "string" simpleEval }}</div>')
				,	expeted = h("div",{},(function () {var children=[];children=children.concat([(function(){var fn = function (){return 'OK!';};
								return fn.call(this,ctx.grandParent,123,"string",ctx.simpleEval); })()]);return children; })());

				expect(result).toEqual(expeted);
			});
		});

		//TODO IMPLEMENT THIS!!
		xdescribe('UnSafe Generic expressions', function ()
		{
			it('Should recognize a simple generic Handlebars statement with a simple parameter', function ()
			{
				var result = parse('<div>{{{generic param1 }}}</div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with two simple parameters', function ()
			{
				var result = parse('<div>{{{generic param1 param2 }}}<div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a string parameter', function ()
			{
				var result = parse('<div>{{{generic "param1"  }}}</div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a number parameter', function ()
			{
				var result = parse('<div>{{{generic 1 }}}</div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a reference parameter', function ()
			{
				var result = parse('<div>{{{generic @index }}}</div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars statement with a lookup parameter', function ()
			{
				var result = parse('<div>{{{generic ../../grandParent }}}</div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});

			it('Should recognize a simple generic Handlebars block with multi parameters', function ()
			{
				var result = parse('<div>{{{generic ../../grandParent 123 "string" simpleEval }}}</div>')
				,	expeted = 'wrong';

				expect(result).toEqual(expeted);
			});
		});
	});
});