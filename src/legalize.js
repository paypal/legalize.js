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

// @exclude
"use strict";

/* global window, Legalize, _Legalize */
// @endexclude

var publiclyExposedInterface = {};

var REQUIRED = "required";
var OPTIONAL = "optional";
var FORBIDDEN = "forbidden";

function not(f) { return function (v) { return !f(v); }; }

function typeOf(value) {
    if (Array.isArray(value)) {
        return 'array';
    }
    if (value === null) {
        return 'null';
    }
    return typeof value;
}
function noConflict() {
    if (window.Legalize === Legalize) {
        window.Legalize = _Legalize;
    }
    return Legalize;
}
function cast(value, type) {
    if (typeOf(value) === type) {
        return value;
    }
    switch (type) {
        case 'string':  return String(value);
        case 'number':  return Number(value);
        case 'boolean':
            if (value === "true")    { return true;  }
            if (value === "false")   { return false; }
            return Boolean(Number(value));
        default:        return undefined;
    }
}
function isFunction(value)  { return typeOf(value) === 'function'; }
function isObject(value)    { return typeOf(value) === 'object'; }
function isNumber(value)    { return typeOf(value) === 'number'; }
function isString(value)    { return typeOf(value) === 'string'; }
function isArray(value)     { return typeOf(value) === 'array'; }
function isUndefined(value) { return value === null || value === undefined; }
function isNumeric(value)   {
    var number = Number(value);
    // typeof number === "number", but `number` can be `NaN` (if value was not
    // numeric) NaN has a special property: It is the only thing which is not
    // equal to itself. So checking for whether `number` is not NaN will reveal
    // whether `value` was numeric or not.
    return number === number;
}
function isInteger(value)   { return parseInt(value) === Number(value); }
function getLength(thing) {
    if (isArray(thing) || isString(thing)) { return thing.length; }
    if (isObject(thing))                   { return Object.keys(thing).length; }
    return undefined;
}
function isEmpty(value)     { return isUndefined(value) || getLength(value) === 0; }
function is(value, type)    { return value instanceof type; }

var isDefined = not(isUndefined);

// `applyEach` takes an array or an object `thing` and a function `func`.
// `func` is applied on every element in `thing` with its result
// replacing the original element.
function applyEach(thing, func) {
    var i;
    if (isArray(thing)) {
        for (i = 0; i < thing.length; i += 1) {
            thing[i] = func(thing[i], i);
        }
    } else {
        var keys = Object.keys(thing);
        for (i = 0; i < keys.length; i += 1) {
            var key = keys[i];
            thing[key] = func(thing[key], key);
        }
    }
}

// `forEach` takes an array or an object `thing` and a function `func`.
// `func` is applied on every element in `thing`.
// `forEach` will leave the original `thing` unchanged. It is expressed
// in terms of `applyEach` by having the functions passed to `applyEach`
// returning the original value, not the result of applying `func` to
// the elements.
function forEach(thing, func) {
    applyEach(thing, function (value, key) {
        func(value, key);
        return value;
    });
}

function merge() {
    var obj = {};
    for (var i = 0; i < arguments.length; i += 1) {
        var obj2 = arguments[i];
        forEach(obj2, function (value, key) {
            if (isArray(obj[key])) {
                var add = function (e) { obj[key].push(e); };
                if (isArray(value)) {
                    value.forEach(add);
                } else {
                    add(value);
                }
            } else if (isObject(obj[key]) && isObject(value)) {
                obj[key] = merge(obj[key], value);
            } else {
                obj[key] = value;
            }
        });
    }
    return obj;
}

function copy(obj, obj2) {
    if (isObject(obj2)) {
        forEach(obj2, function (value, key) {
            obj[key] = obj2[key];
        });
    }
    return obj;
}

