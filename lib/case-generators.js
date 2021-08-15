/*
 * Copyright (c) 2021, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

const { eql } = require('./matchers');

exports.direct = function(metadata, data, caseCB, skipCB) {

    let error = '';

    data.forEach(function(inCase, casePosition) {

        // Inputs
        let inDescription = '';
        const inputValues = {};
        metadata.inputs.forEach(function(inputName) {
            if(!inCase.hasOwnProperty(inputName)) {
                if(error.length) {
                    error += '\n';
                }
                error += 'Case ' + (casePosition+1) + ': input ' + inputName + ' not defined'; // TODO i18n
            } else {
                const inputValue = inCase[inputName];
                inputValues[inputName] = inputValue;
                if(inDescription != '') {
                    inDescription += '; ';
                }
                inDescription += inputName + '=' + inputValue;
            }
        });

        // Expected outputs
        const expectedValues = {};
        let outDescription = '';
        metadata.outputs.forEach(function(outputName) {
            if(!inCase.hasOwnProperty(outputName)) {
                if(error.length) {
                    error += '\n';
                }
                error += 'Case ' + (casePosition+1) + ': output ' + outputName + ' not defined'; // TODO i18n
            } else {
                const inExpected = inCase[outputName];
                const outExpected = {};
                if(Array.isArray(inExpected) && typeof inExpected[0] == 'object' && typeof inExpected[0].eval == 'function') {
                    outExpected.matcher = inExpected[0];
                    outExpected.value = outExpected.matcher.parse(inExpected.slice(1));
                } else { // Implicit "eql"
                    outExpected.matcher = eql;
                    outExpected.value = inExpected;
                }
                expectedValues[outputName] = outExpected;
                if(outDescription != '') {
                    outDescription += '; ';
                }
                outDescription += outExpected.matcher.describe(outputName, outExpected.value);
            }
        });

        const description = inDescription + ' => ' + outDescription;

        if(inCase._skip) {
            if(typeof inCase._skip == 'string') {
                skipCB('[' + inCase._skip + '] ' + description);
            } else {
                skipCB(description);
            }
        } else {
            caseCB(description, inputValues, expectedValues);
        }


    });

    if(error.length) {
        throw new Error(error);
    }


};