# Poor Man's T-SQL Formatter - Atom Editor Plugin

This is a SQL formatter plugin for the increasingly-popular Atom editor.

The formatter provides all the same fancy stuff as in its other incarnations (SSMS extension, Visual Studio extension, Notepad++ plugin, etc), including:

* numerous configuration options
* full T-SQL formatting, including
   * multi-statement batches
   * complex statement types (eg INSERT statement with CTE and OUTPUT clause)
   * accurate support for all SQL-server-supported datatypes
* minimization and "don't touch this" support for parts of the file
* support for other SQL dialects where possible (work in progress)

## Installation

Install from within Atom ("poor-mans-t-sql-formatter"), or on the command-line, using Atom's package manager "apm":

```
apm install poor-mans-t-sql-formatter
```

## Usage

Select "Format SQL" to format the highlighted text or, if none selected, the whole active text document.

Default keyboard shortcut is "Ctrl-K, Shift-F", but this can be disabled and/or customized.

Options can all be set in the standard Atom option-management UI.

## Status

The only notable known limitations of this package for the moment is:

* It's quite slow; formatting a large file can take a couple seconds.

