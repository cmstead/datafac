(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    function datafacDataBuilder(signet, registrar) {
        return moduleFactory(signet, registrar);
    }

    if (isNode) {
        module.exports = datafacDataBuilder;
    } else {
        window.datafacDataBuilder = datafacDataBuilder;
    }

})(function (signet, registrar) {
    'use strict';

    function buildDefaultData(typeName, propertyDef, dataOption) {
        return registrar.isRegistered(typeName)
            ? build(typeName, dataOption)
            : propertyDef.propertyConstructor(dataOption);
    }

    function set(obj, key, value) {
        obj[key] = value;
        return obj;
    }

    function buildProperty(dataDef, dataOptions) {
        return function (result, key) {
            const propertyDef = dataDef[key];
            const dataOption = dataOptions[key];
            const typeName = propertyDef.type;

            const dataValue = buildDefaultData(typeName, propertyDef, dataOption);

            return set(result, key, dataValue);
        };
    }

    function build(typeName, dataOptions = {}) {
        const dataDef = registrar.getDefinition(typeName, dataOptions);
        return dataDef.__keys.reduce(buildProperty(dataDef, dataOptions), {});
    }

    function buildArrayOf(typeName, count = 1, dataOptions = {}) {
        let result = [];

        for (let i = 0; i < count; i++) {
            result.push(build(typeName, dataOptions));
        }

        return result;
    }

    return {
        build: signet.enforce(
            'typeName: type => object',
            build),
        buildArrayOf: signet.enforce(
            'typeName: type, count: [leftBoundedInt<1>] => array',
            buildArrayOf)
    };
});
