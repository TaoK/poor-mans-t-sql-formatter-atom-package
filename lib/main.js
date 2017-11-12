'use babel';

import sqlformatter from 'poor-mans-t-sql-formatter';
import { CompositeDisposable } from 'atom';
const optionsHelper = require('./optionshelper');

const REGEX_LINEENDING_WINDOWS = /\r\n/g
const REGEX_LINEENDING_UNIXFIND = /(^|[^\r])\n/g;
const REGEX_LINEENDING_UNIXREPLACE = /\n/g;

var convertedConfig = optionsHelper.getOptionsDefinition(sqlformatter.optionReference);

//Actual plugin package entry point
export default {

  subscriptions: null,

  detectedOptions: null,

  activate(state) {
    //Easy disposal...
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'poor-mans-t-sql-formatter:format': () => this.format()
    }));

    atom.config.onDidChange(() => detectedOptions = optionsHelper.detectOptions());
    detectedOptions = optionsHelper.detectOptions();
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  config: convertedConfig,

  format() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      let inputSql;
      let cursorOffset;
      let windowsLineEndingFix = false;
      let selection = editor.getSelectedText();
      let libResult;

      //confirm format if file extension/name pattern is unexpected
      new Promise((resolve, reject) => {
        if (detectedOptions[optionsHelper.OPTION_NAMES.EXPECTED_GRAMMARS]
          && !detectedOptions[optionsHelper.OPTION_NAMES.EXPECTED_GRAMMARS].find(g => editor.getGrammar().scopeName.startsWith(g) || g === "*")
        )
          atom.confirm({
            message: "Unexpected Grammar! Proceed?",
            detailedMessage: "The grammar of the file you are attempting to format does not match the formatter's configuration. Would you like to format anyway?",
            buttons: {
              yes: function(){resolve(true);},
              no: function(){resolve(false);}
            }
          });
        else
          resolve(true);
      }).then(proceed => {
        if (!proceed)
          return;

        if (selection) {
          inputSql = selection;
        } else {
          inputSql = editor.getText();
          cursorOffset = editor.getBuffer().characterIndexForPosition(editor.getCursorBufferPosition());
        }

        //check whether this is a windows line ending (CrLf) file;
        //the JS lib produces Lf linebreaks, and Atom does not hide line
        //endings from the editor/plugins... So if we don't handle explicitly,
        //we end up using the wrong line ending in Windows files.
        if (inputSql.match(REGEX_LINEENDING_WINDOWS) && !inputSql.match(REGEX_LINEENDING_UNIXFIND)) {
          windowsLineEndingFix = true;
          inputSql = inputSql.replace(REGEX_LINEENDING_WINDOWS, '\n');
        }

        //actually call the format lib
        libResult = sqlformatter.formatSql(inputSql, detectedOptions);

        return new Promise((resolve, reject) => {
          if (detectedOptions[optionsHelper.OPTION_NAMES.CONFIRM_ON_ERROR]
            && libResult.errorFound
            )
            atom.confirm({
              message: "Parsing error! Proceed?",
              detailedMessage: "The content you are attempting to format was not successfully parsed, and the formatted result may not match the original intent. Would you like to format anyway?",
              buttons: {
                yes: function(){resolve(true);},
                no: function(){resolve(false);}
              }
            });
          else
            resolve(true);
        });
      }).then(proceed => {
        if (!proceed)
          return;

        var outputText = libResult.text;

        //restore linebreaks if we fiddled...
        if (windowsLineEndingFix) {
          outputText = outputText.replace(REGEX_LINEENDING_UNIXREPLACE, '\r\n');
        }

        if (selection) {
          editor.insertText(outputText, {select: true});
        } else {
          editor.setText(outputText);
          editor.setCursorBufferPosition(editor.getBuffer().positionForCharacterIndex(cursorOffset * libResult.text.length / (inputSql.length || 1)));
        }
      }).catch(e => {console.log(e); throw e;});
    }
  }

};
