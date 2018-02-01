Datafac - the dead simple system to keep your code and data in sync
=================================================================

Datafac is a powerful data definition and construction library built atop the [Signet](https://www.npmjs.com/package/signet) type system for Javascript. Through an easy-to-use interface you can quickly develop data models to drive your software. As the new models are constructed, associated types will be registered with Signet, making it easy to communicate your model out through type enforcement and signature strings.

When it comes time to test your application, Datafac is there for you to generate data from your models which means your tests will always reflect the state of your application. This means, your tests will be faster to write and easier to maintain since your test data will always reflect your application model. If your model needs to change in a breaking way, your tests will fail, telling you precisely where your code needs to be updated.

Finally, because Datafac registers your data both in the model system and the Signet type system, you can easily create rich, nested data models and guarantee the data you generate will always adhere to the types you expect. This removes the guesswork and simplifies the data construction story since nested models are automatically generated and linked together.

## Installation and Setup ##

To install datafac, simply open a terminal in your project and run the following command:

```
npm i datafac
```

In your project, create a new file to house your datafac model setup and do the following:

**Node:**

```javascript
const signet = require('signet')();
const datafac = require('datafac')(signet);

// type definitions go here!

module.exports = datafac;
```

If your setup is anything like mine, you will have already started creating types in signet in a separate type helper file which exports signet.  Your setup may look a little more like this:

```javascript
const signet = require('./path/to/type/helper');
const datafac = require('datafac')(signet);

// type definitions go here!

module.exports = datafac;
```

**Browser:**

```javascript
// Just start working. No setup is required!
// Be sure Signet is available in the browser.
```

## Registering New Models ##

Datafac models are straightforward to create and will verify all data types as you go. The goal is to make is easy to do the right thing and give meaningful messages when something goes wrong.  Following is an example of creating two models. The second model is composed with the first.

```javascript
datafac.register('myType', {
    property1: {
        type: 'string',
        defaultValue: 'This is a default string'
    },
    property2: {
        type: 'int',
        defaultValue: 999
    }
});

datafac.register('myCompositeType', {
    property3: {
        type: 'object',
        defaultValue: {}
    },
    property4: {
        type: 'myType'
    }
});
```

Please note, the composed property does not require a default value. By default, datafac will walk the data dependency tree and properly construct all data and return a fully resolved object. If you want to have more control than a static default value, you can define a constructor like this:

```javascript
datafac.register('myConstructedPropertyType', {
    myCompositeArray: {
        type: 'array<myCompositeType>',
        propertyConstructor: (dataOptions) => datafac.buildArrayOf('myCompositeType', 2, dataOptions);
    }
});
```

It is really important to ensure your data type matches the value you provide through construction or a default value.  Datafac checks all value types to ensure your data always aligns with your expectations.

## Building Data From Your Models ##

There are two ways to build data from models. The first is to call `datafac.build` which will return one fully constructed object. It is possible to pass a dataOptions object into the build function.  All replacement values will cascade through the build process. For clarity, see the example below:

```javascript
const typeName = 'myConstructedPropertyType';
const dataOptions = {
    myCompositeArray: {
        property4: {
            property1: "Not the default string"
        }
    }
};

const dataOutput = datafac.build(typeName, dataOptions);
```

This will result in the following:

```json
{
    "myCompositeArray": [
        {
            "property3": {},
            "property4": {
                "property1": "Not the default string",
                "property2": 999
            }
        },
        {
            "property3": {},
            "property4": {
                "property1": "Not the default string",
                "property2": 999
            }
        }
    ]
}
```

As seen in the example from the previous section, it is also possible to build an array of data by calling `datafac.buildArrayOf`.  The buildArrayOf method also allows for optional dataOptions. The example below will illustrate the outcome.

```javascript
const typeName = 'myType';
const numberOfElements = 3;
const dataOptions = {
    property2: 123
};

const dataOutput = datafac.buildArrayOf(typeName, numberOfElements, dataOptions);
```

The result of this operation would be as follows:

```json
[
    {
        "property1": "This is a default string",
        "property2": 123
    },
    {
        "property1": "This is a default string",
        "property2": 123
    },
    {
        "property1": "This is a default string",
        "property2": 123
    }
]
```

## Full API List ##

- build -- `typeName: type => object`
- buildArrayOf -- `typeName: type, count: [leftBoundedInt<1>] => array`
- register -- `definitionName:string, definition:object => undefined`

## Changelog ##

### V1.0.0 ###

Initial Release