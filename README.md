# Legalize.js

Lead Maintainer: [Jenny Warnke](https://github.com/jewar)

[![Build Status](https://travis-ci.org/paypal/legalize.js.svg?branch=master)](https://travis-ci.org/paypal/legalize.js)

Legalize.js is a library that performs validation of domain objects.
It does **not** perform validation of web forms. It is optimized for the
browser but can as well be used on the server side in a NodeJS environment.

## Build

    npm install
    grunt build
    
will build the library in `dist/legalize.min.js`.
It is around **`7KB minified`** and **`3KB minified+gzipped`**.

    npm check
    
will execute unit tests and check code coverage (report will be genereated
in `coverage/lcov-report/index.html`). The accepted threshold is **`≥ 90%`**.

## Use it in the browser

```HTML
<script src="legalize.min.js"></script>
<script>
var validationResult = Legalize.validate("given.something", Legalize.string().url());
</script>
```

### Use it using require.js

The library has an AMD (*asynchronous module definition*), so it works with
AMD loaders such as require.js.

## Use it in NodeJS

```JavaScript
var Legalize = require("legalize");
 
var validationResult = Legalize.validate(Math.PI, Legalize.number().integer());
```

## Quick Tutorial

Legalize basically consists of `Legalize.validate` and a bunch of schema builders.
You validate a value against a schema and in return you get an object with the
legalized value, error and warnings messages (if there are any).

Here is how you could validate an object:

```JavaScript
var personSchema = {
    firstName:
        Legalize.string().minLength(1).maxLength(30).required(),
    lastName:
        Legalize.string().minLength(1).maxLength(30).required(),
    age:
        Legalize.number().integer().min(18),
    sex:
        Legalize.string().sanitizeBefore(function (value) {
        		value.toLowerCase();
        }).valid("male", "female").optional(),
};

var validationResult = Legalize.validate({
    firstName: "Alexander",
    lastName: "Carnicero",
    age: 27
}, personSchema);

if (validationResult.error) {
    // report error here
} else {
	validationResult.warnings.forEach(function (warning) {
		// report warning
	});
	// validationResult.value contains validated value
}
```

## API

### `validate(value, schema, [options], [callback])`

Validates the given `value` against the given `schema`. Optionally takes an object
specifiying options (see below) and a callback. If `callback` is given, the function
will return `undefined` and invoke the given callback `callback(error, value, warnings)`.

The returned value is an object that contains the properties `error`, `value`, and `warnings`:

* `value` contains the validated value, stripped from everything that did not validate
* `error` contains one or more fatal errors which made validate reject the given value
* `warnings` contains an array of warnings (if any)

#### Options

* `strict` (*default: true*)
  * If set to false, validate will first try to convert values to the specified type. A warning will be issued instead.
  * If set to true, validate will reject values of the wrong types.
* `warnOnInvalidOptionals` (*default: true*)
  * If a value failed to validate but is optional or has a default value,
    this will issue a warning for the failed validation.
* `presence` (*default: "optional"*)
  * The default presence for keys in an object.
* `allowUnknown` (*default: false*)
  * Whether to allow unknown keys in objects or not.
* `stripUnknown` (*default: true*)
  * Whether unknown keys should be carried over or stripped.
* `warnUnknown` (*default: true*)
  * if `allowUnknown` is set - whether a warning should be issued or not when an unknown
    key is encountered.

Here is the schema for the `options` parameter:

```JavaScript
var optionSchema = compile({
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


```

#### Validation order

Validation is performed in the following order:

1. Check whether value is present or not (to satisfy `forbidden()`)
2. `sanitizeBefore()` (multiple `sanitizeBefore()` functions are invoked in the same order as specified)
3. `alias()` is applied
4. The type (`object()`, `string()`, `boolean()`) if not `any()` is checked or coerced (depending on `options.strict`)
5. `allow()` is checked
6. `valid()` is checked
7. `invalid()` is checked
8. all other checks are applied
9. `sanitize()` is applied (multiple `sanitize()` functions are invoked in the same order as specified)

## Schema Builders

The `Legalize` object provides a bunch of *schema builders* which you use to actually define your schema. The first schema builder specifies the general category. The next schema builders can be chained. Which ones are available is determined by the category:

> Legalize.*category*().*chain*().*chain*().*chain*()
    
Except for `alternatives` every schema builder also supports all chains from the `any` builder:

    Legalize.any().valid(1).valid(2).valid(3)
    
Works as well as

    Legalize.number().valid(1).valid(2).valid(3)
    
Most chains can be folded:

    Legalize.number().valid(1, 2, 3)

#### Shorthands

There are shorthands for `object().keys()`, `alternatives()`, and `string().match()`:

```JavaScript
Legalize.object().keys({
    x: Legalize.string().numeric()
})
// is the same as
{ x: Legalize.string().numeric() }
```
    
and

```JavaScript
Legalize.alternatives(
    Legalize.string().numeric(),
    Legalize.number().integer()
)
// is the same as
[ Legalize.string().numeric(),
  Legalize.number().integer() ]
```

and

```JavaScript
string().match(/^[0-9]+$/)
// is the same as
/^[0-9]+/
```

i.e. you can do

```JavaScript
Legalize.validate("8934758039", /^$/);
```

or

```JavaScript
var schema = {
	character: /^[a-z]$/
}
```

instead of

```JavaScript
var schema = Legalize.object().keys({
	character: Legalize.string().match(/^[a-z]$/)
}
```

Every value which is not a `RegExp`, an `Object`, or an `Array` will simply
be converted using `valid()`. This means that:

```JavaScript
var schema = Legalize.object().valid(1, 2);
```

can be expressed as

```JavaScript
var schema = [ 1, 2]
```

since that will translate into

```JavaScript
var schema = Legalize.alternatives(
    Legalize.valid(1),
    Legalize.valid(2)
);
```

which ultimately does the same thing as the first expression.

#### Shorthand Example

Instead of

```JavaScript
var schema = Legalize.object().keys({
    firstName:
        Legalize.string().match(/^[A-Z][a-z]+$/),
    lastName:
        Legalize.string().match(/^[A-Z][a-z]+$/),
    sex:
        Legalize.any().valid("male").valid("female"),
});
```

you can just use

```JavaScript
var schema = {
    firstName: /^[A-Z][a-z]+$/,
    lastName:  /^[A-Z][a-z]+$/,
    sex:      [ "male", "female" ]
};
```

#### When Not To Use Shorthands

Shorthands are a convenient way of quickly building schemas. If however you want to
specify things as for example `default()` or writing more complex schemas you need
to use the proper schema builders.

### `any`

#### `any.alias({ alias → sanitized })`

takes an object providing a mapping from `alias` values to `sanitized` values.

`alias()` is applied before `sanitizeBefore()`

#### `any.allow(...values)`

Allowed values are accepted without any further checks.

#### `any.valid(...values)`

Whitelists a value - if more then one valid value is specified, only one of these values may be accepted. Is performed after `alias()` and `sanitizeBefore()`.

#### `any.invalid(...values)`

Blacklists a value - if more then one value is specified, any of these values will always be rejected regardless of other checks.

#### `any.satisfy(function : value -> bool)`

Apply a custom validation function. The `value` is being passed as first (and only) argument. The function must return `true` or `false` (in the future this function may also return strings or complex objects which will be used for error reporting).

#### `any.required()`

Marks a key in an `object()` as required.

#### `any.optional()`

Marks a key in an `object()` as optional. If you want to issue warning for invalid optional keys, use `options.warnOnInvalidOptionals`.

#### `any.forbidden()`

Marks a key as strictly forbidden. Legalize will otherwise ignore any keys that it does not know.

#### `any.default(defaultValue)`

Sets the default value for a value.

#### `any.sanitize(function : value -> value)`

Applies a sanitization function to the validated value (happens after all checks).

#### `any.sanitizeBefore(function : value -> value)`

Applies a sanitization function to the unvalidated value (happens before all checks and also before `alias()`).

### `func()`

The value should be a function. This builder does not any special chains.

### `bool()` / `boolean()`

The value should be a boolean. This builder does not introduce any special chains.

### `number()`

Specifies that the target value should be a javascript number. Note that javascript numbers are actually floats no matter that. Use the chain `integer()` to restrict the number to integral values.

#### `number.min(number)`

#### `number.max(number)`

#### `number.lesser(number)`

#### `number.greater(number)`

#### `number.integer()`


### `string()`

#### `string.minLength(integer)`

Check that the string has the given minimum length (inclusive).

#### `string.maxLength(integer)`

Check that the string has the given maximum length (inclusive).

#### `string.length(integer)`

Check that the string has the given length.

#### `string.match(regex)`

Check that the string matches the given regular expression.

#### `string.lowercase()`

Checks that the string is all lowercase. Ignores non-alphabetic characters.

#### `string.uppercase()`

Checks that the string is all uppercase. Ignores non-alphabetic characters.

#### `string.url()`

Checks that the string contains a url.

#### `string.element()`

Checks whether the string refers to an element in the document with the string as `id`.

#### `string.alphanum()`

Check that the string is `/^[a-zA-Z0-9]+$/`.

#### `string.numeric()`

Check that the string is numeric (`String(Number(value)) === String(value)`)

#### `string.digits()`

Check that the string consists only of digits.

### `array`

#### `array.minLength(integer)`

#### `array.maxLength(integer)`

#### `array.length(integer)`

#### `array.unique`

Check that the array contains only unique values (checks only for `string()` and `number()` elements). `"3"` and `3` are considered equal in `unique()`.

### `object`

#### `object.minLength(integer)`

#### `object.maxLength(integer)`

#### `object.length(integer)`

#### `object.keys({keys})`

#### `object.type(type)`

Check that the object was constructed using the given constructor:

```JavaScript
Legalize.validate(/^...$/, object.type(RegExp));
Legalize.validate(new Whatever, object.type(Whatever));
```

#### `object.pattern(regExp)`

Regardless of the options `allowUnknown` and `stripUnknown` will accept keys matching the given
pattern and copy their associated values over to the legalized object.


### `alternatives(...alternatives)`

## Differences from hapijs/joi

The API of `Legalize` is inspired by the joi() API, but it differs in various aspects. Some, but not all, differences are:

* validate()
  * There is no `abortEarly` option in **`Legalize`**
  * There is no `warnOnInvalidOptionals` option in **`JOI`**

* basic schema builders
  * There is no `date()` in **`Legalize`**
  * There is no `binary()` in **`Legalize`**

* Sanitize
  * `alias()` is not available in **`JOI`**
  * `sanitize()` is not available in **`JOI`**
  * `sanitizeBefore()` is not available in **`JOI`**

* Chains
  * `min()` in **`JOI`** is `minLength()` in **`Legalize`** for `string()`, `array()`, and `object()`
  * same for `max()`
  * There is no `array().sparse()` in **`Legalize`**