function equals(left, right) {
    if (!isArray(left) && !isObject(left)) {
        return left === right || (left !== left && right !== right);
    }
    if (getLength(left) !== getLength(right)) {
        return false;
    }
    var allKeys = merge({ x: Object.keys(left) }, { x: Object.keys(right) }).x;
    for (var i = 0; i < allKeys.length; i += 1) {
        var key = allKeys[i];
        if (!equals(left[key], right[key])) {
            return false;
        }
    }
    return true;
}

// compile() will transform a schemaBuilder (marked with _isSchemaBuilder)
// into a schema (marked with _isSchema).
//
// Additionally it supports certain shorthands:
// - A RegExp -> string().match(thatRegex)
// - An Array -> alternatives(...)
// - An Object -> object().keys(...)
//
// All other kinds of values are just compiled using any().valid().
function compile(schema) {
    if (schema._isSchema) {
        // already a compiled schema, nothing to be done here.
        return schema;
    }
    if (schema._isSchemaBuilder && isFunction(schema.compile)) {
        // it is a schema builder and it can be compiled, so do it
        return schema.compile();
    }
    if (is(schema, RegExp)) {
        return publiclyExposedInterface.string().match(schema).compile();
    }
    if (isArray(schema)) {
        var alternatives = publiclyExposedInterface.alternatives;
        return alternatives.apply(publiclyExposedInterface, schema).compile();
    }
    if (isObject(schema)) {
        return publiclyExposedInterface.object().keys(schema).compile();
    }
    return publiclyExposedInterface.any().valid(schema).compile();
}

function makeSchemaBuilder(arg, validators) {
    return function () {
        var expected = Array.prototype.slice.call(arguments);
        var obj = Object.create(this);
        var parent = this;
        copy(obj, validators);
        obj.compile = function (isNotTopLevel) {
            var schema = merge(parent.compile(true), isFunction(arg) ? arg(expected) : arg);
            if (!isNotTopLevel) {
                var doCompile = function (schema) {
                    return compile(schema);
                };
                applyEach(schema.includes, doCompile);
                applyEach(schema.excludes, doCompile);
                applyEach(schema.keys, doCompile);
                applyEach(schema.alternatives, doCompile);
            }
            schema._isSchema = true;
            return schema;
        };
        return obj;
    };
}

function makeProperty(property) {
    return makeSchemaBuilder(function (expected) {
        var obj = {};
        obj[property] = expected[0];
        return obj;
    });
}

function makeArrayProperty(property) {
    return makeSchemaBuilder(function (expected) {
        var obj = {};
        obj[property] = expected;
        return obj;
    });
}

function makeCheck(predicate) {
    return makeSchemaBuilder(function (expected) {
        return {
            checks: function (actual) {
                return predicate(actual, expected[0]);
            }
        };
    });
}

function makeMatchCheck(pattern) {
    return makeCheck(function (actual) {
        return pattern.test(actual);
    });
}

function bind(thisArg, func) {
    // this is actually a very simple shim, so bind also works
    // in legacy browsers.
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return func.apply(thisArg, args);
    };
}

function withLengthChecks(validators) {
    return merge(validators, {
        minLength: makeCheck(function (actual, expected) {
            return getLength(actual) >= expected;
        }),

        maxLength: makeCheck(function (actual, expected) {
            return getLength(actual) <= expected;
        }),

        length: makeCheck(function (actual, expected) {
            return getLength(actual) === expected;
        })
    });
}

function rootSchema() {
    return {
        allowed: [],
        valid: [],
        invalid: [],
        checks: [],
        checksAfter: [],
        alias: {},
        keys: {},
        includes: [],
        excludes: [],
        alternatives: [],
        sanitizeBefore: [],
        sanitize: [],
        pattern: null,
        _isSchema: true
    };
}

