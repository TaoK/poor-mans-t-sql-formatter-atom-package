# Poor Man's T-SQL Formatter - Atom Editor Plugin

This is a SQL formatter plugin for the increasingly-popular Atom editor.

The formatter provides all the same fancy stuff as in its other incarnations (SSMS extension, Visual Studio extension, Notepad++ plugin, etc), including:

* numerous configuration options
* full T-SQL formatting, including
   * multi-statement batches
   * complex statement types (eg INSERT statement with CTE and OUTPUT clause)
   * accurate support for all SQL-server-supported datatypes
* support for other SQL dialects where possible (work in progress)

## Installation

Install from within Atom ("poor-mans-t-sql-formatter"), or on the command-line, using Atom's package manager "apm":

```
apm install poor-mans-t-sql-formatter
```

## Status

The only notable limitations of this package for the moment are:

* It's quite slow; formatting a large file can take a couple seconds.
* It **always outputs unix-style line endings** - it needs work to better account for the document's own line ending standard.

