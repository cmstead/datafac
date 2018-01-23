'use strict';

const { approvalsConfig, approvalsLocation } = require('./test-utils/approvals-config');
require('approvals').configure(approvalsConfig).mocha(approvalsLocation)

const assert = require('chai').assert;

const prettyJson = require('./test-utils/prettyJson');


describe('registrar', function () {
    let registrar;
    
    beforeEach(function () {
        const signet = require('signet')();
        registrar = require('../bin/registrar')(signet);
    });

    describe('register', function () {

        it('should register a type internally', function () {
            const dataDef = {
                value1: {
                    typeName: 'int',
                    defaultValue: 0
                },
                value2: {
                    typeName: 'string',
                    defaultValue: ''
                }
            };
            registrar.register('testObj', dataDef);

            const definition = registrar.getDefinition('testObj');

            this.verify(prettyJson(definition));
        });

        it('should prefer a data constructor over data', function() {
            const dataDef = {
                value1: {
                    typeName: 'string',
                    propertyConstructor: () => 'I am a string',
                    defaultValue: 'oh noes!!!'
                }
            };

            registrar.register('testObj', dataDef);

            const definition = registrar.getDefinition('testObj');

            this.verify(prettyJson(definition));
        });

        it('should throw an error if the data definition is invalid', function() {
            const dataDef = {
                value: {}
            };

            assert.throws(
                registrar.register.bind(null, 'foo', dataDef), 
                `Unable to register 'foo'. Definition is invalid, are all types defined? ${JSON.stringify(dataDef, null, 4)}`
            );
        });

        it('should throw an error if the data definition is already registered', function() {
            const dataDef = {
                value: {
                    typeName: 'string',
                    defaultValue: ''
                }
            };

            registrar.register('test1', dataDef);

            assert.throws(
                registrar.register.bind(null, 'test1', dataDef), 
                `Cannot register 'test1', a definition of that name already exists.`
            );
        });

        it('should throw an error if a default value is unacceptable', function() {
            const dataDef = {
                test: {
                    typeName: 'string',
                    defaultValue: 10
                }
            };

            assert.throws(registrar.register.bind(null, 'badDef', dataDef));
        });

        it('should throw an error if type is not registered and has no default value', function() {
            const dataDef = {
                test: {
                    typeName: 'string'
                }
            };

            assert.throws(registrar.register.bind(null, 'badDef', dataDef));
        });

    });

    describe('getDefinition', function() {
        
        it('should return a definition when called by name', function() {
            registrar.register('testType', {
                test1: {
                    typeName: 'string',
                    defaultValue: '' 
                }
            });

            this.verify(prettyJson(registrar.getDefinition('testType')));
        });

        it('should throw an error if the type does not exist', function() {
            assert.throws(
                registrar.getDefinition.bind(this, 'foo'),
                `No data definition, foo, exists.`)
        });

    });

    describe('isRegistered', function() {
        
        it('should return true if type definition is registered', function() {
            registrar.register('test1', {});
            assert.isTrue(registrar.isRegistered('test1'));
        });

        it('should return false if definition is not registered', function() {
            assert.isFalse(registrar.isRegistered('test1'));
        });

    });
});
