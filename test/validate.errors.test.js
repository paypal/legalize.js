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

describe("error reporting", function() {
    
    it("returns 'required_missing' error for missing required keys", function () {
        
        var schema = {
            a: L.string().required(),
            b: L.string().optional()
        };

        var result = L.validate({
            b: "foobar"
        }, schema);

        expect(!result.error).to.be.false();
        expect(result.error[0].type).to.be.equal('required_missing');
        expect(result.error[0].sourcePath).to.be.equal('/a');
    });

    it("returns 'invalid_value' error for invalid() required() value", function () {
        
        var schema = {
            x: L.any().invalid(17).required()
        };

        var result = L.validate({
            x: 17
        }, schema);

        console.log(result);

        expect(!result.error).to.be.false();
        expect(result.error[0].type).to.be.equal('invalid_value');
        expect(result.error[0].sourcePath).to.be.equal('/x');
    });

    it("'no_alternative_matched' is returned if alternatives() did not match", function () {

        var schema = [L.string(), L.number()];
        var result = L.validate(true, schema);

        expect(!result.error).to.be.false();
        expect(result.error[0].type).to.be.equal('no_alternative_matched');
    });

    it("no error is thrown if no any().invalid() value is encountered", function () {

        var schema = L.any().invalid(3).invalid(4);
        var result = L.validate(17, schema);

        console.log(result);
        expect(!result.error).to.be.true();
    });
});


