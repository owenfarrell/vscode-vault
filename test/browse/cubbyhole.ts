/* eslint-disable no-unused-expressions */
'use strict';

import * as constants from '../constants';
import * as extest from 'vscode-extension-tester';

import { afterSuite, beforeSuite } from 'mocha-suite-hooks';
import delay from 'delay';
import { expect } from 'chai';
import { waitToExpandTreeItem } from '../util';

describe('Browsing a Vault Path in a Cubbyhole Engine', function() {
    let view: extest.SideBarView;
    context('when the Explorer view is open', function() {
        before(async function() {
            view = await new extest.ActivityBar().getViewControl('Explorer').openView();
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
                        const viewItem = await section.findItem(constants.BROWSE_VAULT_NAME, 1);
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

                    it('has no children', async function() {
                        expect(await serverTreeItem.findChildItem(constants.BROWSE_CUBBYHOLE_MOUNT_POINT)).to.be.undefined;
                    });

                    it('has action buttons', async function() {
                        expect(await serverTreeItem.getActionButtons()).not.to.be.empty;
                    });

                    let input: extest.InputBox;
                    beforeSuite('when the browse action is clicked', async function() {
                        await extest.VSBrowser.instance.driver.actions().mouseMove(serverTreeItem).perform();
                        const actionButton = await serverTreeItem.getActionButton('Browse');
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

                    describe('add a valid path', function() {
                        it('prompts for a path', async function() {
                            input = new extest.InputBox();
                            expect(await input.isDisplayed()).to.be.true;
                        });

                        context('when a path is provided', function() {
                            before(async function() {
                                await input.setText(constants.BROWSE_CUBBYHOLE_FULL_PATH);
                                await input.confirm();
                            });

                            it('prompts for the engine type', async function() {
                                expect(await input.isDisplayed()).to.be.true;
                            });

                            let quickPickItem: extest.QuickPickItem;
                            it('the engine type is a pickable option', async function() {
                                expect(await input.getQuickPicks()).not.to.be.empty;
                                quickPickItem = await input.findQuickPick(constants.BROWSE_CUBBYHOLE_TYPE);
                                expect(quickPickItem).not.to.be.undefined;
                            });

                            context('when the engine is selected', function() {
                                before(async function() {
                                    await quickPickItem.select();
                                });

                                it('repaints the server tree item', refreshServer);

                                it('does not prompt for more information', async function() {
                                    expect(await input.isDisplayed()).to.be.false;
                                });

                                it('the server is expandable', async function() {
                                    expect(await serverTreeItem.hasChildren()).to.be.true;
                                });

                                context('when the server is expanded', function() {
                                    before(async function() {
                                        await waitToExpandTreeItem(serverTreeItem);
                                        expect(await serverTreeItem.isExpanded()).to.be.true;
                                    });

                                    it('repaints the server tree item', refreshServer);

                                    it('has children', async function() {
                                        expect(await serverTreeItem.getChildren()).not.to.be.empty;
                                    });

                                    let mountPointTreeItem: extest.TreeItem;
                                    it('includes the mount point in the children', async function() {
                                        mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_CUBBYHOLE_MOUNT_POINT);
                                        expect(mountPointTreeItem).not.to.be.undefined;
                                    });

                                    context('when the mount point is expanded', function() {
                                        before(async function() {
                                            waitToExpandTreeItem(mountPointTreeItem);

                                            // HACK When expanding the first child, existing handles to TreeItems are no longer valid
                                            await refreshServer();
                                            mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_CUBBYHOLE_MOUNT_POINT);
                                        });

                                        it('has no children', async function() {
                                            const children = await mountPointTreeItem.getChildren();
                                            children.forEach(async(element: extest.TreeItem) => console.log('child: ' + await element.getLabel()));
                                            expect(children).to.be.empty;
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
