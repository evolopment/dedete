/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var ddt = require('../lib/index');
var expect = require('chai').expect;

var table1 = {
    inputs: ['a','b'],
    outputs: ['c', 'd'],
    cases: [
        {a: 1, b: 1, c: 0, d: 1},
        {a: 1, b: 2, c: -1, d: 2},
        {a: 2, b: 2, c: 0, d: 4},
        {a: 3, b: 2, c: 1, d: 6},
        {a: 4, b: 3, c: 1, d: 12,_skip: true},
        {a: 4, b: 4, c: 1, d: 16, _skip: 'tbd'}
    ]
};

describe('Simple direct drive, don\'t return, functions c=a-b; d=a*b', function() {
    ddt.drive(table1, function(ins, outs) {
        expect(ins.a - ins.b).to.eql(outs.c.value);
        expect(ins.a * ins.b).to.eql(outs.d.value);
    });
});

describe('Simple direct drive, return, functions c=a-b; d=a*b', function() {
    ddt.drive(table1, function(ins) {
        return {c: ins.a-ins.b, d: ins.a * ins.b};
    });
});
