/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var chai = require('chai');
var chaiAsPromise = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var Q = require('q');

chai.use(chaiAsPromise);
chai.use(sinonChai);
var expect = chai.expect;

var ddt = require('../lib/index.js');

describe('Case generation', function() {

    var cg = require('../lib/case-generators');

    describe('Direct case iteration', function () {

        it('Iterates though enumerated cases, in order', function() {
            var cbSpy = sinon.spy();

            cg.direct(
                {inputs: ['a'], outputs: ['b']},
                [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}],
                cbSpy
            );

            expect(cbSpy.callCount).to.eql(3);
            expect(cbSpy.firstCall.args[0]).to.eql('a=1 => b=4');
            expect(cbSpy.firstCall.args[1]).to.eql({a: 1});
            expect(cbSpy.firstCall.args[2].b.value).to.eql(4);
            expect(cbSpy.secondCall.args[0]).to.eql('a=2 => b=5');
            expect(cbSpy.secondCall.args[1]).to.eql({a: 2});
            expect(cbSpy.secondCall.args[2].b.value).to.eql(5);
            expect(cbSpy.thirdCall.args[0]).to.eql('a=3 => b=6');
            expect(cbSpy.thirdCall.args[1]).to.eql({a: 3});
            expect(cbSpy.thirdCall.args[2].b.value).to.eql(6);
        });

        it('Throws a message if input not present, indicating which case (1 missing)', function() {

            expect(function() {
                cg.direct(
                    {inputs: ['a'], outputs: ['b']},
                    [{a: undefined, b: 4}, {b: 5}, {a: 3, b: 6}],
                    function() {}
                );
            }).to.throw(/Case 2.*input a/);
        });

        it('Throws a message if input not present, indicating which case (>1 missing, same case)', function() {
            expect(function() {
                cg.direct(
                    {inputs: ['a','b'], outputs: ['c']},
                    [{a: 1, b: 4, c: 7}, {c: 2}, {a: 3, b: 6, c: 9}],
                    function() {}
                );
            }).to.throw(/Case 2.*input a.*\n.*Case 2.*input b/);
        });

        it('Throws a message if input not present, indicating which case (>1 missing, different case)', function() {
            expect(function() {
                cg.direct(
                    {inputs: ['a','b'], outputs: ['c']},
                    [{a: 1, b: 4, c: 7}, {a: 2, c: 2}, {b: 6, c: 9}],
                    function() {}
                );
            }).to.throw(/Case 2.*input b.*\n.*Case 3.*input a/);
        });

        it('Throws a message if output not present, indicating which case (1 missing)', function() {
            var cbSpy = sinon.spy();

            expect(function() {
                cg.direct(
                    {inputs: ['a'], outputs: ['b']},
                    [{a: 1, b: undefined}, {a: 2, c: 5}, {a: 3, b: 6}],
                    cbSpy
                );
            }).to.throw(/Case 2/);
        });

        it('Throws a message if output not present, indicating which case (>1 missing, same case)', function() {
            var cbSpy = sinon.spy();

            expect(function() {
                cg.direct(
                    {inputs: ['a'], outputs: ['b', 'c']},
                    [{a: 1, b: 4, c:7}, {a: 2}, {a: 3, b: 6, c: 9}],
                    cbSpy
                );
            }).to.throw(/Case 2.*[b].*\n.*Case 2.*[c]/);
        });

        it('1 input, 1 output', function () {
            var cbSpy = sinon.spy();

            cg.direct(
                {inputs: ['a'], outputs: ['b']},
                [{a: 1, b: 4}],
                cbSpy
            );

            expect(cbSpy.firstCall.args[0]).to.eql('a=1 => b=4');
            expect(cbSpy.firstCall.args[1]).to.eql({a: 1});
        });

        it('1 input, 1 output (ignores non-declared inputs)', function () {
            var cbSpy = sinon.spy();

            cg.direct(
                {inputs: ['a'], outputs: ['b']},
                [{a: 1, b: 4, c: 7}],
                cbSpy
            );

            expect(cbSpy.firstCall.args[0]).to.eql('a=1 => b=4');
            expect(cbSpy.firstCall.args[1]).to.eql({a: 1});
        });

        it('>1 input, 1 output (it\'s described in declaration order)', function () {

            var cbSpy = sinon.spy();

            cg.direct(
                {inputs: ['a', 'b'], outputs: ['c']},
                [{a: 1, b: 4, c: 7}],
                cbSpy
            );

            expect(cbSpy.firstCall.args[0]).to.eql('a=1; b=4 => c=7');
            expect(cbSpy.firstCall.args[1]).to.eql({a: 1, b: 4});

        });

        it('1 output (implicit EQL)', function() {

            var cbSpy = sinon.spy();

            cg.direct(
                { inputs: ['a'], outputs: ['b'] },
                [{a: 1, b: 4}, {a: 2, b: 5}, {a: 3, b: 6}],
                cbSpy
            );

            expect(cbSpy.firstCall.args[0]).to.eql('a=1 => b=4');
            expect(cbSpy.firstCall.args[2].b.matcher.name).to.eql('equals');
            expect(cbSpy.firstCall.args[2].b.value).to.eql(4);

        });

        it('2 outputs (implicit EQL)', function() {

            var cbSpy = sinon.spy();

            cg.direct(
                { inputs: ['a'], outputs: ['b', 'c'] },
                [{a: 1, b: 4, c: 7}],
                cbSpy
            );

            expect(cbSpy.firstCall.args[0]).to.eql('a=1 => b=4; c=7');
            expect(cbSpy.firstCall.args[2].b.matcher.name).to.eql('equals');
            expect(cbSpy.firstCall.args[2].b.value).to.eql(4);
            expect(cbSpy.firstCall.args[2].c.matcher.name).to.eql('equals');
            expect(cbSpy.firstCall.args[2].c.value).to.eql(7);

        });

        it('Explicit matchers', function() {

            var cbSpy = sinon.spy();

            var eql = ddt.eql;
            var notEql = ddt.notEql;

            cg.direct(
                { inputs: ['a'], outputs: ['b'] },
                [{a: 1, b: [eql, 4]}],
                cbSpy
            );

            expect(cbSpy.firstCall.args[0]).to.eql('a=1 => b=4');
            expect(cbSpy.firstCall.args[2].b.matcher.name).to.eql('equals');
            expect(cbSpy.firstCall.args[2].b.value).to.eql(4);

        });

        it('Skip (negative)', function() {

            var doSpy = sinon.spy();
            var skipSpy = sinon.spy();

            cg.direct(
                { inputs: ['a'], outputs: ['b'] },
                [{a: 1, b: 4}, {a: 2, b: 5}],
                doSpy,
                skipSpy
            );

            expect(doSpy.callCount).to.eql(2);
            expect(skipSpy.callCount).to.eql(0);

        });

        it('Skip (positive - no reason)', function() {

            var doSpy = sinon.spy();
            var skipSpy = sinon.spy();

            cg.direct(
                { inputs: ['a'], outputs: ['b'] },
                [{a: 1, b: 4}, {a: 2, b: 5, _skip: true}],
                doSpy,
                skipSpy
            );

            expect(doSpy.callCount).to.eql(1);
            expect(skipSpy.callCount).to.eql(1);
            expect(skipSpy.firstCall.args[0]).to.eql('a=2 => b=5');

        });

        it('Skip (positive - with reason)', function() {

            var doSpy = sinon.spy();
            var skipSpy = sinon.spy();

            cg.direct(
                { inputs: ['a'], outputs: ['b'] },
                [{a: 1, b: 4}, {a: 2, b: 5, _skip: 'n/a'}],
                doSpy,
                skipSpy
            );

            expect(doSpy.callCount).to.eql(1);
            expect(skipSpy.callCount).to.eql(1);
            expect(skipSpy.firstCall.args[0]).to.eql('[n/a] a=2 => b=5');

        });

    });
});

