(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';
    
    function datafacBuilder (signet) {
        const registrar = isNode ? require('./bin/registrar')(signet) : window.datafacDataRegistrar(signet);
        const builder = isNode ? require('./bin/builder')(signet, registrar) : window.datafacDataBuilder(signet, registrar);

        return moduleFactory(builder, registrar);
    }

    if (isNode) {
        module.exports = datafacBuilder;
    } else {
        window.datafacBuilder = datafacBuilder;
    }

})(function (builder, registrar) {
    'use strict';

    return {
        build: builder.build,
        buildArrayOf: builder.buildArrayOf,
        register: registrar.register,
        isRegistered: registrar.isRegistered
    };
});

