'use strict';


const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
const sinon = require('sinon');

const datafacBuilder = require('../bin/builder.js');

describe('builder', function () {
    require('./test-utils/approvals-config');
});

