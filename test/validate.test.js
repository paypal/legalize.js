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

describe("basic validations", function() {

    it("any() should accept anything", function () {
        var schema = L.any();

        expect(!L.validate("huhu", schema).error).to.be.true();
        expect(!L.validate(undefined, schema).error).to.be.true();
        expect(!L.validate(null, schema).error).to.be.true();
        expect(!L.validate(8923, schema).error).to.be.true();
        expect(!L.validate(133.4e-23, schema).error).to.be.true();
    });

    it("boolean() should accept booleans", function () {
        expect(!L.validate(true, L.boolean()).error).to.be.true();
        expect(!L.validate(false, L.boolean()).error).to.be.true();
    });
    
    [0, 1, 23.1e23, null, "true", "undefined", "false", "foobar", {}, { x: "qux" }, []]
      .forEach(function (x) {
        it("boolean() should reject " + x, function () {
            expect(!L.validate(x, L.boolean()).error).to.be.false();
        });
    });

    it("func() should accept functions", function () {
        expect(!L.validate(function () {}, L.func()).error).to.be.true();
    });

    [0, 1, 23.1e23, null, "true", "undefined", "false", "foobar", {}, { x: "qux" }, []]
      .forEach(function (x) {
        it("func() should reject " + x, function () {
            expect(!L.validate(x, L.func()).error).to.be.false();
        });
    });

    it("object() should accept objects", function () {
        var schema = L.object();
        
        expect(!L.validate({}, schema).error).to.be.true();
        expect(!L.validate({ x: null }, schema, {
            allowUnknown: true
        }).error).to.be.true();
        expect(!L.validate({ x: 38, z: "woop" }, schema, {
            allowUnknown: true
        }).error).to.be.true();
    });

    [0, 1, 23.1e23, null, "true", "undefined", "false", "foobar", function () {}, []]
      .forEach(function (x) {
        it("object() should reject " + x, function () {
            expect(!L.validate(x, L.object()).error).to.be.false();
        });
    });

    it("array() should accept arrays", function () {
        var schema = L.array();

        expect(!L.validate([], schema).error).to.be.true();
        expect(!L.validate([1, 2, 3], schema).error).to.be.true();
        expect(!L.validate([null, undefined], schema).error).to.be.true();
    });
    
    [0, 1, 23.1e23, null, "true", "undefined", "false", "foobar", function () {}, {}]
      .forEach(function (x) {
        it("array() should reject " + x, function () {
            expect(!L.validate(x, L.array()).error).to.be.false();
        });
    });

    it("string() should accept strings", function () {
        expect(!L.validate("foobar", L.string()).error).to.be.true();
    });

    [0, 1, 23.1e23, null, true, false, function () {}, {}, []]
      .forEach(function (x) {
        it("string() should reject " + x, function () {
            expect(!L.validate(x, L.string()).error).to.be.false();
        });
    });

    it("number() should accept numbers", function () {
        var schema = L.number();

        expect(!L.validate(2304, schema).error).to.be.true();
        expect(!L.validate(23.04, schema).error).to.be.true();
    });

    ["0", "1", "23.1e23", null, "true", "undefined", "false", "foobar", function () {}, {}, []]
      .forEach(function (x) {
        it("number() should reject " + x, function () {
            expect(!L.validate(x, L.number()).error).to.be.false();
        });
    });

    it("basic any().allow() validator with strings should accept correct values", function () {
        var result;        
        var schema = L.any().allow("hello").allow("world");

        result = L.validate("hello", schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.be.equal("hello");

        result = L.validate("world", schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.be.equal("world");        
    });

    it("basic any().valid() validator with strings should accept correct values", function () {
        var result;        
        var schema = L.any().valid("hello").valid("world");

        result = L.validate("hello", schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.be.equal("hello");

        result = L.validate("world", schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.be.equal("world");        
    });

    it("basic any().valid() validator with strings should report invalid values", function () {
        var result;        
        var schema = L.any().valid("hello").valid("world");

        result = L.validate("papageno", schema);

        expect(result.error).to.be.ok();
    });

    it("alias() should de-alias before any checks", function () {
        var schema = L.any().alias({
            'EN_us': 'US_en',
            'US_en': 'US_en',
            'EN':    'US_en',
            'en':    'US_en'
        });
        
        expect(L.validate("EN_us", schema).value).to.be.equal("US_en");
        expect(L.validate("US_en", schema).value).to.be.equal("US_en");
        expect(L.validate("EN", schema).value).to.be.equal("US_en");
        expect(L.validate("en", schema).value).to.be.equal("US_en");

    });

    function trim(x) {
        return x.trim();
    }

    it("sanitizeBefore() should be applied before de-aliasing", function () {
        var schema = L.any().alias({
            'EN_us': 'US_en',
            'US_en': 'US_en',
            'EN':    'US_en',
            'en':    'US_en'
        }).sanitizeBefore(trim);
        
        expect(L.validate("   EN_us", schema).value).to.be.equal("US_en");
        expect(L.validate("US_en   ", schema).value).to.be.equal("US_en");
        expect(L.validate("   EN   ", schema).value).to.be.equal("US_en");
        expect(L.validate("en", schema).value).to.be.equal("US_en");

    });

    it("sanitize() should be applied after everything else", function () {
        var schema = L.any().alias({
            'EN_us': 'US_en',
            'US_en': 'US_en',
            'EN':    'US_en',
            'en':    'US_en'
        }).sanitize(function (x) {
            return x.substring(0, 2);
        }).sanitizeBefore(trim);
        
        expect(L.validate("   EN_us", schema).value).to.be.equal("US");
        expect(L.validate("US_en   ", schema).value).to.be.equal("US");
        expect(L.validate("   EN   ", schema).value).to.be.equal("US");
        expect(L.validate("en", schema).value).to.be.equal("US");

    });


});

