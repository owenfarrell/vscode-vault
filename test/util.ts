import * as extest from 'vscode-extension-tester';

export async function clickActionButton(treeItem: extest.TreeItem, label: string) {
    await extest.VSBrowser.instance.driver.actions().mouseMove(treeItem).perform();
    const actionButton = await treeItem.getActionButton(label);
    await actionButton.click();
}

export async function waitToExpandTreeItem(treeItem: extest.TreeItem, childName?: string) {
    if (childName) {
        const parentItem = treeItem;
        treeItem = await parentItem.findChildItem(childName);
    }
    await extest.VSBrowser.instance.driver.actions().mouseMove(treeItem).perform();
    if (await treeItem.isExpanded() === false) {
        await treeItem.select();
        await extest.VSBrowser.instance.driver.wait(async function() {
            return await treeItem.isExpanded();
        }, 1000);
    }
    return treeItem;
}

export function waitForChildTreeItem(parentItem: extest.TreeItem, childName: string) {
    return extest.VSBrowser.instance.driver.wait(async function() {
        return parentItem.findChildItem(childName);
    }, 1000);
}
