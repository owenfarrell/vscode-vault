# Contributing to vscode-vault Extension

👋 Hey there - thanks for stopping by!

## Feedback

First and foremost, if you have any feedback, please open an [issue](../../issues). If there's something wrong, if something could be better, if there's something missing... please don't hesitate to open up a new issue and provide your feedback.

If there's an issue or a pull request that catches your attention, please use the upvote (👍) and downvote (👎) reactions to the original post. Please don't paste `+1` in a new comment. Its just so... many... emails...

## Code, Building, Testing and Pull Requests

If you want to cut code yourself, here's a quick primer on how to get going.

### Project Setup

For starters, you will need to clone this repository. If you're planning on making changes, you will need to [fork this repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) first.

All dependencies are managed through [npm](https://www.npmjs.com/package/npm). To download all of the build-time and runtime depdencies, simply run:

```
$ npm install
```

### Test It

In order to test changes to this extension, you will need access to a Vault server. If you have access to a Vault instance, or are running Vault locally, you can do as much exploratory testing as you want against that Vault server.

Automated tests are stored in the `test` folder of the repository and are configured to run against a containerized Vault server that is pre-configured and pre-populated with "secrets". The `docker` folder includes a `Dockerfile` that builds a mock Vault server image:
```
$ docker build --pull --rm -f docker/Dockerfile -t owenfarrell/vscode-vault:latest docker
```

Once the image is built, start the pre-configured Vault server with the following command:
```
$ docker run --rm -d -p 8200:8200/tcp owenfarrell/vscode-vault:latest
```

**_NOTE_**: Any changes to secrets or configuration are discarded when the container is stopped.

With the Vault server image up and running, start the automated test suite by running:
```
$ npm test
```

### Pull Requests

Pull requests are welcomed! Once you've tested your changes and are ready to submit them, please open a new pull request.

Pull requests:
* **MUST** pass all status checks
* **SHOULD** [link to an issue](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue)
* **COULD** be [verified by GitHub](https://docs.github.com/en/github/authenticating-to-github/about-commit-signature-verification)
