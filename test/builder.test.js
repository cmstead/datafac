'use strict';


// const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
// const sinon = require('sinon');

describe('builder', function () {
    require('./test-utils/approvals-config');

    let registrar;
    let builder;

    beforeEach(function () {
        const signet = require('signet')();
        registrar = require('../bin/registrar')(signet);
        builder = require('../bin/builder')(signet, registrar);
    });

    describe('build', function () {
        it('should build data from a simple definition', function () {
            const dataDef = {
                'foo': {
                    type: 'string',
                    defaultValue: 'bar'
                }
            };

            registrar.register('testObj', dataDef);

            const result = builder.build('testObj');

            this.verify(prettyJson(result, null, 4));
        });

        it('should build nested data types', function() {
            const fooDef = {
                foo: {
                    type: 'string',
                    defaultValue: 'bar'
                }
            };

            registrar.register('fooObj', fooDef);

            const bazDef = {
                baz: {
                    type: 'string',
                    defaultValue: 'quux'
                },
                foo: {
                    type: 'fooObj'
                }
            };

            registrar.register('bazObj', bazDef);

            const result = builder.build('bazObj');

            this.verify(JSON.stringify(result, null, 4));
        });

        it('should override default value when an object is passed', function() {
            const fooDef = {
                foo: {
                    type: 'string',
                    defaultValue: 'bar'
                },
                baz: {
                    type: 'string',
                    defaultValue: 'quux'
                }
            };

            registrar.register('fooObj', fooDef);

            const internalData = {
                foo: 'quux'
            };

            const result = builder.build('fooObj', internalData);

            this.verify(JSON.stringify(result, null, 4));
        });

        it('should perform override on nested definitions', function() {
            const fooDef = {
                foo: {
                    type: 'string',
                    defaultValue: 'bar'
                }
            };

            registrar.register('fooObj', fooDef);

            const bazDef = {
                baz: {
                    type: 'string',
                    defaultValue: 'quux'
                },
                foo: {
                    type: 'fooObj'
                }
            };

            registrar.register('bazObj', bazDef);

            const dataOptions = {
                baz: 'testing 1',
                foo: {
                    foo: 'testing 2'
                }
            };

            const result = builder.build('bazObj', dataOptions);

            this.verify(JSON.stringify(result, null, 4));
        });
    });

    describe('buildArrayOf', function() {
        it('should build an array of data from a simple definition', function () {
            const dataDef = {
                'foo': {
                    type: 'string',
                    defaultValue: 'bar'
                }
            };

            registrar.register('testObj', dataDef);

            const result = builder.buildArrayOf('testObj', 5);

            this.verify(prettyJson(result));
        });

        it('should pass data options through to data constructors', function() {
            const fooDef = {
                foo: {
                    type: 'string',
                    defaultValue: 'bar'
                },
                bar: {
                    type: 'string',
                    defaultValue: 'I am still here.'
                }
            };

            registrar.register('fooObj', fooDef);

            const bazDef = {
                baz: {
                    type: 'string',
                    defaultValue: 'quux'
                },
                foo: {
                    type: 'fooObj'
                }
            };

            registrar.register('bazObj', bazDef);

            const dataOptions = {
                baz: 'testing 1',
                foo: {
                    foo: 'testing 2'
                }
            };

            const result = builder.buildArrayOf('bazObj', 3, dataOptions);

            this.verify(JSON.stringify(result, null, 4));
        });
    });

});

