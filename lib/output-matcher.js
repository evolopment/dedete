/*
 * Copyright (c) 2021, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

exports.matcher = function (allExpected, allActual) {
    for(const [actualKey, actualValue] of Object.entries(allActual)) {
        const expected = allExpected[actualKey];
        expected.matcher.eval(expected.value, actualValue, '[' + actualKey + ']');
    }
};
