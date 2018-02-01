'use strict';


const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');

describe('datafac', function () {
    require('./test-utils/approvals-config');

    let datafac;

    beforeEach(function() {
        const signet = require('signet')();
        datafac = require('../index')(signet);
    });

    it('should register and build a type', function() {
        datafac.register('foo', {
            foo: {
                type: 'string',
                defaultValue: 'bar'
            }
        });

        this.verify(prettyJson(datafac.build('foo')));
    });

    it('should register a type and build an array of values', function() {
        datafac.register('foo', {
            foo: {
                type: 'string',
                defaultValue: 'bar'
            }
        });

        this.verify(prettyJson(datafac.buildArrayOf('foo', 2)));
    });
});

