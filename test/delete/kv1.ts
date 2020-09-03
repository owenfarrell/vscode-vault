/* eslint-disable no-unused-expressions */
'use strict';

import * as constants from '../constants';
import * as extest from 'vscode-extension-tester';

import delay from 'delay';
import { expect } from 'chai';
import validator from 'validator';

describe('Deleting from a KV Version 1 Engine Path', function() {
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

                    context('when the path to a deleteable secret is expanded', function() {
                        let pathTreeItem: extest.TreeItem;
                        const refreshPath = async function() {
                            await refreshServer();

                            let mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV1_MOUNT_POINT);
                            expect(mountPointTreeItem).not.to.be.undefined;
                            if (await mountPointTreeItem.isExpanded() === false) {
                                await mountPointTreeItem.select();
                                await delay(50);
                                mountPointTreeItem = await serverTreeItem.findChildItem(constants.BROWSE_KV1_MOUNT_POINT);
                            }
                            expect(await mountPointTreeItem.isExpanded()).to.be.true;

                            pathTreeItem = await mountPointTreeItem.findChildItem(constants.WRITE_KV1_RELATIVE_PATH);
                            expect(pathTreeItem).not.to.be.undefined;
                            if (await pathTreeItem.isExpanded() === false) {
                                await pathTreeItem.select();
                                await delay(50);
                                pathTreeItem = await mountPointTreeItem.findChildItem(constants.WRITE_KV1_RELATIVE_PATH);
                            }
                            expect(await pathTreeItem.isExpanded()).to.be.true;
                        };

                        context('when deleting a secret', function() {
                            this.timeout(20000);

                            before(async function() {
                                await refreshPath();

                                const center = await new extest.Workbench().openNotificationsCenter();

                                for (const value of await pathTreeItem.getChildren()) {
                                    this.test.parent.addTest(it('deletes a secret that was created by a test', async function() {
                                        const label = await value.getLabel();
                                        if (validator.isUUID(label)) {
                                            await refreshPath();

                                            const secretTreeItem = await pathTreeItem.findChildItem(label);
                                            expect(secretTreeItem).not.to.be.undefined;
                                            await extest.VSBrowser.instance.driver.actions().mouseMove(secretTreeItem).perform();
                                            const actionButton = await secretTreeItem.getActionButton('Delete Secret');
                                            expect(actionButton).not.to.be.undefined;
                                            await actionButton.click();

                                            const confirmation = await extest.VSBrowser.instance.driver.wait(async function() {
                                                const notifications = await center.getNotifications(extest.NotificationType.Warning);
                                                return notifications.find(async(notification: extest.Notification) => {
                                                    const message = await notification.getMessage();
                                                    return message.indexOf(label) >= 0;
                                                });
                                            }, 1500);
                                            expect(confirmation).not.to.be.undefined;

                                            await confirmation.takeAction('Delete');
                                        }
                                    }));
                                }

                                this.test.parent.addTest(it('repaints the server tree item', refreshServer));
                            });

                            it('deletes all the generated secrets', function() {});
                        });
                    });
                });
            });
        });
    });
});
