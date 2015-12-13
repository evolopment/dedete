/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var _ = require('lodash');
var Q = require('q');

exports.drive = function(metadata, data, action, opts) {

    opts.generator(metadata, data,
        // Case treatment
        function(caseDescription, caseInputs, expectedOutputs) {
            opts.doCase(caseDescription, function() {
                var actuals = action(caseInputs, expectedOutputs);
                if(!actuals) {
                    // NOP, the case did the expects itself.
                } else {
                    var promises = [];
                    var wrapped = {};
                    _.forEach(actuals, function(actual, actualName) {
                        if(Q.isPromiseAlike(actual)) {
                            promises.push(actual);
                            wrapped[actualName] = Q(actual);
                        } else {
                            wrapped[actualName] = actual;
                        }
                    });
                    if(promises.length == 0) {
                        opts.matcher(expectedOutputs, actuals);
                    } else {
                        return Q.all(promises).then(
                            function() {
                                var unwrapped = _.mapValues(wrapped, function(value) {
                                    if(Q.isPromiseAlike(value)) {
                                        return value.inspect().value;
                                    } else {
                                        return value;
                                    }
                                });
                                opts.matcher(expectedOutputs, unwrapped);
                            }
                        );
                    }
                }
            });
        },
        // Ignore treatment
        function(caseDescription) {
            opts.skipCase(caseDescription);
        }
    );

};
