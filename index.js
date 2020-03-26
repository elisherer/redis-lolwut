#!/usr/bin/env node

const lolwut5Command = require('./lib/lolwut5');
const lolwut6Command = require('./lib/lolwut6');
const defaultVersion = '6';

const versionSpecified = process.argv.length > 2 && process.argv[2].toLowerCase() === 'version';
const version = versionSpecified ? process.argv[3] : defaultVersion;
const args = process.argv.slice(versionSpecified ? 4 : 2).map(x => parseInt(x, 10));

switch (version) {
    case '5':
        lolwut5Command.apply(null, args);
        break;
    case '6':
        lolwut6Command.apply(null, args);
        break;
}