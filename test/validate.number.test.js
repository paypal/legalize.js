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

describe("number validations", function() {

    it("number.min(470) should accept 470", function () {
        expect(!L.validate(470, L.number().min(470)).error).to.be.true();
    });
    
    it("number.greater(470) should accept 471", function () {
        expect(!L.validate(471, L.number().greater(470)).error).to.be.true();
    });

    it("number.min(470) should accept 1470", function () {
        expect(!L.validate(1470, L.number().min(470)).error).to.be.true();
    });

    it("number.lesser(470) should accept 469", function () {
        expect(!L.validate(469, L.number().lesser(470)).error).to.be.true();
    });

    it("number.max(470) should accept 470", function () {
        expect(!L.validate(470, L.number().max(470)).error).to.be.true();
    });

    it("number.min(470).max(470) should accept 470", function () {
        expect(!L.validate(470, L.number().max(470)).error).to.be.true();
    });

    it("number.min(130).max(470) should accept 470", function () {
        expect(!L.validate(470, L.number().min(130).max(470)).error).to.be.true();
    });

    it("number.min(130).max(470) should accept 130", function () {
        expect(!L.validate(130, L.number().min(130).max(470)).error).to.be.true();
    });

    it("number.min(130).max(470) should accept 200", function () {
        expect(!L.validate(470, L.number().min(130).max(470)).error).to.be.true();
    });
    
    it("number.min(470) should reject 469", function () {
        expect(!L.validate(469, L.number().min(470)).error).to.be.false();
    });

    it("number.min(470) should reject -1470", function () {
        expect(!L.validate(-1470, L.number().min(470)).error).to.be.false();
    });

    it("number.max(470) should reject 471", function () {
        expect(!L.validate(471, L.number().max(470)).error).to.be.false();
    });

    it("number.min(470).max(470) should reject 471", function () {
        expect(!L.validate(471, L.number().max(470)).error).to.be.false();
    });

    it("number.min(470).max(470) should reject 469", function () {
        expect(!L.validate(469, L.number().min(470).max(470)).error).to.be.false();
    });

    it("number.min(130).max(470) should reject 471", function () {
        expect(!L.validate(471, L.number().min(130).max(470)).error).to.be.false();
    });

    it("number.min(130).max(470) should reject 129", function () {
        expect(!L.validate(129, L.number().min(130).max(470)).error).to.be.false();
    });

});

