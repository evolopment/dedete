/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var expect = require('chai').expect;
var inspect = require('util').inspect;

var registry = {};

function oneValue(inArray) {
    return inArray[0];
}

function operatorDescription(operator) {
    return function(name, value) {
        return name + operator + inspect(value);
    }
}

function register(shortcut, matcher) {
    registry[shortcut] = matcher;
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

