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

/* global window */
/* global define */

(function (factory) {
    "use strict";

    var legalize = factory();

    // set globally for use with plain javascript
    if (typeof window !== "undefined") {
        window.Legalize = legalize;
    } else {
        this.Legalize = legalize;
    }

    // define module for use with requireJs
    if (typeof define === "function" && define.amd) {
        define("Legalize", [], legalize);
    }
}(function (undefined) {
    "use strict";

    function isFunc(f) {
        return typeof f === 'function';
    }

    // es5 shims
    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    var ES5Object = {

        freeze: isFunc(Object.freeze) ? Object.freeze : function (x) {
            // Object.freeze is used to freeze the publicly exposed API.
            // This will work on all modern browsers, so "attacking"
            // (= shooting yourself in the foot) the API will work only in legacy browsers.
            // Therefore: The shim just returns the thing and that's all it does.
            // This is the same behaviour as in github.com/es-shims/es5-shim .
            return x;
        },

        keys: isFunc(Object.keys) ? Object.keys : (function () {
            // Object.keys() is not available in some legacy browsers.
            // This shim is taken (and slightly modified to make jshint happy) from
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys

            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
            var dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];
            var dontEnumsLength = dontEnums.length;

            return function (obj) {
                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i += 1) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }()),

        create: isFunc(Object.create) ? Object.create : function (object) {
            // Object.create() is not available in some legacy browsers.
            // This is not a proper shim (for example it does not support a second argument).
            // The implementation here is however all that is needed for legalize.
            function F() {}
            F.prototype = object;

            return new F();
        }
    };

    var Legalize = (function (Object) {

        // the `Object` argument overloads the actual `Object` in legacy
        // browser engines. legalize uses exactly the functions defined
        // above. Node will not care as this file is only wrapped around
        // the library for the browser.

        /* jshint unused: false */
        var _Legalize = window.Legalize;

        // @include legalize.js

        /* global publiclyExposedInterface */
        return publiclyExposedInterface;

    }(ES5Object));

    return Legalize;
}));

