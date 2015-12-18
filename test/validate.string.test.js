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

describe("string validations", function() {
    
    it("string().matches(/^[0-9]+$/) accepts strings that match", function () {
        var schema = L.string().match(/^[0-9]+$/);

        expect(!L.validate("30485", schema).error).to.be.true();
    });
    
    it("string().matches(/^[0-9]+$/) rejects strings that do not match", function () {
        var schema = L.string().match(/^[0-9]+$/);

        expect(!L.validate("304a85", schema).error).to.be.false();
    });
    
    it("string().lowercase() matches lower case strings", function () {
        var schema = L.string().lowercase();

        expect(!L.validate("abcdef", schema).error).to.be.true();
    });

    it("string().lowercase() rejects strings that contain upper case letters", function () {
        var schema = L.string().lowercase();

        expect(!L.validate("abcDef", schema).error).to.be.false();
    });

    it("string().uppercase() matches upper case strings", function () {
        var schema = L.string().uppercase();

        expect(!L.validate("ABCDEF", schema).error).to.be.true();
    });

    it("string().uppercase() rejects strings that contain lower case letters", function () {
        var schema = L.string().uppercase();

        expect(!L.validate("abcDef", schema).error).to.be.false();
    });

    it("string().url() accepts urls", function () {
        expect(!L.validate("http://localhost/", L.string().url()).error).to.be.true();
    });
    
    it("string().url() rejects non-urls", function () {
        expect(!L.validate("www.localhost.com", L.string().url()).error).to.be.false();
    });
});

