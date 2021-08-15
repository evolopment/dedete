/*
 * Copyright (c) 2021, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

function isPromiseAlike(maybePromise) {
    return maybePromise && typeof maybePromise.then == 'function';
}

exports.drive = function(metadata, data, action, opts) {

    opts.generator(metadata, data,
        // Case treatment
        function(caseDescription, caseInputs, expectedOutputs) {
            opts.doCase(caseDescription, function() {
                var actuals = action(caseInputs, expectedOutputs);
                if(!actuals) {
                    // NOP, the case did the expects itself.
                } else {
                    // TODO maybe simplify. It tries to avoid using promises if no actual is a promise, but maybe it has no 
                    const promises = [];
                    const wrapped = {}; 
                    for(const [actualName, actual] of Object.entries(actuals)) {
                        if(isPromiseAlike(actual)) {
                            promises.push(actual);
                        }
                        wrapped[actualName] = actual;
                    }
                    if(promises.length == 0) {
                        opts.matcher(expectedOutputs, actuals);
                    } else {
                        return Promise.all(promises).then(
                            function(values) {
                                let unwrapped = {};
                                let valuesI = 0;
                                for(const [key,value] of Object.entries(wrapped)) {
                                    unwrapped[key] = isPromiseAlike(value) ? values[valuesI++] : value;
                                }
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
