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

var L = require("../src/legalize-node.js");

describe("array validations", function() {

    it("array().length(3) should accept [1, 2, 3]", function () {
        var schema = L.array().length(3);
        var result = L.validate([1, 2, 3], schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.eql([1, 2, 3]);
    });

    it("array().length(3) should reject [1, 2]", function () {
        var schema = L.array().length(3);
        var result = L.validate([1, 2], schema);

        expect(!result.error).to.be.false();
    });

    it("array().length(3) should reject []", function () {
        var schema = L.array().length(3);
        var result = L.validate([], schema);

        expect(!result.error).to.be.false();
    });

    it("array().length(3) should reject ['a', 'b', 'c', 'd']", function () {
        var schema = L.array().length(3);
        var result = L.validate(['a', 'b', 'c', 'd'], schema);

        expect(!result.error).to.be.false();
    });
    
    it("array().minLength(3) should accept [1, 2, 3]", function () {
        var schema = L.array().minLength(3);
        var result = L.validate([1, 2, 3], schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.eql([1, 2, 3]);
    });

    it("array().minLength(3) should reject [1, 2]", function () {
        var schema = L.array().minLength(3);
        var result = L.validate([1, 2], schema);

        expect(!result.error).to.be.false();
    });

    it("array().minLength(3) should reject []", function () {
        var schema = L.array().minLength(3);
        var result = L.validate([], schema);

        expect(!result.error).to.be.false();
    });

    it("array().minLength(3) should accept ['a', 'b', 'c', 'd']", function () {
        var schema = L.array().minLength(3);
        var result = L.validate(['a', 'b', 'c', 'd'], schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.eql(['a', 'b', 'c', 'd']);
    });

    it("array().maxLength(3) should accept [1, 2, 3]", function () {
        var schema = L.array().maxLength(3);
        var result = L.validate([1, 2, 3], schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.eql([1, 2, 3]);
    });

    it("array().maxLength(3) should accept [1, 2]", function () {
        var schema = L.array().maxLength(3);
        var result = L.validate([1, 2], schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.eql([1, 2]);
    });

    it("array().maxLength(3) should accept []", function () {
        var schema = L.array().maxLength(3);
        var result = L.validate([], schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.eql([]);
    });

    it("array().maxLength(3) should reject ['a', 'b', 'c', 'd']", function () {
        var schema = L.array().maxLength(3);
        var result = L.validate(['a', 'b', 'c', 'd'], schema);

        expect(!result.error).to.be.false();
    });

    it("array().minLength(3).maxLength(3) should accept [1, 2, 3]", function () {
        var schema = L.array().minLength(3).maxLength(3);
        var result = L.validate([1, 2, 3], schema);

        expect(!result.error).to.be.true();
        expect(result.value).to.eql([1, 2, 3]);
    });

    it("array().minLength(3).maxLength(3) should reject [1, 2]", function () {
        var schema = L.array().minLength(3).maxLength(3);
        var result = L.validate([1, 2], schema);

        expect(!result.error).to.be.false();
    });

    it("array().minLength(3).maxLength(3) should reject []", function () {
        var schema = L.array().minLength(3).maxLength(3);
        var result = L.validate([], schema);

        expect(!result.error).to.be.false();
    });

    it("array().minLength(3).maxLength(3) should reject ['a', 'b', 'c', 'd']", function () {
        var schema = L.array().minLength(3).maxLength(3);
        var result = L.validate(['a', 'b', 'c', 'd'], schema);

        expect(!result.error).to.be.false();
    });

    it("array().includes(number()) accepts arrays of numbers", function () {
        var schema = L.array().includes(L.number());
        var result = L.validate([1, 2, 3, 4], schema);

        expect(!result.error).to.be.true();
    });

    it("array().includes(number()) rejects arrays which contain any non-number", function () {
        var schema = L.array().includes(L.number());
        var result = L.validate([1, 2, 'x', 4], schema);

        expect(!result.error).to.be.false();
    });

    it("array().includes(array(number()), array(string()))", function () {
        var result;
        var schema = L.array().includes(
            L.array().includes(L.number()),
            L.array().includes(L.string()));

        result = L.validate([], schema);

        expect(!result.error).to.be.true();

        result = L.validate([[1,2], [], ["hello"], [3]], schema);

        expect(!result.error).to.be.true();
    });

    it("array().excludes(number()) accepts arrays that do not contain numbers", function () {
        var result;
        var schema = L.array().excludes(L.number());

        result = L.validate([], schema);

        expect(!result.error).to.be.true();

        result = L.validate(["foo", [], "bar"], schema);

        expect(!result.error).to.be.true();
    });

    it("array().excludes(number()) rejects arrays that do contain numbers", function () {
        var result;
        var schema = L.array().excludes(L.number());

        result = L.validate([10, 20, 30], schema);

        expect(!result.error).to.be.false();

        result = L.validate(["foo", 1, "bar"], schema);

        expect(!result.error).to.be.false();
    });


    it("array().unique() accepts arrays with unique values only", function () {
        var result;
        var schema = L.array().unique();

        result = L.validate([1, 2, 3, "foo", "bar"], schema);

        expect(!result.error).to.be.true();
    });

    it("array().unique() rejects arrays with duplicates", function () {
        var result;
        var schema = L.array().unique();

        result = L.validate([1, 2, "foo", 3, "foo", "bar"], schema);

        expect(!result.error).to.be.false();
    });

});

