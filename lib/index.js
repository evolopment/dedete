/*
 * Copyright (c) 2021, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

const caseGenerators = require('./case-generators');
const matchers = require('./matchers');
const { outputMatcher } = require('./output-matcher');
const { drive } = require('./driver');

for(const [matcherName, matcher] of Object.entries(matchers)) {
    exports[matcherName] = matcher;
}

exports.drive = function(table, action) {

    const metadata = {
        inputs: table.inputs,
        outputs: table.outputs
    };

    const data = table.cases;

    drive(metadata, data, action, {
        generator: caseGenerators.direct,
        doCase: it,
        skipCase: it.skip,
        matcher: outputMatcher
    });
};