describe('Matchers', function() {

    function testDescribe(matcher, output, expected) {
        it(matcher.name + ' [describe]', function() {
            var parsedOutput = matcher.parse(output);
            expect(matcher.describe('a', parsedOutput)).to.eql(expected)
        });
    }

    function testParseEval(matcher, input, ok, nok) {
        it(matcher.name + ' [eval ok]', function() {
            expect(function () {
                var expected = matcher.parse(ok);
                matcher.eval(expected, input, '[a]');
            }).not.to.throw();
        });

        it(matcher.name + ' [eval ko]', function() {
            expect(function() {
                var expected = matcher.parse(nok);
                matcher.eval(expected, input, '[a]');
            }).to.throw(/\[a\]/);
        });
    }

    testDescribe(ddt.eql, [1], 'a=1');
    testParseEval(ddt.eql, 1, [1], [2]);

    testDescribe(ddt.notEql, [1], 'a!=1');
    testParseEval(ddt.notEql, 1, [2], [1]);

});

describe('Output matchment', function() {

    var matcher = require('../lib/output-matcher').matcher;

    it('1 ok', function() {
        expect(function() {
            matcher({a: {matcher: ddt.eql, value: 1}}, {a: 1});
        }).to.not.throw();
    });

    it('1 ko', function() {
        expect(function() {
            matcher({a: {matcher: ddt.eql, value: 1}}, {a: 2});
        }).to.throw(/\[a\]/);
    });

    it('>1 ok', function() {
        expect(function() {
            matcher({a: {matcher: ddt.eql, value: 1}, b: {matcher: ddt.notEql, value: 2}}, {a: 1, b: 3});
        }).to.not.throw();
    });

    it('>1 ko', function() {
        expect(function() {
            matcher({a: {matcher: ddt.eql, value: 1}, b: {matcher: ddt.notEql, value: 2}}, {a: 2, b: 2});
        }).to.throw(/\[a\]|\[b\]/);
    });

});

