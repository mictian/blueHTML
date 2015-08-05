
start
	= nodes

nodes
	= n:node ignorable* ns:nodes
		{
			return [n].concat(ns);
		}
	/ n:node
		{
			return [n];
		}

node
	= htmlNode
	/ textNode
	/ handlebarsNode

attributes
	= s1:space* a:attr s2:space* as:attributes
		{
			return s1.join('') + a + s2.join('') + as;
		}
	/ s1:space* a:attr s2:space*
		{
			return s1.join('') + a + s2.join('');
		}

attr
	= "'" a:[^']* "'"
		{
			return "'" + a.join('') + "'";
		}
	/ "\"" a:[^"]* "\""
		{
			return '"' + a.join('') + '"';
		}
	/ !"/>" a:attrToken
		{
			// var aux = a;
			return a.indexOf('/', a.length - 1) !== -1 ? a.substr(0, a.length -1) : a;
		}

attrToken
	= !"/>" w:[^ '"><]+
		{
			return w.join('');
		}

htmlNode
	= htmlBlockNode
	/ htmlSingleNode

htmlBlockNode
	= ignorable* '<' !"!--" !voidElement !"input" openTagName:word attrs:(attributes)? space* ">" ignorable* ns:(nodes)? ignorable* "</" closeTagName:word ">" ignorable*
		{
			return {
				type: 'htmlBlockNode'
			,	openTag: openTagName
			,	closeTag: closeTagName
			,	attributes: attrs
			,	children: ns || []
			};
		}

htmlSingleNode
	= ignorable* "<" !"!--" tagName:voidElement attrs:(attributes)? space* "/"? ">"
		{
			return {
				type: 'htmlSingleNode'
			,	tag: tagName
			,	attributes: attrs
			};
		}
	/ ignorable* "<input" attrs:(attributes)? "/>"
		{
			return {
				type: 'htmlSingleNode'
			,	tag: 'input'
			,	attributes: attrs
			};
		}
	/ ignorable* "<input" attrs:(attributes)? ">" f:(ignorable* (nodes)? ignorable* "</input>")?
		{
			return {
				type: 'htmlBlockNode'
			,	openTag: 'input'
			,	closeTag: 'input'
			,	attributes: attrs
			,	children: Object.prototype.toString.call(f[1]) === '[object Array]' ? f[1] :  []
			};
		}
	/ ignorable* '<!--' c:htmlCommentToken* '-->'
		{
			return {
				type: 'htmlComment'
			,	value: c.join('')
			};
		}

htmlCommentToken
	= !"-->" c:.
		{
			return c;
		}

voidElement
	= "area"
	/ "base"
	/ "basefont"
	/ "br"
	/ "col"
	/ "command"
	/ "embed"
	/ "frame"
	/ "hr"
	/ "img"
	/ "isindex"
	/ "keygen"
	/ "link"
	/ "meta"
	/ "param"
	/ "source"
	/ "track"
	/ "wbr"

	//common self closing svg elements
	/ "path"
	/ "circle"
	/ "ellipse"
	/ "line"
	/ "rect"
	/ "use"
	/ "stop"
	/ "polyline"
	/ "polygon"

handlebarsNode
	= handlebarsBlockNode
	/ handlebarsSingleNode

handlebarsSingleNode
	= handlebarsSafeEvaluation
	/ handlebarsUnSafeEvaluation
	/ handlebarsLookup
	/ handlebarsSingleComment
	/ handlebarsGenericSingle

handlebarsGenericSingle
	= "{{" !"." w:word space+ ps:params space* "}}"
		{
			return {
				type: 'handlebars'
			,	subType: 'GENERICSINGLE'
			,	value: w
			,	parameters: ps
			};
		}

handlebarsSingleComment
	= "{{!--" c:handlebarsSingleCommentToken* "--}}"
		{
			return {
				type: 'handlebars'
			,	subType: 'SINGLECOMMENTS'
			,	value: c.join('')
			};
		}

handlebarsSingleCommentToken
	= !"--}}" .

params
	= p:param space* ps:params
		{
			return [p].concat(ps);
		}
	/ p:param
		{
			return [p];
		}

param
	= "'" ws:[^']* "'"
		{
			return '"' + ws.join('') + '"';
		}
	/ '"' ws:[^"]* '"'
		{
			return '"' + ws.join('') + '"';
		}
	/  word


handlebarsSafeEvaluation
	= "{{" !"." !"else" w:word "}}"
		{
			if (w.indexOf('@') === 0)
			{
				return {
					type: 'handlebars'
				,	subType: 'SAFEREFERENCEEVALUATION'
				,	value: w
				};
			}

			return {
				type: 'handlebars'
			,	subType: 'SAFEEVALUATION'
			,	value: w
			};
		}

handlebarsUnSafeEvaluation
	= "{{{" w:word "}}}"
		{
			if (w.indexOf('@') === 0)
			{
				return {
					type: 'handlebars'
				,	subType: 'UNSAFEREFERENCEEVALUATION'
				,	value: w
				};
			}

			return {
				type: 'handlebars'
			,	subType: 'UNSAFEEVALUATION'
			,	value: w
			};
		}

handlebarsLookup
	= "{{" !"else" w:lookUpWords "}}"
		{
			return {
				type: 'handlebars'
			,	subType: 'LOOKUPSINGLE'
			,	value: w
			};
		}

handlebarsBlockNode
	= handlebarsIfBlock
	/ handlebarsEachBlock
	/ handlebarsUnlessBlock
	/ handlebarsGenericBlock

handlebarsGenericBlock
	= '{{#' openTagName:word space* params:(params)? space* "}}" ignorable* children:(nodes)? ignorable* "{{/" closeTagName:word "}}"
		{
			return {
				type: 'handlebars'
			,	subType: 'GENERICBLOCK'
			,	openTag: openTagName
			,	closeTag: closeTagName
			,	parameters: params || []
			,	children: children || []
			};
		}

handlebarsIfBlock
	= ignorable* "{{#if" space* condition:lookUpWords space* "}}" ignorable* ifBody:nodes ignorable* elseBody:(handlebarsElseBlock)? ignorable* "{{/if}}"
		{
			var condition_obj = {
					type: 'handlebars'
				,	subType: ''
				,	value: condition
				};

			if (condition.length > 1)
			{
				condition_obj.subType = 'LOOKUPSINGLE';
			}
			else if (condition[0].indexOf('@') === 0)
			{
				condition_obj.subType = 'REFERENCEEVALUATION';
				condition_obj.value = condition[0];
			}
			else
			{
				condition_obj.subType = 'SINGLEEVALUATION';
				condition_obj.value = condition[0];
			}


			return {
				type: 'handlebars'
			,	subType: 'IF'
			,	condition: condition_obj
			,	ifBody: ifBody
			,	elseBody: elseBody || []
			};
		}

handlebarsEachBlock
	= ignorable* "{{#each" space* iterator:lookUpWords space* "}}" ignorable* eachBody:nodes ignorable* elseBody:(handlebarsElseBlock)? ignorable* "{{/each}}"
		{
			var condition_obj = {
					type: 'handlebars'
				,	subType: ''
				,	value: iterator
				};

			if (iterator.length > 1)
			{
				condition_obj.subType = 'LOOKUPSINGLE';
			}
			//Notice that here we are validating if the iterator is a reference evaluation just in case of any customization, as by default the iterator cannot be a reference evaluation
			// (first, last and index)
			else if (iterator[0].indexOf('@') === 0)
			{
				condition_obj.subType = 'REFERENCEEVALUATION';
				condition_obj.value = iterator[0];
			}
			else
			{
				condition_obj.subType = 'SINGLEEVALUATION';
				condition_obj.value = iterator[0];
			}

			return {
				type: 'handlebars'
			,	subType: 'EACH'
			,	iterator: condition_obj
			,	eachBody: eachBody
			,	elseBody: elseBody || []
			};
		}

handlebarsUnlessBlock
	= ignorable* "{{#unless" space* condition:lookUpWords space* "}}" ignorable* unlessBody:nodes ignorable* elseBody:(handlebarsElseBlock)? ignorable* "{{/unless}}"
		{
			var condition_obj = {
					type: 'handlebars'
				,	subType: ''
				,	value: condition
				};

			if (condition.length > 1)
			{
				condition_obj.subType = 'LOOKUPSINGLE';
			}
			else if (condition[0].indexOf('@') === 0)
			{
				condition_obj.subType = 'REFERENCEEVALUATION';
				condition_obj.value = condition[0];
			}
			else
			{
				condition_obj.subType = 'SINGLEEVALUATION';
				condition_obj.value = condition[0];
			}

			return {
				type: 'handlebars'
			,	subType: 'UNLESS'
			,	condition: condition_obj
			,	unlessBody: unlessBody
			,	elseBody: elseBody || []
			};
		}

handlebarsElseBlock
	= "{{else}}" ignorable* ns:nodes
		{
			return ns;
		}

textNode
	= ignorable* w:wordWithSlash+ ignorable*
		{
			return {
				type: 'text'
			,	value: w.join('')
			};
		}

wordWithSlash
//	= !"{{" !"<" o:[^ '"<{\t\n]
	= !ignorable w:[^>}{<'"\n\t]
		{
			return w;
		}

lookUpWords
	= w:word "/" ws:lookUpWords
		{
			return [w].concat(ws);
		}
	/ w:word
		{
			return [w];
		}

//Generic Single handlebar code parameters
params
	= p:param space* ps:params
		{
			return p.concat(ps);
		}
	/ p:param

param
	= "'" ws:paramTokenSingleQuote* "'"
		{
			return [{
				type: 'parameter'
			,	subType: 'SIMPLEVALUE'
			,	value: "'" + ws.join('') + "'"
			}];
		}
	/ '"' ws:paramTokenDoubleQuote* '"'
		{
			return [{
				type: 'parameter'
			,	subType: 'SIMPLEVALUE'
			,	value: '"' + ws.join('') + '"'
			}];
		}
	/  l:lookUpWords
		{
			var sub_type = ''
			if (l.length > 1)
			{
				sub_type = 'LOOKUPSINGLE';
			}
			else if (l[0].indexOf('@') === 0)
			{
				sub_type = 'REFERENCEEVALUATION';
			}
			else
			{
				sub_type = 'SINGLEEVALUATION';
			}

			return [{
				type: 'parameter'
			,	subType: sub_type
			,	value: l.length === 1 ? l[0] : l
			}];
		}

paramTokenSingleQuote
	= "\\'"
	/ [^']

paramTokenDoubleQuote
	= '\\"'
	/ [^"]

word
	= !"/" w:[^ '"/><{}\t]+
		{
			return w.join('');
		}

ignorable
	= [ \n\t]

space
	= ' '
