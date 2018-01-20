(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

    function datafacDataBuilder(signet) {
        return moduleFactory(signet);
    }

    if(isNode) {
        module.exports = datafacDataBuilder;
    } else {
        window.datafacDataBuilder = datafacDataBuilder;
    }
    
})(function () {
    'use strict';
    // source code here
});
