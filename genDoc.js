var ShortJsDoc = require('short-jsdoc')
,   rimraf = require('rimraf');

rimraf('./jsdoc/', function ()
{
    ShortJsDoc.make({
        inputDirs: ['./lib', './index.js']
    ,   output: 'jsdoc'
    ,   projectMetadata: './package.json'
    ,   vendor: []
    });
})
