/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var _ = require('lodash');
var Q = require('q');

var caseGenerators = require('./case-generators');
var matchers = require('./matchers');
var outputMatcher = require('./output-matcher').matcher;
var drive = require('./driver').drive;

_.forEach(matchers, function(matcher, matcherName) {
    exports[matcherName] = matcher;
});

exports.drive = function(table, action) {

    var metadata = {
        inputs: table.inputs,
        outputs: table.outputs
    };

    var data = table.cases;

    drive(metadata, data, action, {
        generator: caseGenerators.direct,
        doCase: it,
        skipCase: it.skip,
        matcher: outputMatcher
    });
};

