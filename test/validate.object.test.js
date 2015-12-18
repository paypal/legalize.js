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

    it("object().type(RegExp) should reject anything but regular expressions", function () {
        var schema = L.object().type(RegExp);

        expect(!L.validate(2353, schema).error).to.be.false();
        expect(!L.validate("ax", schema).error).to.be.false();
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

