/* eslint-disable no-unused-expressions */
'use strict';

import * as constants from '../constants';
import * as extest from 'vscode-extension-tester';

import delay from 'delay';

import { expect } from 'chai';

describe('Connect to Vault using Username & Password Authentication', function() {
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

                context('when the connect action is clicked', function() {
                    before(async function() {
                        await extest.VSBrowser.instance.driver.actions().mouseMove(section).perform();
                        await section.getAction('Connect to Server').click();
                    });

                    let input: extest.InputBox;
                    it('prompts for a URL', async function() {
                        input = new extest.InputBox();
                        expect(await input.isDisplayed()).to.be.true;
                    });

                    context('when a valid URL is provided', function() {
                        before(async function() {
                            await input.setText(constants.CONNECT_USERPASS_VAULT_ADDRESS);
                            await input.confirm();
                        });

                        it('prompts for a friendly name', async function() {
                            expect(await input.isDisplayed()).to.be.true;
                        });

                        it('prepopulates the friendly name', async function() {
                            expect(await input.getText()).to.equal(constants.HTTP_VAULT_NAME);
                        });

                        context('when the friendly name is confirmed', function() {
                            let quickPickItem: extest.QuickPickItem;
                            before(async function() {
                                await input.setText(constants.CONNECT_USERPASS_VAULT_NAME);
                                await input.confirm();
                            });

                            it('prompts for the authentication type', async function() {
                                expect(await input.isDisplayed()).to.be.true;
                            });

                            it('provides the authentication type as a pickable option', async function() {
                                expect(await input.getQuickPicks()).not.to.be.empty;
                                quickPickItem = await input.findQuickPick('Username & Password');
                                expect(quickPickItem).not.to.be.undefined;
                            });

                            context('when the authentication type is selected', function() {
                                before(async function() {
                                    await quickPickItem.select();
                                });

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

                                            let serverTreeItem: extest.TreeItem;
                                            it('creates a new server tree item', async function() {
                                                const viewItem = await section.findItem(constants.CONNECT_USERPASS_VAULT_NAME, 1);
                                                if (viewItem instanceof extest.TreeItem) {
                                                    serverTreeItem = viewItem;
                                                }
                                                expect(serverTreeItem).not.to.be.undefined;
                                            });

                                            it('the server tree item is not expanded', async function() {
                                                expect(await serverTreeItem.isExpanded()).to.be.false;
                                            });

                                            context('when the server tree item is expanded', function() {
                                                before(async function() {
                                                    await serverTreeItem.select();
                                                });

                                                it('has no children', async function() {
                                                    expect(await serverTreeItem.getChildren()).to.be.empty;
                                                });

                                                it('displays an error notification', async function() {
                                                    const center = await new extest.Workbench().openNotificationsCenter();
                                                    const errorNotification = await extest.VSBrowser.instance.driver.wait(async function() {
                                                        const notifications = await center.getNotifications(extest.NotificationType.Any);
                                                        return notifications.find(async(notification: extest.Notification) => {
                                                            const source = await notification.getSource();
                                                            return source === 'Vault (Extension)';
                                                        });
                                                    }, 1500);
                                                    const text = await errorNotification.getMessage();
                                                    expect(text.startsWith('Unable to list mounts')).to.be.true;
                                                    await errorNotification.dismiss();
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
