# blueHTML
Simple [handlebar] to [virtual-dom] converter
[handlebar]:http://handlebarsjs.com/
[virtual-dom]:https://github.com/Matt-Esch/virtual-dom

## Overview
IMPORTANT: This project is in apha stage, lot of work need to be done until it is finish!
(Do not use it on production)

Simple converter from HTML/Handlebars templates into virtual-dom.

## API & Samples

```javascript
var blueHTML = require('blueHTML');

var handlebars_template = '<div id="content"><h1>{{title}}</h1>{{mainContent}}</div>';
var context = {
    title: 'Test Title',
    mainContent: 'Hello word'
};

var virtual_dom_string_template = blueHTML.generateVirtualDOM(handlebars_template);

var virtual_dom_fn = eval(virtual_dom_string_template);

var dom_output = virtual_dom_fn(context);

```

## How blueHTML works
### Parting & Code generation
### New context context

## Extensions