var rootSchemaBuilder = {
    _isSchemaBuilder: true,
    compile: rootSchema,

    notEmpty: makeCheck(not(isEmpty)),

    allow:    makeArrayProperty('allowed'),
    valid:    makeArrayProperty('valid'),
    invalid:  makeArrayProperty('invalid'),
    alias:    makeProperty('alias'),
    check:    makeArrayProperty('checksAfter'),
    satisfy:  makeArrayProperty('checks'),
    sanitize: makeArrayProperty('sanitize'),
    sanitizeBefore: makeArrayProperty('sanitizeBefore'),

    required:  makeSchemaBuilder({ presence: REQUIRED }),
    optional:  makeSchemaBuilder({ presence: OPTIONAL }),
    forbidden: makeSchemaBuilder({ presence: FORBIDDEN }),

    default: makeProperty('defaultValue')
};

var any  = makeSchemaBuilder({});

var bool = makeSchemaBuilder({
    type: 'boolean'
});

var func = makeSchemaBuilder({
    type: 'function'
});

var number = makeSchemaBuilder({
    type: 'number'
}, {
    min: makeCheck(function (actual, expected) {
        return actual >= expected;
    }),

    max: makeCheck(function (actual, expected) {
        return actual <= expected;
    }),

    greater: makeCheck(function (actual, expected) {
        return actual > expected;
    }),

    lesser: makeCheck(function (actual, expected) {
        return actual < expected;
    }),

    integer: makeCheck(isInteger)

});

