const semverParse = require('semver/functions/parse');
const currentVersion = require('./package.json').version;
const semver = semverParse(currentVersion);
semver.patch = Math.floor(Date.now() / 1000);
console.log(semver.format());
