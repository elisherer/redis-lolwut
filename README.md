# redis-lolwut
[![npm version](https://badge.fury.io/js/redis-lolwut.svg)](https://npm.im/redis-lolwut)

Port of redis LOLWUT command to JavaScript (NodeJS)

Quote:
```
The command should do something fun and interesting, 
and should be replaced by a new implementation at each new version of Redis.
```

## Installation

```sh
npm i -g redis-lolwut
```

## Usage

LOLWUT [VERSION <version>] [... version specific arguments ...]

Example:
```sh
$ lolwut
```
### Version 5

LOLWUT VERSION 5 [terminal columns] [squares-per-row] [squares-per-col]

By default the command uses 66 columns, 8 squares per row, 12 squares
per column.

Examples:
```sh
$ lolwut version 5
```
```sh
$ lolwut version 5 66 8 12
```

### Version 6

LOLWUT [VERSION 6] [columns] [rows]
* Version 6 is the default

By default the command uses 80 columns, 40 squares per row per column.

Examples:
```sh
$ lolwut
```
```sh
$ lolwut 80 40
```
```sh
$ lolwut version 6 80 40
```

## References

* [LOLWUT: a piece of art inside a database command](http://antirez.com/news/123) - Blog post
* [LOLWUT Command on redis.io](https://redis.io/commands/lolwut) - Official docs
* [Official GitHub](https://github.com/antirez/redis/blob/unstable/src/lolwut.c) - Redis source code

## Author

Originally created by [Salvatore Sanfilippo](https://github.com/antirez)

NodeJS Port by [Eli Sherer](https://github.com/elisherer)