/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var _ = require('lodash');

exports.matcher = function (allExpected, allActual) {
    var error = null;
    _.forEach(allActual, function(actualValue, actualKey) {
        var expected = allExpected[actualKey];
        try {
            expected.matcher.eval(expected.value, actualValue, '[' + actualKey + ']');
        } catch(err) {
            if(!error) {
                error = err;
            }
        }
    });
    if(error) {
        throw error;
    }
};
