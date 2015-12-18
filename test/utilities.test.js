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

"use strict";

var expect = require("chai").expect;

var core = require("../src/legalize.js");

describe("utilities", function() {

    it("#isFunction should return true when given a function", function() {    
        expect(core.isFunction(function () {})).to.be.be.equal(true);
        expect(core.isFunction({})).to.be.be.equal(false);
    });

    it("#isFunction should return false when not given a function", function() {    
        expect(core.isFunction({})).to.be.be.equal(false);
        expect(core.isFunction("")).to.be.be.equal(false);
        expect(core.isFunction(undefined)).to.be.be.equal(false);
        expect(core.isFunction(null)).to.be.be.equal(false);
    });

    it("#isObject should return true if passed an object", function () {
        expect(core.isObject({})).to.be.equal(true);
    });

    it("#isObject should return false if passed `null'", function () {
        expect(core.isObject(null)).to.be.equal(false);
    });

    it("#isEmpty should return true for the empty string", function () {
        expect(core.isEmpty("")).to.be.equal(true);
    });

    it("#isEmpty should return true for the empty object", function () {
        expect(core.isEmpty({})).to.be.equal(true);
    });

    it("#isUndefined should return true for `undefined'", function () {
        expect(core.isUndefined(undefined)).to.be.equal(true);
    });

    it("#isUndefined should return true for `null'", function () {
        expect(core.isUndefined(null)).to.be.equal(true);
    });

    it("#isDefined should return false for `undefined'", function () {
        expect(core.isDefined(undefined)).to.be.be.equal(false);
    });

    it("#isDefined should return false for `null'", function () {
        expect(core.isDefined(null)).to.be.be.equal(false);
    });

    it("#getLength should return 2 for { a: ..., b: ... }", function () {
        expect(core.getLength({ a: null, b: null })).to.be.be.equal(2);
    });
    
    it("#getLength should return 10 for '0123456789'", function () {
        expect(core.getLength("0123456789")).to.be.be.equal(10);
    });

    it("#getLength should return 3 for `[1, 'hello', {}]'", function () {
        expect(core.getLength([1, 'hello', {}])).to.be.be.equal(3);
    });

    it("#getLength should return `undefined' if not object, array, or string", function () {
        expect(core.getLength(function () {})).to.be.undefined();
        expect(core.getLength(10e-3)).to.be.undefined();
    });

    it("#isNumber should return true when given a number", function () {
        expect(core.isNumber(17e-23)).to.be.be.equal(true);
        expect(core.isNumber(NaN)).to.be.be.equal(true);
    });

    it("#isNumber should return  when not given a number", function () {
        expect(core.isNumber("123")).to.be.be.equal(false);
        expect(core.isNumber(/hello/)).to.be.be.equal(false);
        expect(core.isNumber({})).to.be.be.equal(false);
    });

    it("#isNumeric should work for strings and numbers", function () {
        expect(core.isNumeric(3475)).to.be.be.equal(true);
        expect(core.isNumeric(34.5)).to.be.be.equal(true);
        expect(core.isNumeric("-23984")).to.be.be.equal(true);
        expect(core.isNumeric("34234")).to.be.be.equal(true);
        expect(core.isNumeric("34.3e+75")).to.be.be.equal(true);
        expect(core.isNumeric("34e75")).to.be.be.equal(true);
        expect(core.isNumeric("34e-75")).to.be.be.equal(true);
    });

    it("#isNumeric should not work for string that to not contain a number", function () {
        expect(core.isNumeric("sohrgo")).to.be.be.equal(false);
        expect(core.isNumeric(/hello/)).to.be.be.equal(false);
        expect(core.isNumeric({})).to.be.be.equal(false);
        expect(core.isNumeric("as3e4234")).to.be.be.equal(false);
        expect(core.isNumeric("as3e4234")).to.be.be.equal(false);
    });

    it("#isInteger should not work for numbers that are not integers", function () {
        expect(core.isInteger(31.9)).to.be.be.equal(false);
        expect(core.isInteger(NaN)).to.be.be.equal(false);
        expect(core.isInteger("39.3")).to.be.be.equal(false);
    });

    it("#isInteger should only work for numbers that are integers", function () {
        expect(core.isInteger(41.0)).to.be.be.equal(true);
        expect(core.isInteger("39.0")).to.be.be.equal(true);
        expect(core.isInteger("47")).to.be.be.equal(true);
    });

    it("#cast with target type = source type", function () {
        expect(core.cast("24234", "string")).to.be.equal("24234");
        expect(core.cast(34758, "number")).to.be.equal(34758);
        var array = [];
        expect(core.cast(array, "array")).to.be.equal(array);
        var object = {};
        expect(core.cast(object, "object")).to.be.equal(object);
    });

    it("#cast converts stringified boolean values", function () {
        expect(core.cast("true",  "boolean")).to.be.true();
        expect(core.cast("false", "boolean")).to.be.false();
    });

    it("#cast converts numeric boolean values", function () {
        expect(core.cast("1", "boolean")).to.be.true();
        expect(core.cast("0", "boolean")).to.be.false();
    });

    it("#cast returns undefined for object", function () {
        expect(core.cast("1", "object")).to.be.undefined();
    });

    it("#equals treats two NaN values as equal", function () {
        expect(core.equals(NaN, NaN)).to.be.true();
    });

});

