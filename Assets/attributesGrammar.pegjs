
start
	= itemList

itemList
	= ps:properties s:space* l:itemList
		{
			ps = ps instanceof Array ? ps : [ps];

			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			return ps.concat(spaces_obj).concat(l);
		}
	/ hs:handlebars s:space* l:itemList
		{
			hs = hs instanceof Array ? hs : [hs];

			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			return hs.concat(spaces_obj).concat(l);
		}
	/ properties
	/ handlebars

properties
	= p:property s:space* ps:properties
		{
			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			return [p].concat(spaces_obj).concat(ps);
		}
	/ p:property
		{
			return p;
		}

property
	= k:propertyKeyWrapper v:(propertyValueWrapper)?
		{
			if (v)
			{
				return {
					type: 'keyValue'
				,	key: k.value
				,	value: v
				};
			}
			return k;
		}

propertyKeyWrapper
	= "\"" pk:propertyKey "\""
		{
			return pk;
		}
	/ "'" pk:propertyKey "'"
		{
			return pk;
		}
	/ propertyKey

propertyKey
	= keyName:[^ "'{}=]+
		{
			return {
				type: "singleKey"
			,	value: keyName.join('')
			};
		}


propertyValueWrapper
	= "=" pv:propertyValueSingleQuote
		{
			return pv;
		}
	/ "=" pv:propertyValueDoubleQuote
		{
			return pv;
		}

propertyValueSingleQuote
	= "'" values:singleQuotepropertyValues "'"
		{
			return values;
		}
	/ "''"
		{
			return {
				type: 'singleValue'
			,	value: ''
			};
		}

propertyValueDoubleQuote
 	= "\"" values:doubleQuotepropertyValues "\""
		{
			return values;
		}
	/ "\"\""
		{
			return {
				type: 'singleValue'
			,	value: ''
			};
		}

singleQuotepropertyValues
	= v:singleQuoteValue s:space* vs:singleQuotepropertyValues
		{
			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			return v.concat(spaces_obj).concat(vs);
		}
	/ v:singleQuoteValue s:space*
		{
			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			v = v instanceof Array ? v : [v];

			return v.concat(spaces_obj);
		}

doubleQuotepropertyValues
	= v:doubleQuoteValue s:space* vs:doubleQuotepropertyValues
		{
			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			v = v instanceof Array ? v : [v];

			return v.concat(spaces_obj).concat(vs);
		}
	/ v:doubleQuoteValue s:space*
		{
			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			v = v instanceof Array ? v : [v];

			return v; //.concat(spaces_obj);
		}


singleQuoteValue
	= valueName:[^ '{}]+
		{
			return {
				type: 'singleValue'
			,	value: valueName.join('')
			};
		}
	/ h:handlebars

doubleQuoteValue
	= valueName:[^ "{}]+
		{
			return {
				type: 'singleValue'
			,	value: valueName.join('')
			};
		}
	/ h:handlebars

handlebars
	= blockHandelbars
	/ singleHandlebars

blockHandelbars
	= h:blockHandelbarsItem s:space* hs:blockHandelbars
		{
			//We add the ignored space as they play an important role when setting a property's value
			//name="prop1{{V1}}" is not the same as name="prop1 {{V1}}"
			var spaces_obj = {
				type: 'singleKey'
			,	subType: 'extraSpaces'
			,	value: s.join('')
			};

			return [h].concat(spaces_obj).concat(hs);
		}
	/ blockHandelbarsItem

blockHandelbarsItem
	= handlebarsIfBlock
	/ handlebarsEachBlock
	/ handlebarsUnlessBlock
	/ "{{#" openName:word space* params:(params)? space* "}}" l:itemList "{{/" closeName:word "}}"
		{
			return {
				type: 'handlebars'
			,	subType: 'GENERICBLOCK'
			,	value: l
			,	openTag: openName
			,	closeTag: closeName
			,	parameters: params
			};
		}

handlebarsIfBlock
	= "{{#if" space* condition:lookUpWords space* "}}" s1:space* ifBody:itemList s2:space* elseBody:(handlebarsIfElseBlock)? s3:space* "{{/if}}"
		{
			var condition_obj = {
					type: 'handlebars'
				,	subType: ''
				,	value: condition
				}
			,	spaces_obj1 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s1.join('')
				}
			,	spaces_obj2 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s2.join('')
				}
			,	spaces_obj3 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s3.join('')
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
			,	ifBody: [spaces_obj1].concat(ifBody).concat(spaces_obj2)
			,	elseBody: (elseBody || []).concat(spaces_obj3)
			};
		}

