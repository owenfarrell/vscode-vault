'use strict';

import * as extest from 'vscode-extension-tester';

import delay from 'delay';

require('./vanilla');

require('./connect/native');
require('./connect/userpass');
require('./connect/github');

require('./browse/cubbyhole');
require('./browse/kv1');
require('./browse/kv2');

require('./read/kv1');
require('./read/kv2');

require('./write/kv1');
require('./write/kv2');

require('./delete/kv1');
require('./delete/kv2');

require('./disconnect/native');
require('./disconnect/userpass');

require('./reconnect/userpass');

require('./remove/native');

before(async function() {
    this.timeout(10000);

    const viewControl = await new extest.ActivityBar().getViewControl('Explorer');
    const view = await viewControl.openView();
    await delay(1000);
    const content = view.getContent();
    const sections = await content.getSections();
    sections.forEach(async(value: extest.ViewSection) => {
        await value.collapse();
    });
});

beforeEach(function() {
    return delay(50);
});
