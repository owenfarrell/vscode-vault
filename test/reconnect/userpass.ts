/* eslint-disable no-unused-expressions */
'use strict';

import * as constants from '../constants';
import * as extest from 'vscode-extension-tester';

import delay from 'delay';

import { expect } from 'chai';

describe('Reconnect to Vault using Username & Password Authentication', function() {
    context('when the Explorer view is open', function() {
        let view: extest.SideBarView;
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
                        const viewItem = await section.findItem(constants.CONNECT_USERPASS_VAULT_NAME, 1);
                        if (viewItem instanceof extest.TreeItem) {
                            serverTreeItem = viewItem;
                        }
                        expect(serverTreeItem).not.to.be.undefined;
                    }

                    before(async function() {
                        await refreshServer();
                    });

                    it('has action buttons', async function() {
                        expect(await serverTreeItem.getActionButtons()).not.to.be.empty;
                    });

                    context('when the reconnect action is clicked', function() {
                        before(async function() {
                            await extest.VSBrowser.instance.driver.actions().mouseMove(serverTreeItem).perform();
                            const actionButton = await serverTreeItem.getActionButton('Connect');
                            await actionButton.click();
                            input = new extest.InputBox();
                        });

                        let input: extest.InputBox;
                        it('prompts for a path', async function() {
                            expect(await input.isDisplayed()).to.be.true;
                        });

                        it('pre-populates a path', async function() {
                            expect(await input.getText()).not.to.be.empty;
                        });

                        context('when the path is confirmed', function() {
                            before(async function() {
                                await input.confirm();
                            });

                            it('prompts for a username', async function() {
                                expect(await input.isDisplayed()).to.be.true;
                            });

                            it('pre-populates a username', async function() {
                                expect(await input.getText()).not.to.be.empty;
                            });

                            context('when the username is confirmed', function() {
                                before(async function() {
                                    // TODO Magic string
                                    await input.setText('owenf');
                                    await input.confirm();
                                });

                                it('prompts for a password', async function() {
                                    expect(await input.isDisplayed()).to.be.true;
                                });

                                it('does not pre-populate a password', async function() {
                                    expect(await input.getText()).to.be.empty;
                                });

                                context('when the password is confirmed', function() {
                                    before(async function() {
                                        // TODO Magic string
                                        await input.setText('foo');
                                        await input.confirm();
                                    });

                                    it('does not prompt for more information', async function() {
                                        expect(await input.isDisplayed()).to.be.false;
                                    });

                                    it('does not display an error notification', async function() {
                                        const center = await new extest.Workbench().openNotificationsCenter();
                                        expect(await center.getNotifications(extest.NotificationType.Error)).to.be.empty;
                                    });

                                    it('repaints the server tree item', refreshServer);

                                    it('the server tree item is not expanded', async function() {
                                        expect(await serverTreeItem.isExpanded()).to.be.false;
                                    });

                                    context('when the server tree item is expanded', function() {
                                        before(async function() {
                                            await serverTreeItem.select();
                                        });

                                        it('has children', async function() {
                                            expect(await serverTreeItem.getChildren()).not.to.be.empty;
                                        });

                                        it('includes the cubbyhole mount point in the children', async function() {
                                            expect(await serverTreeItem.findChildItem(constants.BROWSE_CUBBYHOLE_MOUNT_POINT)).not.to.be.undefined;
                                        });

                                        it('includes the KV1 mount point in the children', async function() {
                                            expect(await serverTreeItem.findChildItem(constants.BROWSE_KV1_MOUNT_POINT)).not.to.be.undefined;
                                        });

                                        it('includes the KV2 mount point in the children', async function() {
                                            expect(await serverTreeItem.findChildItem(constants.BROWSE_KV2_MOUNT_POINT)).not.to.be.undefined;
                                        });

                                        it('does not display an error notification', async function() {
                                            const center = await new extest.Workbench().openNotificationsCenter();
                                            expect(await center.getNotifications(extest.NotificationType.Error)).to.be.empty;
                                        });
                                    });

                                    after(async function() {
                                        if (serverTreeItem) {
                                            await serverTreeItem.collapse();
                                        }
                                    });
                                });
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
