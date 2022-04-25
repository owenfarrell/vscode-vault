/* eslint-disable no-unused-expressions */
'use strict';

import * as constants from '../constants';
import * as extest from 'vscode-extension-tester';
import * as uuid from 'uuid';

import { afterSuite, beforeSuite } from 'mocha-suite-hooks';

import delay from 'delay';
import { expect } from 'chai';

describe('Writing to a KV Version 2 Engine Path', function() {
    let view: extest.SideBarView;
    context('when the Explorer view is open', function() {
        before(async function() {
            const viewControl = await new extest.ActivityBar().getViewControl('Explorer');
            view = await viewControl.openView();
            await delay(1000);
        });

        let section: extest.ViewSection;
        context('when the Vaults section exists', function() {
            before(async function() {
                section = await view.getContent().getSection('Vaults');
                expect(section).not.to.be.undefined;
            });

            context('when the Vaults section is expanded', function() {
                before(async function() {
                    await section.expand();
                });

                context('when a server tree item exists', function() {
                    let serverTreeItem: extest.TreeItem;

                    async function refreshServer() {
                        const viewItem = await section.findItem(constants.WRITE_VAULT_NAME, 1);
                        if (viewItem instanceof extest.TreeItem) {
                            serverTreeItem = viewItem;
                        }
                        expect(serverTreeItem).not.to.be.undefined;
                    }

                    before(async function() {
                        await refreshServer();
                    });

                    after(async function() {
                        if (serverTreeItem) {
                            await serverTreeItem.collapse();
                        }
                    });

                    context('when the path to a writeable secret is expanded', function() {
                        let pathTreeItem: extest.TreeItem;
                        const refreshPath = async function() {
                            await refreshServer();

                            let mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV2_MOUNT_POINT);
                            expect(mountPointTreeItem).not.to.be.undefined;
                            if (await mountPointTreeItem.isExpanded() === false) {
                                await mountPointTreeItem.select();
                                await delay(50);
                                mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV2_MOUNT_POINT);
                            }
                            expect(await mountPointTreeItem.isExpanded()).to.be.true;

                            pathTreeItem = await mountPointTreeItem.findChildItem(constants.WRITE_KV2_RELATIVE_PATH);
                            expect(pathTreeItem).not.to.be.undefined;
                            if (await pathTreeItem.isExpanded() === false) {
                                await pathTreeItem.select();
                                await delay(50);
                                pathTreeItem = await mountPointTreeItem.findChildItem(constants.WRITE_KV2_RELATIVE_PATH);
                            }
                            expect(await pathTreeItem.isExpanded()).to.be.true;
                        };

                        before(refreshPath);

                        context('when writing a new secret', function() {
                            let input: extest.InputBox;
                            beforeSuite(async function() {
                                await extest.VSBrowser.instance.driver.actions().mouseMove(pathTreeItem).perform();
                                const actionButton = await pathTreeItem.getActionButton('Write Secret');
                                await actionButton.click();
                                input = new extest.InputBox();
                            });

                            afterSuite(async function() {
                                if (input) {
                                    if (await input.isDisplayed()) {
                                        await input.cancel();
                                    }
                                }
                            });

                            describe('write valid key/value data', function() {
                                it('prompts for a path', async function() {
                                    expect(await input.isDisplayed()).to.be.true;
                                });

                                it('prepopulates the path', async function() {
                                    expect(await input.getText()).to.equal(constants.WRITE_KV2_FULL_PATH);
                                });

                                let secretTreeItem: extest.TreeItem;
                                context('when a child path is provided', function() {
                                    const childPath = uuid.v4();
                                    before(async function() {
                                        await input.setText(constants.WRITE_KV2_FULL_PATH + childPath);
                                        await input.confirm();
                                    });

                                    it('prompts for data', async function() {
                                        expect(await input.isDisplayed()).to.be.true;
                                    });

                                    it('does not prepopulate the data', async function() {
                                        expect(await input.getText()).to.be.empty;
                                    });

                                    context('when data is provided', function() {
                                        before(async function() {
                                            await input.setText('foo=bar bar=baz baz=foo');
                                            await input.confirm();
                                        });

                                        it('does not prompt for more information', async function() {
                                            expect(await input.isDisplayed()).to.be.false;
                                        });

                                        it('repaints the parent tree item', refreshPath);

                                        it('creates a new child tree item', async function() {
                                            secretTreeItem = await pathTreeItem.findChildItem(childPath);
                                            expect(secretTreeItem).not.to.be.undefined;
                                        });
                                    });
                                });
                            });

                            describe('write invalid key/value data', function() {
                                it('prompts for a path', async function() {
                                    expect(await input.isDisplayed()).to.be.true;
                                });

                                it('prepopulates the path', async function() {
                                    expect(await input.getText()).to.equal(constants.WRITE_KV2_FULL_PATH);
                                });

                                context('when a child path is provided', function() {
                                    const childPath = uuid.v4();
                                    before(async function() {
                                        await input.setText(constants.WRITE_KV2_FULL_PATH + childPath);
                                        await input.confirm();
                                    });

                                    it('prompts for data', async function() {
                                        expect(await input.isDisplayed()).to.be.true;
                                    });

                                    it('does not prepopulate the data', async function() {
                                        expect(await input.getText()).to.be.empty;
                                    });

                                    context('when data is provided', function() {
                                        before(async function() {
                                            await input.setText('foo=bar bar=baz baz');
                                            await input.confirm();
                                        });

                                        it('does not accept invalid data', async function() {
                                            expect(await input.isDisplayed()).to.be.true;
                                        });
                                    });
                                });
                            });

                            describe('write valid JSON data', function() {
                                it('prompts for a path', async function() {
                                    expect(await input.isDisplayed()).to.be.true;
                                });

                                it('prepopulates the path', async function() {
                                    expect(await input.getText()).to.equal(constants.WRITE_KV2_FULL_PATH);
                                });

                                let secretTreeItem: extest.TreeItem;
                                context('when a child path is provided', function() {
                                    const childPath = uuid.v4();
                                    before(async function() {
                                        await input.setText(constants.WRITE_KV2_FULL_PATH + childPath);
                                        await input.confirm();
                                    });

                                    it('prompts for data', async function() {
                                        expect(await input.isDisplayed()).to.be.true;
                                    });

                                    it('does not prepopulate the data', async function() {
                                        expect(await input.getText()).to.be.empty;
                                    });

                                    context('when data is provided', function() {
                                        before(async function() {
                                            await input.setText('{"foo":"bar", "bar":"baz", "baz":"foo"}');
                                            await input.confirm();
                                        });

                                        it('does not prompt for more information', async function() {
                                            expect(await input.isDisplayed()).to.be.false;
                                        });

                                        it('repaints the parent tree item', refreshPath);

                                        it('creates a new child tree item', async function() {
                                            secretTreeItem = await pathTreeItem.findChildItem(childPath);
                                            expect(secretTreeItem).not.to.be.undefined;
                                        });
                                    });
                                });
                            });

                            describe('write invalid JSON data', function() {
                                it('prompts for a path', async function() {
                                    expect(await input.isDisplayed()).to.be.true;
                                });

                                it('prepopulates the path', async function() {
                                    expect(await input.getText()).to.equal(constants.WRITE_KV2_FULL_PATH);
                                });

                                context('when a child path is provided', function() {
                                    const childPath = uuid.v4();
                                    before(async function() {
                                        await input.setText(constants.WRITE_KV2_FULL_PATH + childPath);
                                        await input.confirm();
                                    });

                                    it('prompts for data', async function() {
                                        expect(await input.isDisplayed()).to.be.true;
                                    });

                                    it('does not prepopulate the data', async function() {
                                        expect(await input.getText()).to.be.empty;
                                    });

                                    context('when data is provided', function() {
                                        before(async function() {
                                            await input.setText('{"foo":"bar" "bar":"baz" "baz":"foo"}');
                                            await input.confirm();
                                        });

                                        it('does not accept invalid data', async function() {
                                            expect(await input.isDisplayed()).to.be.true;
                                        });
                                    });
                                });
                            });
                        });

                        // context('when updating an existing secret');
                    });
                });
            });
        });
    });
});
