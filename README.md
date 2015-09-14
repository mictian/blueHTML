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

## Motivation
I personally believe in the one-way data-flow pattern is an excellent way to model user interaction
and I think that from an architectural point of view it has a lot of advantages.

Besides, all the great development that have been done with Virtual DOM
technologies is something that cannot be ignored. Perhaps you can like it not,
but for a performance point of view I think that React have leave it crystal clear.

Although all the previous, I do not want to re-write all my Handlebars templates
to JavaScript (JSX, HyperScript or whatever flavor you want) nor I think that designers should start
writing JavaScript instead of HTML templates.
All this VirtualDOM technologies are great, but this does not mean that we must change the way
we have been working on, by the contrary, we can enhance the way we used to work.
Take for instance a Backbone.js application with Handlebars (the way I work), in this case Handlebars is not used
as a final representation of the HTML, but rather as a friendly way the designer can work with it.
You will process your Handlebars template obtaining an output, point at which you
will neither use this output as a final representation, and wrap it with jQuery or any other equivalent.

So, my point is that we can use any other intermediate representation for our templates,
jQuery, VirtualDOM or the one you think is better, as long as we keep a clear separation
between what the aim of each part is.

##Documentation
For a general overview please refer to the [Wiki](https://github.com/Mictian/blueHTML/wiki/General-Documentation) and more technical one please refer to the code which is fully documented.


##Changelog
(add link)

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
