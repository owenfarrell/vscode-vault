/* eslint-disable no-unused-expressions */
'use strict';

import * as extest from 'vscode-extension-tester';

import { expect } from 'chai';

describe('Extension Activation', function() {
    context('when the Explorer view is open', function() {
        let view: extest.SideBarView;

        before(async function() {
            const viewControl = await new extest.ActivityBar().getViewControl('Explorer');
            view = await viewControl.openView();
            await new Promise((resolve) => { setTimeout(resolve, 1000); });
        });

        // after(async function() {
        //     await new extest.ActivityBar().getViewControl('Explorer').closeView();
        // });

        describe('the Vaults section', async function() {
            let section: extest.ViewSection;

            before(async function() {
                const content = view.getContent();
                section = await content.getSection('Vaults');
            });

            it('exists', async function() {
                expect(section).not.to.be.undefined;
            });

            it('has the right title', async function() {
                const title = await section.getTitle();
                expect(title).equals('Vaults');
            });

            context('when expanded', function() {
                before(async function() {
                    await section.expand();
                });

                it('has no visible items', async function() {
                    const items = await section.getVisibleItems();
                    expect(items).to.be.empty;
                });

                it('has available actions', async function() {
                    const actions = await section.getActions();
                    expect(actions).not.empty;
                });

                context('when the connect action is clicked', function() {
                    let input: extest.QuickOpenBox;

                    before(async function() {
                        await extest.VSBrowser.instance.driver.actions().mouseMove(section).perform();
                        const action = await section.getAction('Connect to Server');
                        await action.click();
                        input = new extest.InputBox();
                    });

                    it('prompts for a URL', async function() {
                        const isDisplayed = await input.isDisplayed();
                        expect(isDisplayed).to.be.true;
                    });

                    it('does not accept an invalid URL', async function() {
                        await input.setText('this is not a valid URL');
                        await input.confirm();
                        const isDisplayed = await input.isDisplayed();
                        expect(isDisplayed).to.be.true;
                    });

                    it('is cancellable', async function() {
                        await input.cancel();
                    });
                });
            });
        });
    });
});
