/*
 * Copyright (c) 2021, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

const { expect } = require('chai');
const { inspect } = require('util');

const registry = new Map();

function oneValue(inArray) {
    return inArray[0];
}

function operatorDescription(operator) {
    return function(name, value) {
        return name + operator + inspect(value);
    }
}

function register(shortcut, matcher) {
    registry.set(shortcut, matcher);
    return matcher;
}

exports.eql = register('=', {
    name: 'equals',
    parse: oneValue,
    eval: function(expected, actual, valueMsg) {
        expect(actual, valueMsg).to.eql(expected);
    },
    describe: operatorDescription('=')
});

exports.notEql = register('!=', {
    name: 'not equals',
    parse: oneValue,
    eval: function (expected, actual, valueMsg) {
        expect(actual, valueMsg).not.to.eql(expected);
    },
    describe: operatorDescription('!=')
});

