# vscode-vault

[![Latest Release](https://vsmarketplacebadge.apphb.com/version-short/owenfarrell.vscode-vault.svg)](https://marketplace.visualstudio.com/items?itemName=owenfarrell.vscode-vault)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/owenfarrell.vscode-vault.svg)](https://marketplace.visualstudio.com/items?itemName=owenfarrell.vscode-vault)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/owenfarrell.vscode-vault.svg)](https://marketplace.visualstudio.com/items?itemName=owenfarrell.vscode-vault#review-details)

[![Build Status](https://travis-ci.org/owenfarrell/vscode-vault.svg?branch=master)](https://travis-ci.org/owenfarrell/vscode-vault)
[![bitHound Overall Score](https://www.bithound.io/github/owenfarrell/vscode-vault/badges/score.svg)](https://www.bithound.io/github/owenfarrell/vscode-vault)

[Visual Studio Code](https://code.visualstudio.com/) (VS Code) extension that provides the ability to interact with HashiCorp Vault servers.

## Features

1. [Connecting to a Vault](#connecting-to-a-vault)
2. [Reading and Writing Data](#reading-and-writing-data)
    1. [Key-Value Pairs](#key-value-pairs)
    2. [JSON](#json)
4. [Deleting Paths](#deleting-paths)

### Connecting to a Vault

Prior to reading, writing or deleting paths, a vault token must be acquired by authenticating against an authentication backend. This extension supports integrated authentication via a GitHub personal access token or via a username and password.

> If your Vault instance uses a self-signed certificate or an enterprise (internal) public key infrastructure, you will need to add your vault host as a trusted authority.
> See [Extension Settings](#extension-settings) for details.

![Demo](demo/connect.gif)

If your vault instance does not suport these integrated authentication backends, this extension can reuse a vault token generated through the vault CLI.

If authenticating through the CLI, select the *Native* authentication. When authenticating through an external process, select *Manual* authentication and provide your vault token.

### Reading and Writing Data

Much like the Vault CLI, data can be supplied in the form of key-value pairs or as JSON structures.

#### Key-Value Pairs

When writing key-value data to a path, data must be in the form of `key=value`. Multiple attributes can be written in the form of `key1=value1 key2=value2`.

![Demo](demo/write-keyvalue.gif)

When reading key-value data from a path, select an key from the available list. The associated value will then be copied to the clipboard. If thes specified path contains only 1 key, the value associated with that key will be automatically copied to the clipboard.

![Demo](demo/read-keyvalue.gif)

#### JSON

When writing JSON data to a path, data must be a well-formed JSON object in the form of `{ members }`.
                     
![Demo](demo/write-json.gif)

JSON data (or complex data structures, such as a map) is presented through the UI as a flattened object instance to allow for selecting nested values.

![Demo](demo/read-json.gif)

### Deleting Paths

![Demo](demo/delete.gif)

## Requirements

TODO

## Extension Settings

The following settings are supported

* `vault.trustedEndpoints` : A collection of authorities (username and port) for which strict SSL checking will be skipped.
* `vault.clipboardTimeout` : A duration (in seconds) after which clipboard contents will be cleared. When set to `0`, clipboard clearing will be disabled. Defaults to `60`.

-----------------------------------------------------------------------------------------------------------

**Enjoy!**
