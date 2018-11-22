/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 PayPal                                                 │
 │                                                                            │
 │  Licensed under the Apache License, Version 2.0 (the "License");           │
 │  you may not use this file except in compliance with the License.          │
 │  You may obtain a copy of the License at                                   │
 │                                                                            │
 │    http://www.apache.org/licenses/LICENSE-2.0                              │
 │                                                                            │
 │  Unless required by applicable law or agreed to in writing, software       │
 │  distributed under the License is distributed on an "AS IS" BASIS,         │
 │  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │  See the License for the specific language governing permissions and       │
 │  limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/

/* global describe */
/* global it */
/* global xit */ /* exported xit */

"use strict";

var expect = require("chai").expect;

var L = require("../src/legalize-node.js");

describe("object validations", function() {

    it("object().valid(...).valid(...) accepts ...", function () {
        var result;
        var schema = L.object().valid({ x: 3 }).valid({ y: 7 });

        result = L.validate({ x: 3 }, schema);
        expect(!result.error).to.be.true();

        result = L.validate({ y: 7 }, schema);
        expect(!result.error).to.be.true();
    });

    it("object().valid(...).valid(...) rejects ...", function () {
        var result;
        var schema = L.object().valid({ x: 3 }).valid({ y: 7 });

        result = L.validate({}, schema);
        expect(!result.error).to.be.false();
    });

    it("object().valid(..., ...) accepts ...", function () {
        var result;
        var schema = L.object().valid({ x: 3 }, { y: 7 });

        result = L.validate({ x: 3 }, schema);
        expect(!result.error).to.be.true();

        result = L.validate({ y: 7 }, schema);
        expect(!result.error).to.be.true();
    });

    it("object().valid(..., ...) rejects ...", function () {
        var result;
        var schema = L.object().valid({ x: 3 }, { y: 7 });

        result = L.validate({}, schema);
        expect(!result.error).to.be.false();
    });

    it("object().type(RegExp) should accept regular expressions", function () {
        var schema = L.object().type(RegExp);

        expect(!L.validate(/^[0-9]+$/, schema).error).to.be.true();
    });


    it("object().type() should accept user defined classes (test with ES5 class)", function () {
        function TypeTestClass(mode) {
            this.mode = mode;
        }
        /*function NotTypeTestClass(mode) {
            this.mode = mode;
        }*/

        var schema = L.object().type(TypeTestClass);
        var testObject = new TypeTestClass(true);
        //var badObject = new NotTypeTestClass(true);

        expect(!L.validate(testObject, schema).error).to.be.true();
        //expect(L.validate(badObject, schema).error).to.be.true();
    });

    it("object().type() should reject wrong user defined class (ES5 check)", function () {
        function TypeTestClass(mode) {
            this.mode = mode;
        }
        function NotTypeTestClass(mode) {
            this.mode = mode;
        }

        var schema = L.object().type(TypeTestClass);
        var wrongObject = new NotTypeTestClass(true);

        expect(!L.validate(wrongObject, schema).error).to.be.false();
    });

    it("object().type() should return the instance of the user class (test with ES5 class)", function () {
        function TypeTestClass(mode, name) {
            this.mode = mode;
            this.name = name;
        }
        var schema = L.object().type(TypeTestClass);
        var testObject = new TypeTestClass(true, 'Ronan');
        var result = L.validate(testObject, schema);
        expect(result.value.mode).to.be.true();
        expect(result.value.name).to.be.equal('Ronan');
    });

    it("object().type(RegExp) should reject anything but regular expressions", function () {
        var schema = L.object().type(RegExp);

        expect(!L.validate(2353, schema).error).to.be.false();
        expect(!L.validate("ax", schema).error).to.be.false();
    });

    it("object().keys().pattern(RegExp,schema) should validate the object, " +
        "non-matched keys are validated by pattern", function () {
        var schema = L.object().keys({
            a: L.string().match(/^\w+$/),
            b: L.string().match(/^\d+$/)}).
        pattern([/[X-Z]+/, [1,2,3]]);

        var result = L.validate({a:'Hello123', b:'890'}, schema);
        expect(!result.error).to.be.true();
        expect(result.value).to.eql({a:'Hello123', b:'890'});

        result = L.validate({a:'Hello123', b:'890', X:3}, schema);
        expect(!result.error).to.be.true();
        expect(result.value).to.eql({a:'Hello123', b:'890', X:3});

        result = L.validate({a:'Hello123', b:'890', X:4}, schema);
        expect(result.warnings[0].type).to.be.equal('no_alternative_matched');
        expect(result.value).to.eql({a:'Hello123', b:'890', X:undefined});

        result = L.validate({a:'Hello123', b:'890', W:3}, schema);
        expect(result.error[0].type).to.be.equal('unknown_key');
        expect(result.value).to.eql({a:'Hello123', b:'890'});
    });

    it("object().keys().pattern(RegExp,schema) should validate the object, " +
        "also when it is a list, of schemas", function () {
        // two schema: one with key n and the other with key a
        // Note that the required is essential otherwise the
        // alternatives evaluation will accept an undefined
        // result.
        var alternate = L.alternatives({n: L.string(/^[0-9]+$/).required()},
                                        {a: L.string().lowercase().required()});
        // keys must be uppercase letters
        var schema = L.object().pattern([/[X-Z]+/, alternate]);

        var result = L.validate({X: {n: '0123456789'}}, schema);
        expect(result.value).to.eql({X: {n: '0123456789'}});

        result = L.validate({Y: {a: 'abcdefghijklm'}}, schema);
        expect(result.value).to.eql({Y: {a: 'abcdefghijklm'}});

        result = L.validate({Y: {a: 'Abcdefghijklm'}}, schema);
        expect(result.warnings.length).to.eql(1);

    });

    it("validate(..., {...}) should accept the object according to def.", function () {

        var result = L.validate({ x: 3, y: "hello" }, { x: L.any().valid(3), y: L.string() });

        expect(!result.error).to.be.true();
        expect(result.value).to.eql({ x: 3, y: "hello" });
    });

    it("validate({}, {...}) should populate an object of default values", function () {

        var result = L.validate({}, { x: L.any().default(3) });

        expect(!result.error).to.be.true();
        expect(result.value).to.eql({ x: 3 });
    });

    it("validate() with options strict=false", function () {

        var result = L.validate({
            x: "34",
            y: true,
            z: 1,
            q: "389457"
        }, {
            x: L.number(),
            y: L.string(),
            z: L.boolean(),
            q: /^[0-9]+$/
        }, {
            strict: false
        });
        
        expect(!result.error).to.be.true();
        expect(result.value).to.eql({
            x: 34,
            y: "true",
            z: true,
            q: "389457"
        });
    });

    it("validate() with a callback works equally well", function (done) {
        L.validate({ x: "woop woop" }, {
            x: L.string()
        }, function (err, val) {
            expect(!err).to.be.true();
            expect(val).to.eql({ x: "woop woop" });
            done();
        });
    });


});