handlebarsEachBlock
	= "{{#each" space* iterator:lookUpWords space* "}}" s1:space* eachBody:itemList s2:space* elseBody:(handlebarsIfElseBlock)? s3:space* "{{/each}}"
		{
			var condition_obj = {
					type: 'handlebars'
				,	subType: ''
				,	value: iterator
				}
			,	spaces_obj1 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s1.join('')
				}
			,	spaces_obj2 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s2.join('')
				}
			,	spaces_obj3 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s3.join('')
				};

			if (iterator.length > 1)
			{
				condition_obj.subType = 'LOOKUPSINGLE';
			}
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
			,	eachBody: [spaces_obj1].concat(eachBody).concat(spaces_obj2)
			,	elseBody: (elseBody || []).concat(spaces_obj3)
			};
		}

handlebarsUnlessBlock
	= "{{#unless" space* condition:lookUpWords space* "}}" s1:space* unlessBody:itemList s2:space* elseBody:(handlebarsIfElseBlock)? s3:space* "{{/unless}}"
		{
			var condition_obj = {
					type: 'handlebars'
				,	subType: ''
				,	value: condition
				}
			,	spaces_obj1 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s1.join('')
				}
			,	spaces_obj2 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s2.join('')
				}
			,	spaces_obj3 = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s3.join('')
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
			,	unlessBody: [spaces_obj1].concat(unlessBody).concat(spaces_obj2)
			,	elseBody: (elseBody || []).concat(spaces_obj3)
			};
		}

handlebarsIfElseBlock
	= "{{else}}" s:space* il:itemList
		{
			var spaces_obj = {
					type: 'singleKey'
				,	subType: 'extraSpaces'
				,	value: s.join('')
				};

			return [spaces_obj].concat(il);
		}

handlebarsBlockName
	= name:[a-zA-Z]*
		{
			return name.join('');
		}

singleHandlebars
	= "{{" !"else" v:lookUpWords space* parameterList:(params)? "}}"
		{
			var result = {
				type: 'handlebars'
			,	subType: ''
			,	value: v
			,	params: parameterList || []
			};

			if (!parameterList)
			{
				if (v.length > 1)
				{
					result.subType = 'CONTEXTLOOKUP';
				}
				else if (v[0].indexOf('@') === 0)
				{
					result.subType = 'REFERENCEEVALUATION';
					result.value = v[0]
				}
				else
				{
					result.subType = 'SAFEEVALUATION';
					result.value = v[0]
				}
			}
			else
			{
				result.subType = 'GENERICSINGLE';
			}

			return result;
		}
	/ "{{{" !"else" v:lookUpWords space* parameterList:(params)? "}}}"
		{
			var result = {
				type: 'handlebars'
			,	subType: ''
			,	value: v
			,	params: parameterList || []
			};

			if (!parameterList)
			{
				if (v.length > 1)
				{
					result.subType = 'UNSAFECONTEXTLOOKUP';
				}
				else if (v[0].indexOf('@') === 0)
				{
					result.subType = 'UNSAFEREFERENCEEVALUATION';
					result.value = v[0]
				}
				else
				{
					result.subType = 'UNSAFEEVALUATION';
					result.value = v[0];
				}
			}
			else
			{
				result.subType = 'UNSAFEGENERICSINGLE';
			}

			return result;
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

lookUpWords
	= w:word "/" ws:lookUpWords
		{
			return [w].concat(ws);
		}
	/ w:word
		{
			return [w];
		}

word
	= !"/" w:[^ '"/><{}]+
		{
			return w.join('');
		}

space
	= ' '