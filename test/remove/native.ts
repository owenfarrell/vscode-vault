/* eslint-disable no-unused-expressions */
'use strict';

import * as constants from '../constants';
import * as extest from 'vscode-extension-tester';

import delay from 'delay';
import { expect } from 'chai';

describe('Removing from a Vault', function() {
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
                        const viewItem = await section.findItem(constants.CONNECT_NATIVE_VAULT_NAME, 1);
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

                    describe('when the remove action is clicked', function() {
                        before(async function() {
                            await extest.VSBrowser.instance.driver.actions().mouseMove(serverTreeItem).perform();
                            const actionButton = await serverTreeItem.getActionButton('Remove');
                            await actionButton.click();
                        });

                        it('removes the server tree item', async function() {
                            const viewItem = await section.findItem(constants.CONNECT_NATIVE_VAULT_NAME, 1);
                            expect(viewItem).to.be.undefined;
                        });
                    });
                });
            });
        });
    });
});
