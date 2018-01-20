'use strict';

const approvalsLocation = './test/approvals';
const approvalsConfig = require('approvals-config-factory')
    .buildApprovalsConfig({
        reporter: 'kdiff3'
    });

module.exports = {
    approvalsConfig: approvalsConfig,
    approvalsLocation: approvalsLocation
};