var string = makeSchemaBuilder({
    type: 'string'
}, withLengthChecks({

    match: makeCheck(function (actual, expected) {
        return new RegExp(expected).test(actual);
    }),

    insensitive: makeSchemaBuilder({ insensitive: true }),

    lowercase: makeCheck(function (actual) {
        actual = String(actual);
        return actual.toLowerCase() === actual;
    }),

    uppercase: makeCheck(function (actual) {
        actual = String(actual);
        return actual.toUpperCase() === actual;
    }),

    alphanum: makeMatchCheck(/^[0-9a-zA-Z]*$/),

    url: makeMatchCheck(
        /^https?:\/\/(\w+:?\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/),

    element: makeCheck(function (actual) {
        return !!window.document.getElementById(actual);
    }),

    digits: makeCheck(/^[0-9]*$/),

    numeric: makeCheck(isNumeric)
}));

var array = makeSchemaBuilder({
    type: 'array'
}, withLengthChecks({

    unique: makeCheck(function (actual) {
        var hash = {};
        for (var i = 0; i < actual.length; i += 1) {
            var value = actual[i];
            if (isNumber(value) || isString(value)) {
                if (hash[value]) {
                    return false;
                }
                hash[value] = true;
            }
        }
        return true;
    }),

    includes: makeArrayProperty('includes'),

    excludes: makeArrayProperty('excludes'),

}));

var object = makeSchemaBuilder({
    type: 'object'
}, withLengthChecks({

    keys: makeProperty("keys"),

    type: makeCheck(is),

    pattern: makeProperty("pattern")

}));

var alternatives = makeArrayProperty('alternatives');

// need to be defined here, so jslint does not complain.
// these are assigned at the bottom since they use the
// publiclyExposedInterface, which is not assigned yet.
var optionSchema, defaultOptions;

function validate(value, schema, options, callback) {

    // prepare callback: it is either in the fourth or third argument
    // or there exists none (in that case set `callback` to `null`).
    callback = isFunction(callback) ?
        callback : (isFunction(options) ? options : null);

    // prepare options: either there is an object in the third argument - or not.
    options = isObject(options) ? options : {};

    // if the given options are not empty, assume the defaults
    if (isEmpty(options)) {
        options = defaultOptions;
    }

    // if the given options are not empty, validate 'em
    // the check is necessary as we would be calling ourselves
    // endlessley while validating the options in a neverending
    // call to validate.
    else {
        var validationResult = validate(options, optionSchema);
        if (validationResult.error) {
            throw new Error(validationResult.error);
        }
        options = validationResult.value;
    }

    // compile the schema - compile will check whether schema is
    // already compiled.
    schema = compile(schema);

    // warnings array will be populated
    var warnings = [];

    // A helper that is recursively applied along the object.
    //
    // Returns the validated value (or the default, if there is one,
    // in case the validation failed).
    function _validate(value, schema, path) {

        // calculate the type of the value - see `typeOf`.
        var actualType = typeOf(value);

        // calculate the presence requirement.
        // If the schema does not specify one, assume the default presence.
        var presence = schema.presence || options.presence;

        // the defaultValue - we will need this in a lot of places.
        // defaultValue may actually be undefined.
        var defaultValue = schema.defaultValue;

        var expectedType = schema.type;

        // creates an object containing a bunch of information
        function makeInfoMessageObject(type, expected, actual) {
            return {
                type: type,
                expected: expected,
                actual: actual,
                sourcePath: path,
                sourceValue: value
            };
        }

        // issues a warning in the warnings-array
        function issueWarning(warning, expected, actual) {
            warnings.push(isObject(warning) ? warning :
                    makeInfoMessageObject(warning, expected, actual));
        }

        // creates an errorneous return value
        function makeError(validValue, error, expected, actual) {
            var info = makeInfoMessageObject(error, expected, actual);

            if (isDefined(defaultValue) &&
                    presence === OPTIONAL &&
                    options.warnOnInvalidOptionals) {
                issueWarning(info);
                return makeValue(validValue);
            }
            return {
                error: info,
                value: validValue
            };
        }

        // creates a simple, valid return value
        function makeValue(validValue) {
            return { value: validValue };
        }

        // loop variables. due to hoisting will end up here anyway.
        var i = 0, j = 0;

        // if the current value is actually nonexistent:
        if (actualType === 'undefined') {
            if (presence === OPTIONAL) {
                // it's alright if presence is OPTIONAL
                // just return the default (which may be undefined, which is alright)
                return makeValue(defaultValue);
            }
            if (presence === REQUIRED) {
                return makeError(undefined, 'required_missing');
            }
            // if FORBIDDEN -> we're fine, just return
            return makeValue();
        }

        // Known at this point:
        // - `value` is not undefined

        // if FORBIDDEN we're facing a situation here:
        if (presence === FORBIDDEN) {
            return makeError(undefined, 'forbidden_encountered');
        }

        // is it a union type?
        var alternatives = schema.alternatives;
        if (!isEmpty(alternatives)) {
            for (i = 0; i < alternatives.length; i += 1) {
                var alternative = alternatives[i];
                var result = _validate(value, alternative, path);
                if (!result.error) {
                    return result;
                }
            }
            return makeError(defaultValue, 'no_alternative_matched');
        }

        // apply sanitizeBefore
        forEach(schema.sanitizeBefore, function (sanitizer) {
            value = sanitizer(value);
        });

        // Translate aliases before
        var alias = schema.alias;
        if (isDefined(alias[value])) {
            value = alias[value];
        }

        // At this point: alias() definitions have been applied.

        // if the schema prescribes a type for the value
        // and the actual type and the prescribed type do not match
        if (isDefined(expectedType) && actualType !== expectedType) {

            // when strict: mismatching types cause errors
            if (options.strict) {
                return makeError(defaultValue, 'mismatching_types',
                                 expectedType, actualType);
            }

            // if not strict (we returned already) issue a warning
            issueWarning('mismatching_types', expectedType, actualType);

            // also cast the value to the respective type
            value = cast(value, expectedType);
        }

        // Known at this point:
        // - `value` is of type `expectedType` (or `any`)

        var allowed = schema.allowed;
        for (i = 0; i < allowed.length; i += 1) {
            if (equals(allowed[i], value)) {
                return makeValue(value);
            }
        }
        var invalid = schema.invalid;
        for (i = 0; i < invalid.length; i += 1) {
            if (equals(invalid[i], value)) {
                return makeError(defaultValue, 'invalid_value');
            }
        }
        var valid = schema.valid;
        if (!isEmpty(valid)) {
            // the subtle difference between `allows` and `valid` is that
            // if a value is not in the list of valid values, validation will
            // fail. `allows` on the other hand will simply accepts values
            // while still allowing other checks to accept the value.
            for (i = 0; i < valid.length; i += 1) {
                if (equals(valid[i], value)) {
                    return makeValue(value);
                }
            }
            return makeError(defaultValue, 'not_a_valid_value');
        }

        // Known at this point:
        // - `value` is not in the set of `allowed` values
        // - `value` is not in the set of `valid` values
        // - `value` is not in the set of `invalid` values

        // iterate over all checks and check whether the value satisfies them or not
        var checksFailed = [];
        forEach(schema.checks, function (check) {
            var checkResult;
            try {
                // invoking a user-defined function, therefore the try..catch
                checkResult = check(value);
            } catch (err) {
                console.log("Error while executing user-defined function");
                console.log(err);
                return false;
            }
            if (checkResult === true) {
                return;
            }
            if (!isObject(checkResult)) {
                checkResult = makeInfoMessageObject("check_failed");
            }
            checksFailed.push(checkResult);
        });

        // did we encounter any failing checks?
        if (!isEmpty(checksFailed)) {
            return makeError(defaultValue, 'checks_failed');
        }

        // objects are special as they require to recursively descend into them
        if (expectedType === 'object') {

            var validObject = {};
            var objectErrors = [];

            forEach(schema.keys, function (val, key) {
                var validationResult = _validate(value[key], val, path + "/" + key);
                if (validationResult.error) {
                    var keyPresence = val.presence || options.presence;
                    if (keyPresence === OPTIONAL && options.warnOnInvalidOptionals) {
                        issueWarning(validationResult.error);
                    } else {
                        objectErrors.push(validationResult.error);
                    }
                }
                validObject[key] = validationResult.value;
            });

            var pattern = is(schema.pattern, RegExp) ? schema.pattern : null;
            forEach(value, function (val, key) {
                if (!schema.keys[key]) {
                    var message = makeInfoMessageObject('unknown_key', undefined, key);
                    var preserve = !options.stripUnknown;
                    if (pattern && pattern.test(key)) {
                        preserve = true;
                    } else if (options.allowUnknown) {
                        if (options.warnUnknown) {
                            issueWarning(message);
                        }
                    } else {
                        objectErrors.push(message);
                    }
                    if (preserve) {
                        value[key] = val;
                    }
                }
            });

            if (!isEmpty(objectErrors)) {
                return makeError(validObject, objectErrors);
            }

            // the value we are working with is now the `validObject`
            value = validObject;
        }

        // arrays are special just like objects - but different
        else if (expectedType === 'array') {

            var validArray = [];
            var arrayErrors = [];
            var includes = schema.includes;
            var excludes = schema.excludes;

            // if `includes` is set, check that every value satisfies any includes schema.
            if (!isEmpty(includes)) {
                forEach(value, function (elem) {
                    var validationResult;
                    var passedIncludes = false;
                    for (j = 0; j < includes.length; j += 1) {
                        validationResult = _validate(elem, includes[j], path + "/" + i);
                        // in case of no error -> value satisfies one includes schema.
                        if (!validationResult.error) {
                            passedIncludes = true;
                            break;
                        }
                    }
                    if (!passedIncludes) {
                        arrayErrors.push(validationResult.error);
                    } else {
                        validArray.push(validationResult.value);
                    }
                });
            }

            // otherwise if `excludes` is set, check that every value does not satisfy
            // any excludes schema.
            else if (!isEmpty(excludes)) {
                forEach(value, function (elem) {
                    var validationResult;
                    var passedExcludes = true;
                    for (j = 0; j < excludes.length; j += 1) {
                        validationResult = _validate(elem, excludes[j], path + "/" + i);
                        // in case of no error -> value violates one excludes schema.
                        if (!validationResult.error) {
                            passedExcludes = false;
                            break;
                        }
                    }
                    if (!passedExcludes) {
                        arrayErrors.push(makeInfoMessageObject('matched_excluded_type'));
                    } else {
                        validArray.push(validationResult.value);
                    }
                });
            }

            // if neither `includes` nor `excludes` are set, do assume value
            // to be the validArray.
            else {
                validArray = value;
            }

            if (!isEmpty(arrayErrors)) {
                return makeError(validArray, arrayErrors);
            }

            // the value we are working with is now the `validArray`
            value = validArray;
        }

        // iterate over all checksAfter and check whether the value is ok or not
        function customWarning(checkResult) {
            if (isArray(checkResult)) {
                forEach(checkResult, function (result) {
                    customWarning(result);
                });
            }
            else if (isString(checkResult)) {
                customWarning(makeInfoMessageObject(checkResult));
            }
            else if (isObject(checkResult)) {
                issueWarning(copy(makeInfoMessageObject(), checkResult));
            }
        }
        forEach(schema.checksAfter, function (check) {
            var checkResult;
            try {
                // invoking a user-defined function, therefor the try..catch
                checkResult = check(value);
            } catch (err) {
                console.log("Error while executing user-defined function");
                console.log(err);
                return false;
            }
            if (checkResult === true) {
                return;
            }
            customWarning(checkResult);
        });

        // Known at this point:
        // - `value` passed all checks

        // apply sanitizeAfter
        forEach(schema.sanitize, function (sanitizer) {
            value = sanitizer(value);
        });

        // hooray! If we did not return with an error yet, we are fine!
        return makeValue(value);
    }

    var theResult = _validate(value, schema, "");

    function flatten(error, errors) {
        if (isArray(error.type)) {
            forEach(error.type, function (error) {
                flatten(error, errors);
            });
        } else {
            errors.push(error);
        }
        return errors;
    }

    var errors = theResult.error ? flatten(theResult.error, []) : null;
    var legalValue = theResult.value;
    warnings = isEmpty(warnings) ? null : warnings;

    if (!isFunction(callback)) {
        return { error: errors, value: legalValue, warnings: warnings };
    }
    setTimeout(function () {
        callback(errors, legalValue, warnings);
    }, 0);
}


publiclyExposedInterface = Object.freeze({

    any:        bind(rootSchemaBuilder, any),
    bool:       bind(rootSchemaBuilder, bool),
    boolean:    bind(rootSchemaBuilder, bool),
    number:     bind(rootSchemaBuilder, number),
    string:     bind(rootSchemaBuilder, string),
    object:     bind(rootSchemaBuilder, object),
    array:      bind(rootSchemaBuilder, array),
    func:       bind(rootSchemaBuilder, func),

    alternatives:  bind(rootSchemaBuilder, alternatives),

    compile: compile,
    validate: validate,

    typeOf: typeOf,
    noConflict: noConflict
});

optionSchema = compile({
    allowUnknown:
        publiclyExposedInterface.bool().default(false),
    stripUnknown:
        publiclyExposedInterface.bool().default(true),
    warnUnknown:
        publiclyExposedInterface.bool().default(true),
    strict:
        publiclyExposedInterface.bool().default(true),
    warnOnInvalidOptionals:
        publiclyExposedInterface.bool().default(true),
    presence:
        publiclyExposedInterface.any()
            .valid(OPTIONAL).valid(REQUIRED).valid(FORBIDDEN)
            .default(OPTIONAL)
});

defaultOptions = {
    allowUnknown: false,
    stripUnknown: true,
    warnUnknown: true,
    strict: true,
    warnOnInvalidOptionals: true,
    presence: OPTIONAL
};

// @exclude
module.exports = {

    isFunction: isFunction,
    isObject: isObject,
    isNumber: isNumber,
    isString: isString,
    isDefined: isDefined,
    isUndefined: isUndefined,
    isEmpty: isEmpty,
    isArray: isArray,
    isNumeric: isNumeric,
    isInteger: isInteger,

    getLength: getLength,

    cast: cast,
    copy: copy,
    equals: equals,
    merge: merge,

    publiclyExposedInterface: publiclyExposedInterface
};
// @endexclude
