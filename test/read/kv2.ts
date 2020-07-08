/* eslint-disable no-unused-expressions */
'use strict';

import * as constants from '../constants';
import * as extest from 'vscode-extension-tester';

import delay from 'delay';
import { expect } from 'chai';

describe('Reading from a KV Version 2 Engine Path', function() {
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
                        const viewItem = await section.findItem(constants.READ_VAULT_NAME, 1);
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

                    context('when the path to a single-field secret is expanded', function() {
                        let secretTreeItem: extest.TreeItem;
                        before(async function() {
                            let mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV2_MOUNT_POINT);
                            expect(mountPointTreeItem).not.to.be.undefined;
                            if (await mountPointTreeItem.isExpanded() === false) {
                                await mountPointTreeItem.select();
                                await delay(50);
                                mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV2_MOUNT_POINT);
                            }
                            expect(await mountPointTreeItem.isExpanded()).to.be.true;

                            let pathTreeItem = await mountPointTreeItem.findChildItem(constants.READ_KV2_SINGLE_FIELD_PATH);
                            expect(pathTreeItem).not.to.be.undefined;
                            if (await pathTreeItem.isExpanded() === false) {
                                await pathTreeItem.select();
                                await delay(50);
                                pathTreeItem = await mountPointTreeItem.findChildItem(constants.READ_KV2_SINGLE_FIELD_PATH);
                            }
                            expect(await pathTreeItem.isExpanded()).to.be.true;

                            secretTreeItem = await pathTreeItem.findChildItem(constants.READ_KV2_SINGLE_FIELD_SECRET);
                            expect(secretTreeItem).not.to.be.undefined;
                        });

                        context('when the read action is clicked', function() {
                            let input: extest.InputBox;
                            before(async function() {
                                await extest.VSBrowser.instance.driver.actions().mouseMove(secretTreeItem).perform();
                                const actionButton = await secretTreeItem.getActionButton('Read Secret');
                                await actionButton.click();
                                input = new extest.InputBox();
                            });

                            it('does not prompt for more information', async function() {
                                expect(await input.isDisplayed()).to.be.false;
                            });

                            after(async function() {
                                if (input) {
                                    if (await input.isDisplayed()) {
                                        await input.cancel();
                                    }
                                }
                            });
                        });
                    });

                    context('when the path to a multiple-field secret is expanded', function() {
                        let secretTreeItem: extest.TreeItem;
                        before(async function() {
                            let mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV2_MOUNT_POINT);
                            expect(mountPointTreeItem).not.to.be.undefined;
                            if (await mountPointTreeItem.isExpanded() === false) {
                                await mountPointTreeItem.select();
                                await delay(50);
                                mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV2_MOUNT_POINT);
                            }
                            expect(await mountPointTreeItem.isExpanded()).to.be.true;

                            let pathTreeItem = await mountPointTreeItem.findChildItem(constants.READ_KV2_MULTI_FIELD_PATH);
                            expect(pathTreeItem).not.to.be.undefined;
                            if (await pathTreeItem.isExpanded() === false) {
                                await pathTreeItem.select();
                                await delay(50);
                                pathTreeItem = await mountPointTreeItem.findChildItem(constants.READ_KV2_MULTI_FIELD_PATH);
                            }
                            expect(await pathTreeItem.isExpanded()).to.be.true;

                            secretTreeItem = await pathTreeItem.findChildItem(constants.READ_KV2_MULTI_FIELD_SECRET);
                            expect(secretTreeItem).not.to.be.undefined;
                        });

                        context('when the read action is clicked', function() {
                            let input: extest.InputBox;
                            before(async function() {
                                await extest.VSBrowser.instance.driver.actions().mouseMove(secretTreeItem).perform();
                                const actionButton = await secretTreeItem.getActionButton('Read Secret');
                                await actionButton.click();
                                input = new extest.InputBox();
                            });

                            it('prompts for a field', async function() {
                                expect(await input.isDisplayed()).to.be.true;
                            });

                            let quickPickItem: extest.QuickPickItem;
                            it('provides each field as a pickable option', async function() {
                                expect(await input.getQuickPicks()).not.to.be.empty;
                                quickPickItem = await input.findQuickPick('password');
                                expect(quickPickItem).not.to.be.undefined;
                            });

                            context('when a field is selected', function() {
                                before(async function() {
                                    await quickPickItem.select();
                                });

                                it('does not prompt for more information', async function() {
                                    expect(await input.isDisplayed()).to.be.false;
                                });
                            });

                            after(async function() {
                                if (input) {
                                    if (await input.isDisplayed()) {
                                        await input.cancel();
                                    }
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});
