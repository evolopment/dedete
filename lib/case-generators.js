/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var _ = require('lodash');

var eql = require('./matchers').eql;

exports.direct = function(metadata, data, caseCB, skipCB) {

    var error = '';

    _.forEach(data, function(inCase, casePosition) {

        // Inputs
        var inDescription = '';
        var inputValues = {};
        _.forEach(metadata.inputs, function(inputName) {
            if(!inCase.hasOwnProperty(inputName)) {
                if(error.length) {
                    error += '\n';
                }
                error += 'Case ' + (casePosition+1) + ': input ' + inputName + ' not defined'; // TODO i18n
            } else {
                var inputValue = inCase[inputName];
                inputValues[inputName] = inputValue;
                if(inDescription != '') {
                    inDescription += '; ';
                }
                inDescription += inputName + '=' + inputValue;
            }
        });

        // Expected outputs
        var expectedValues = {};
        var outDescription = '';
        _.forEach(metadata.outputs, function(outputName) {
            if(!inCase.hasOwnProperty(outputName)) {
                if(error.length) {
                    error += '\n';
                }
                error += 'Case ' + (casePosition+1) + ': output ' + outputName + ' not defined'; // TODO i18n
            } else {
                var inExpected = inCase[outputName];
                var outExpected = {};
                if(_.isArray(inExpected) && _.isObject(inExpected[0]) && _.isFunction(inExpected[0].eval)) {
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

        var description = inDescription + ' => ' + outDescription;

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