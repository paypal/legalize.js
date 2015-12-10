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

describe("custom error reporting", function () {

    it("does propagate a custom warning from check() functions", function () {

        var schema = L.object().keys({

            a: L.number().check(function () { return true; }),
            b: L.number()

        }).check(function (obj) {
            if (obj.a === -obj.b) {
                return true;
            } else {
                obj.b = -obj.a;
                return { msgType: "custom_error" };
            }
        });

        var validationResult = L.validate({ a: 3, b: -4 }, schema);

        expect(validationResult.value).to.eql({ a: 3, b: -3 });
        expect(validationResult.warnings)
            .to.deep.have.property("[0].msgType", "custom_error");
    });

    it("does propagate custom warnings from check() functions", function () {

        var schema = L.object().check(function () {
            return [
                { msgType: "some_error" },
                "some_warning"
            ];
        });

        var options = {
            allowUnknown: true,
            warnUnknown: false
        };

        var validationResult = L.validate({ a: 3, b: -4 }, schema, options);

        expect(validationResult.warnings)
            .to.deep.have.property("[0].msgType", "some_error");
        expect(validationResult.warnings)
            .to.deep.have.property("[1].type", "some_warning");
    });


});

