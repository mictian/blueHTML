# blueHTML
Simple [handlebar] to [virtual-dom] converter
[handlebar]:http://handlebarsjs.com/
[virtual-dom]:https://github.com/Matt-Esch/virtual-dom

## Overview

Simple converter from HTML/Handlebars templates into virtual-dom.

PR Accepted (Specially Unit Tests :D )

## API & Samples

```javascript
var blueHTML = require('bluehtml')
,   h = require('virtual-dom/h')
,   _ = require("underscore")


var template_string = '<div id="content"><h1>{{title}}</h1>{{mainContent}}</div>'
,   virtual_dom = blueHTML.generateVirtualDOM(template_string, {notGenerateContext:true})
,   context = {
        title: 'Test Title',
        mainContent: 'Hello word'
    };

console.log(virtual_dom);

var eval_fn = "var ctx = " + JSON.stringify(context) + ';' + virtual_dom;

var virtual_dom_output = eval(eval_fn);
console.log(virtual_dom_output);

```

## How blueHTML works
The general structure of blueHTML is very simple. It is divided in 2 main sections; parsing and code generation.
For the parsgin part [handlebars-ex](https://github.com/Mictian/handlebars-ex) is uded.
It is important to notice that, although it is not the aim of this project, blueHTML end it up being another implementation of Handlebars, as it is require to support the same handlebars API to correctly convert it to Virtual-DOM.

Also take a look at the Code Generation section below to understand some of the difference between Handlebars and blueHTML.


### Code generation
For the code generation, the process is very simple. Based on the AST a JSON object, returned by the parsed, it is just a matter of traversal it.
The big difference in the final code between Handlebars and blueHTML, is that Handlebars has a Run Time code runner.
In other word, when you add extra helper in Handlebars you are adding them to the runner, so your helpers are evaluated in run-time.
In blueHTML the produced code is a simple String, which means that you are responsible for the context where your extensions run. You must think that blueHTML will generate a string code, that later on will be executed.

#### New context creation
One aspect that I think is really important to understand, is the concept of context.
blueHTML is really simple, this is the only point that require understanding.
The group of ALL valid variables to be accessed in any time are those declared in the current context.
By default (or at the being of your template) blueHTML presume that a generic context (ctx) exists and you can use any variable name. After this, there are two Handlebars helpers that define new context, EACH and WITH, currently only EACH is supported (see the Wiki for a list of supported features and it's status).
When a new context is created all variables are read from it.

In code: the expression

```javascript
{{variableName}}
```
when a new context is create will be retrieve from the new context.

Besides, all reference value (in the blueHTML jargon all handlebars expression that start with @) must be declare in the context.

For example:

```html
{{#each iterator}}
<div>{{@index}}</div>
{{/each}}
```
In this case index MUST be defined in the new context created by EACH.
Relax, blueHTML create the default Handlebars values for you, and also you can extend this :D.


## Custom Helpers
As the state of the code, there is basic support for extensions/custom helpers, neither all ways of customization provided by Handlebars are supported.
The best way to explain this is through an example:

```javascript
var blueHTML = require('bluehtml');

var handlebars_template = '<div id="content"><h1>{{MyCustomExtension variable1 "someString"}}</h1></div>';


blueHTML.addCustomHandler({
    // As you can see the pattern is singleInstance + <Helper name>
	'singleInstanceMyCustomExtension': function (variable1, text)
	{
		return variable1 + text + '!';
	}
});

var virtual_dom_string_template = blueHTML.generateVirtualDOM(handlebars_template);

console.log(virtual_dom_string_template)

```


# License
The MIT License (MIT)

Copyright (c) 2015 Mictian

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
