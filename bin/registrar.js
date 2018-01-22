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

    function isValidDefinition(definition) {
        return Object
            .keys(definition)
            .reduce(function (result, key) {
                return result && isPropertyDef(definition[key]);
            }, true);
    }

    function buildSignetDuckTypeObject(definition) {
        return Object
            .keys(definition)
            .reduce(function (duckTypeObject, key) {
                duckTypeObject[key] = definition[key].typeName;
                return duckTypeObject;
            }, {});
    }


    const isUndefined = signet.isTypeOf('undefined');

    function defaultOrThrow(typeName, defaultValue) {
        const verifyValue = signet.verifyValueType(typeName);

        if(isUndefined(registry[typeName]) && isUndefined(defaultValue)) {
            throw new Error(`Type ${typeName} must have a default value`);
        }

        return !isUndefined(defaultValue)
            ? verifyValue(defaultValue)
            : undefined;
    }

    function buildDataDefProperty(definition) {
        return function (dataDefinition, key) {
            const propertyDef = definition[key];
            const typeName = propertyDef.typeName;
            const verifyValue = signet.verifyValueType(typeName);
            const defaultValue = propertyDef.defaultValue;

            dataDefinition[key] = {
                typeName: typeName,
                typeCheck: verifyValue,
                defaultValue: defaultOrThrow(typeName, defaultValue)
            };

            return dataDefinition;
        }
    }

    function buildDataDefinition(definition) {
        return Object
            .keys(definition)
            .reduce(buildDataDefProperty(definition), {});
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
