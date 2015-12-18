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
/* exported expect */
/* exported schema */
/* exported it */

"use strict";

var expect = require("chai").expect;

var L = require("../src/legalize-node.js");

describe("complex test scenarios", function () {

    it("calls a callback if provided with one", function (done) {

        L.validate({ a: "x" }, { a: L.number().required() },
          function (error) {
            expect(error).not.to.be.null();
            done();
        });
    });

    it("calls a callback if provided with one and with options", function (done) {

        L.validate({ a: "x" }, { a: L.number().required() }, {},
          function (error) {
            expect(error).not.to.be.null();
            done();
        });
    });

    it("forbidden value encountered @devel", function () {

        var validationResult = L.validate({ a: "x" }, { a: L.any().forbidden() }, {
            allowUnknown: true,
            warnUnknown: false
        });

        expect(validationResult)
            .to.deep.have.property("error[0].type", "forbidden_encountered");
    });
});