describe('Driver', function() {

    var drive = require('../lib/driver').drive;

    var metadata = {
        inputs: ['a', 'b'],
        outputs: ['c', 'd']
    };

    var dataOK = [
        {a: 1, b: 2, c: -1, d: 2},
        {a: 2, b: 2, c:  0, d: 4}
    ];

    var dataKO = [
        {a: 1, b: 2, c: -1, d: 2},
        {a: 2, b: 2, c:  0, d: 6}
    ];

    var dataOKWithSkip = [
        {a: 1, b: 2, c: -1, d: 2},
        {a: 3, b: 2, c:  1, d: 6, _skip: true},
        {a: 3, b: 3, c:  0, d: 9, _skip: "n/a"},
        {a: 2, b: 2, c:  0, d: 4}
    ];

    function spyOpts() {
        return {
            generator: require('../lib/case-generators').direct,
            doCase: sinon.spy(function(desc, fn) {
                try {
                    return fn();
                } catch(err) {
                    return err;
                }
            }),
            skipCase: sinon.spy(),
            matcher: sinon.stub()
        };
    }

    describe('Callbacks', function() {

        it('Action callback call count (no skip)', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOK, actionSpy, opts);
            expect(actionSpy.callCount).to.eql(2);
        });

        it('Action callback call count (skip)', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOKWithSkip, actionSpy, opts);
            expect(actionSpy.callCount).to.eql(2);
        });

        it('Case callback call count (no skip)', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.callCount).to.eql(2);
        });

        it('Case callback call count (skip)', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOKWithSkip, actionSpy, opts);
            expect(opts.doCase.callCount).to.eql(2);
        });

        it('Skip callback call count (no skip)', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.skipCase.callCount).to.eql(0);
        });

        it('Skip callback call count (skip)', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOKWithSkip, actionSpy, opts);
            expect(opts.skipCase.callCount).to.eql(2);
        });

        it('Case callback description', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.args[0]).to.eql('a=1; b=2 => c=-1; d=2');
            expect(opts.doCase.secondCall.args[0]).to.eql('a=2; b=2 => c=0; d=4');
        });

        it('Skip callback description', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOKWithSkip, actionSpy, opts);
            expect(opts.skipCase.firstCall.args[0]).to.eql('a=3; b=2 => c=1; d=6');
            expect(opts.skipCase.secondCall.args[0]).to.eql('[n/a] a=3; b=3 => c=0; d=9');
        });

        it('Case callback gets passed a function', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.args[1]).to.be.a('function');
            expect(opts.doCase.secondCall.args[1]).to.be.a('function');
        });

    });

    describe('Action doesn\'t return anything (checks itself)', function() {

        it('The case function doesn\'t return anything', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.returnValue).not.exists;
            expect(opts.doCase.secondCall.returnValue).not.exists;
        });

        it('With succeeded assertion, test goes OK', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy();
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.returnValue).not.to.be.instanceOf(Error);
            expect(opts.doCase.secondCall.returnValue).not.to.be.instanceOf(Error);
        });

        it('With failed assertion, test goes KO', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy(function() {
                expect(true).to.be.false;
            });
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.returnValue).to.be.instanceOf(Error);
            expect(opts.doCase.secondCall.returnValue).to.be.instanceOf(Error);
        });

    });

    describe('Action returns values (lets the matcher check)', function() {

        function testedFn(ins) {
            return {
                c: ins.a - ins.b,
                d: ins.a + ins.b
            }
        }

        it('The case function doesn\'t return anything', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy(testedFn);
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.returnValue).not.exists;
            expect(opts.doCase.secondCall.returnValue).not.exists;
        });

        it('With right data, test goes OK', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy(testedFn);
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.returnValue).not.to.be.instanceOf(Error);
            expect(opts.doCase.secondCall.returnValue).not.to.be.instanceOf(Error);
        });

        it('With wrong data, test goes KO', function() {
            // it doesn't use the data set, but we instruct the matcher to fail
            var opts = spyOpts();
            opts.matcher.onSecondCall().throws();
            var actionSpy = sinon.spy(testedFn);
            drive(metadata, dataOK, actionSpy, opts);
            expect(opts.doCase.firstCall.returnValue).not.to.be.instanceOf(Error);
            expect(opts.doCase.secondCall.returnValue).to.be.instanceOf(Error);
        });

    });

    describe('Action returns values with promises (and lets the matcher check)', function() {

        function testedFn(ins) {
            return {
                c: ins.a - ins.b,
                d: Q.delay(1).then(function() { return ins.a + ins.b; })
            }
        }

        it('The case function returns a Promise', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy(testedFn);
            drive(metadata, dataOK, actionSpy, opts);
            expect(Q.isPromiseAlike(opts.doCase.firstCall.returnValue)).to.be.true;
            expect(Q.isPromiseAlike(opts.doCase.secondCall.returnValue)).to.be.true;
        });

        it('With right data, test goes OK', function() {
            var opts = spyOpts();
            var actionSpy = sinon.spy(testedFn);
            drive(metadata, dataOK, actionSpy, opts);
            return expect(opts.doCase.firstCall.returnValue).to.be.fulfilled;
        });

        it('With wrong data, test goes KO', function() {
            // it doesn't use the data set, but we instruct the matcher to fail
            var opts = spyOpts();
            opts.matcher.onSecondCall().throws();
            var actionSpy = sinon.spy(testedFn);
            drive(metadata, dataOK, actionSpy, opts);
            return expect(opts.doCase.secondCall.returnValue).to.be.rejected;
        });

    });

});