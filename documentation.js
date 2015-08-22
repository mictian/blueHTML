
##Handlebars Handle Signature

Give support to (REFERENCES VALUES)
	@first
	@last
	@index


ADD SUPPORT FOR GENERIC BLOCKS and its extension points!


ADD SUPPORT FOR ELSE in EACH block! block level


Valdiate list of supported cases in both, node and attributes!


los parametros del translate en realidad son sacados del context!!!!!!
	Estos pueden ser REFRENCE  VALUES
	LOOKUP VALUES
	SINGLE VALUES



SO FAR THIS IS NOT SUPPORTED! by the nodes parsers!
<{{type}}>
</{{type}}>



A diferencia de handlebars que tiene un runtime, en nuestro caso solo compilamos pero no tenemos un runtime, lo que hace que
los helper custom que vos nos das se ejecutan en tiempo de compilacion y NO en runtime (como hacemos nosotros!)
YA tengo una solucion!


##Attributes Cases

1. Single attribute

<a novalidate > </a>
<a "checked" > </a>


2. Standard attribute single quote

<a href='#' > </a>

3. Standard attribute double quote

<a href="#" > </a>

4. Standard with spaces

<a href ="#" > </a>
<a href= "#" > </a>

5. Handlebars surrounding attributes

<a {{#if condition}}href="#"{{/if}} > </a>
<a {{#if condition}}href= "#"{{/if}} > </a>
<a {{#if condition}}href ="#"{{/if}} > </a>
<a {{#if condition}}"checked"{{/if}} > </a>

<a {{#if condition}}"checked" href="/asfasdf/" {{/if}} > </a>


6. Handlebars as an attribute value

<a href="{{#if condition}}http://www,google.com{{else}}http://www,bing.com{{/if}}" > </a>



##Important Links
https://github.com/fb55/htmlparser2

https://github.com/inikulin/parse5
http://www.2ality.com/2015/06/tail-call-optimization.html

http://www.developwithpurpose.com/front-end-stack-for-everydollar/




En el context stack cuando estoy en un each no solo voy a agregar un string ahora sera un array de objectos.
Cada objecto tendra por defecto una propertiedad value en la cual se guardara en el string que se esta usando ahora
Pero ademas se podra agregar cualquier otra propiedad que sera usada por REFENCES VALUES (esos valores que son apuntaod por @)
Por ejemplo podemos agregar @index

conjunto de valores por defecto que seran
	@first
	@index
	@last

seran provided by defautl, pero LOS NUEVOS:
se podra definit un context en el codigo RESULTANTE:

ejemplo:

{{#each iterator}}
	{{#if @last}}
		<br/>
	{{/if}}
{{/each}}


==>

_.reduce(iterator, function (acc, value, index, list)
{
	var iteratorContext = {
		index: index
	,	value: value //ITERATOR1
	,	last: index === list.length
	,	first: index === 0
	<<NEW VALUES>>
	};

	acc = acc.concat( (function (){
		var children = [];

		//SI EL VALOR QUE ESTOY EVALUANDO EMPIEZA CON @
			BUSCO ESE VALOR DENTRO DE CONTEXTO ACTUAL: @last ==> iteratorContext.last
		//SI EL VALOR QE ESTOY EVALUENDO EMEPIEZA CON ..
			HANDLE LOOKUP
		//SINO
			SINGLE VALUE, EL CONTEXTO ES VALUE

		if ()
		{
			children += "br"
		}
		return children;
	})() );
	return acc;
}, [])


Spaced in evaluation and in general are not SUPPORTED
	{{ hola }} invalido
	{{ # if asdfasdf }} invalidto
	etc
	etc



REFERENCE VALUES
		IF asfasdf
		UNLESS sdfgsfdg
		EVALUATION asdfasf
		UNSAFEEVALUATION asdfasdf
	PARAMETERS in custom code (block and single!)


IF BLOCKS WILL BE CONVERTED TO GENERIC BLOCK IF THEY DONT HAVE BODY!!!



Handlebars comments are converted to nothing, the parser recognize them but the code generators generates an empty string!


Attributes code generator (check the parser also) DOES NOT support lookups !!!



Reference values
	safe evaluation
	un safe evaluation
	lookup
	generic single


en los attributes hay un monton de posibles optimizationes
	EN LOS VALUES
	si son todos stirng simples, agregarlos todo de una
	si el ultimo string simple es un space omitirlo!




PARAMETERS
	en attributes, the list is a list of object, so the code generator must be adapter to handle that

	in nodes, the PARSER must be updated to be aligned with the attributes parser!!!




TODO REMOVE space_obj in attributes grammar when there is not space!!!!

	IF
	ELSE
	UNLESS
	so on....



LEAVE TOTALLY CLEAR THAT THE ONLY (O.N.L.Y.) SUPPORTED WAY OUT OF THE BOX FOR COMPOSITE VIEW IS TRHOUGH A KEY-VALUE PAIR
It important to document how to handle this process and the options need to pass in!
	THIS IS A HACK!



ADD THE feature to support fixing when the converted view does not have only one father!!!
	La posiblidad de arreglar cuando el template q se esta convirtiendo no tiene un solo elemento como principal


Add a plugin container in a way to implemented a generci extension for both, attributes and nodes code generators!





TODO

[]	Add support for
	*	{{@index}} & {{@../index}}


	IF <c>
	ELSE
	IF

	UNLESS <c>
	ELSE
	UNLESS

EACH <c>
ELSE
UNLESS
	{{THIS}}
	../
	@INDEX
	@KEY (for object iteration)
