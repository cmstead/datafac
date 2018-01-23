(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    function datafacDataRegistrar(signet) {
        return moduleFactory(signet);
    }

    if (isNode) {
        module.exports = datafacDataRegistrar;
    } else {
        window.datafacDataRegistrar = datafacDataRegistrar;
    }

})(function (signet) {
    'use strict';

    let registry = {};

    const isString = signet.isTypeOf('string');
    const isSignetType = typeName =>
        isString(typeName) && signet.isType(typeName);

    const isPropertyDef = signet.duckTypeFactory({
        typeName: isSignetType,
        defaultValue: '*'
    });

    function reduce(values, action, initialValue) {
        let result = initialValue;

        for (let i = 0; i < values.length; i++) {
            result = action(result, values[i]);
        }

        return result;
    }

    function isValidDefinition(definition) {
        const objKeys = Object.keys(definition);
        function checkPropertyDef(result, key) {
            return result && isPropertyDef(definition[key]);
        }

        return reduce(objKeys, checkPropertyDef, true);
    }

    function buildSignetDuckTypeObject(definition) {
        const objKeys = Object
            .keys(definition);

        function duckTypeReducer(duckTypeObject, key) {
            duckTypeObject[key] = definition[key].typeName;
            return duckTypeObject;
        }

        return reduce(objKeys, duckTypeReducer, {});
    }


    const isUndefined = signet.isTypeOf('undefined');

    function buildValueConstructor(verifyValue, defaultValue) {
        return function (newValue) {
            return !isUndefined(newValue)
                ? verifyValue(newValue)
                : defaultValue;
        }
    }

    function defaultOrThrow(typeName, defaultValue) {
        const verifyValue = signet.verifyValueType(typeName);

        if (isUndefined(registry[typeName]) && isUndefined(defaultValue)) {
            throw new Error(`Type ${typeName} must have a default value`);
        }

        return !isUndefined(defaultValue)
            ? buildValueConstructor(verifyValue, verifyValue(defaultValue))
            : undefined;
    }

    function buildDataDefProperty(definition, dataDefinition, key) {
        const propertyDef = definition[key];
        const typeName = propertyDef.typeName;
        const defaultValue = propertyDef.defaultValue;
        const propertyConstructor = propertyDef.propertyConstructor

        dataDefinition[key] = {
            typeName: typeName,
            propertyConstructor: !isUndefined(propertyConstructor)
                ? propertyConstructor
                : defaultOrThrow(typeName, defaultValue)
        };

        return dataDefinition;
    }

    const definitionPropBuilder =
        (definition) =>
            (definitionName, key) =>
                buildDataDefProperty(definition, definitionName, key);

    function buildDataDefinition(definition) {
        const objKeys = Object
            .keys(definition);

        return reduce(objKeys, definitionPropBuilder(definition), {});
    }

    function registerDuckType(definitionName, definition) {
        const signetDuckTypeObject = buildSignetDuckTypeObject(definition);
        signet.defineDuckType(definitionName, signetDuckTypeObject);
    }

    function registerDataDefinition(definitionName, definition) {
        registry[definitionName] = buildDataDefinition(definition);
    }

    function registerDefinition(definitionName, definition) {
        if (typeof registry[definitionName] !== 'undefined') {
            throw new Error(`Cannot register '${definitionName}', a definition of that name already exists.`);
        } else if (!isValidDefinition(definition)) {
            throw new Error(`Unable to register '${definitionName}'. Definition is invalid, are all types defined? ${JSON.stringify(definition, null, 4)}`);
        }

        registerDuckType(definitionName, definition);
        registerDataDefinition(definitionName, definition);
    }

    function getDefinition(definitionName) {
        const definition = registry[definitionName];

        if (typeof definition === 'undefined') {
            throw new Error(`No data definition, ${definitionName}, exists.`);
        }

        return definition;
    }

    function isRegisteredDefinition(definitionName) {
        return typeof registry[definitionName] !== 'undefined';
    }

    return {
        register: signet.enforce(
            'definitionName:string, definition:object => undefined',
            registerDefinition),
        getDefinition: signet.enforce(
            '* => definition:object',
            getDefinition),
        isRegistered: signet.enforce(
            'definitionName:string => boolean',
            isRegisteredDefinition)
    };
});
