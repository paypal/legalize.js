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

var validators = ["any", "bool", "number", "string", "object", "func", "array"];

describe("default value", function() {

    validators.forEach(function (v) {
        it(v + "().default(...) should have given default value.", function () {
            var schema = L[v]().default("foobar").compile();
            expect(schema).to.have.property("defaultValue", "foobar");
        });
    });
});

describe("default presence", function() {

    validators.forEach(function (v) {
        it(v + "() should not have any default presence", function () {
            var schema = L[v]().compile();
            expect(schema).to.not.have.property("presence");
        });
    });
});

describe("required().forbidden() -> forbidden should overwrite presence", function() {

    validators.forEach(function (v) {
        it(v + "().required().forbidden() should have presence: `forbidden'", function () {
            var schema = L[v]().required().forbidden().compile();
            expect(schema).to.have.property("presence", "forbidden");
        });
    });
});

describe("required()", function() {

    validators.forEach(function (v) {
        it(v + "().required() should have presence: `required'", function () {
            var schema = L[v]().required().compile();
            expect(schema).to.have.property("presence", "required");
        });
    });
});

describe("forbidden()", function() {

    validators.forEach(function (v) {
        it(v + "().forbidden() should have presence: `forbidden'", function () {
            var schema = L[v]().forbidden().compile();
            expect(schema).to.have.property("presence", "forbidden");
        });
    });
});

describe("optional()", function() {

    validators.forEach(function (v) {
        it(v + "().optional() should have presence: `optional'", function () {
            var schema = L[v]().optional().compile();
            expect(schema).to.have.property("presence", "optional");
        });
    });
});

describe("valid() values", function() {

    validators.forEach(function (v) {
        it(v + "().valid(...).valid() should have given valid values.", function () {
            var schema = L[v]().valid(19).valid("qwerty").compile();
            expect(schema.valid).to.eql([19, "qwerty"]);
        });
    });
});

function checkSchemaBuilder(which) {
    return function (key) {
        it (which + "()." + key + " should be a function", function () {
            expect(L[which]()[key]).to.be.a('function');
        });

        it (which + "()." + key + " chained should still be a function", function () {
            expect(L[which]()[key]()[key]).to.be.a('function');
        });
    };
}

describe("object() schema builders", function () {
    [
        'keys',
        'type'
    ].forEach(checkSchemaBuilder("object"));
});

describe("number() schema builders", function () {
    [
        'min',
        'max',
        'lesser',
        'greater'
    ].forEach(checkSchemaBuilder("number"));
});

describe("string() schema builders", function () {
    [
        'minLength',
        'maxLength',
        'length',
        'match',
        'url'
    ].forEach(checkSchemaBuilder("string"));
});

describe("alternative() shorthand", function () {

    it("It compiles [ 'a', 'b', /^[a-z]+$/ ].", function () {

        var schema = [ 'a', 'b', /^[a-z]+$/ ];

        var compiledSchema = L.compile(schema);

        expect(compiledSchema).not.to.be.undefined();
    });

});
