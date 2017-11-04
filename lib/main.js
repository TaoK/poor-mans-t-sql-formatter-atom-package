'use babel';

import sqlformatter from 'poor-mans-t-sql-formatter';
import { CompositeDisposable } from 'atom';

//Convert formatting library options into Atom configuration properties
function mapOption(targetObject, name, overrideDefault) {
  var option = {};
  var refEntry = sqlformatter.optionReference[name];
  switch (refEntry.type) {
    case 'bool':
      option.type = "boolean";
      break;
    case 'enum':
      option.type = "string";
      option.enum = refEntry.options;
      break;
    case 'string':
      option.type = "string";
      break;
    case 'int':
      option.type = "integer";
      break;
    default:
      throw new Error("unknown option type!")
  }

  option.default = overrideDefault || refEntry.default;
  option.description = refEntry.description;

  targetObject[name] = option;
}

var convertedConfig = {};
mapOption(convertedConfig, "errorOutputPrefix", "--WARNING! ERRORS ENCOUNTERED DURING SQL PARSING!\n");
mapOption(convertedConfig, "formattingType");

convertedConfig.std = {
  type: "object",
  title: "Standard Formatting Options",
  properties: {}
  };
for (var optionName in sqlformatter.optionReference)
  if (sqlformatter.optionReference[optionName].appliesToFormattingType
    && sqlformatter.optionReference[optionName].appliesToFormattingType.indexOf('standard') >= 0
    && optionName != "coloring"
    )
    mapOption(convertedConfig.std.properties, optionName);

convertedConfig.min = {
  type: "object",
  title: "Minification / Obfuscation Options",
  properties: {}
  };
for (var optionName in sqlformatter.optionReference)
  if (sqlformatter.optionReference[optionName].appliesToFormattingType
    && sqlformatter.optionReference[optionName].appliesToFormattingType.indexOf('obfuscation') >= 0
    && optionName != "randomizeColor"
    )
    mapOption(convertedConfig.min.properties, optionName);

convertedConfig.confirmOnError = {
  type: "boolean",
  default: true,
  description: "If errors were encountered when parsing the SQL (and so the formatting is suspect) - should the formatter request confirmation before replacing the selected text with the formatted result?"
  };

convertedConfig.expectedFilenamePattern = {
  type: "string",
  default: "^((.*\\.sql)|([^\\.]*))?$",
  description: "If the filename for the selected window does not match this regular expression, then the formatter will confirm before formatting. Default means '.sql or no extension'."
  };

//TODO clean up this mess with some sort of declarative approach
convertedConfig.confirmOnError.order = 1;
convertedConfig.expectedFilenamePattern.order = 2;
convertedConfig.errorOutputPrefix.order = 3;
convertedConfig.formattingType.order = 4;
convertedConfig.std.order = 5;
convertedConfig.min.order = 6;


  function retrieveOption(target, name, lookupPrefix) {
    target[name] = atom.config.get('poor-mans-t-sql-formatter.' + (lookupPrefix || "") + name);
  }

  function detectOptions() {
    var newDetectedOptions = {};
    retrieveOption(newDetectedOptions, "confirmOnError");
    retrieveOption(newDetectedOptions, "expectedFilenamePattern");
    retrieveOption(newDetectedOptions, "errorOutputPrefix");
    retrieveOption(newDetectedOptions, "formattingType");

    for (var optionName in sqlformatter.optionReference)
      if (sqlformatter.optionReference[optionName].appliesToFormattingType
        && sqlformatter.optionReference[optionName].appliesToFormattingType.indexOf('standard') >= 0
        && optionName != "coloring"
        )
        retrieveOption(newDetectedOptions, optionName, 'std.');

    for (var optionName in sqlformatter.optionReference)
      if (sqlformatter.optionReference[optionName].appliesToFormattingType
        && sqlformatter.optionReference[optionName].appliesToFormattingType.indexOf('obfuscation') >= 0
        && optionName != "randomizeColor"
        )
        retrieveOption(newDetectedOptions, optionName, 'min.');

    detectedOptions = newDetectedOptions;
  }

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

    atom.config.onDidChange(detectOptions);
    detectOptions();
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  config: convertedConfig,

  format() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      let inputSql, cursorOffset;
      let selection = editor.getSelectedText();
      let libResult;

      //confirm format if file extension/name pattern is unexpected
      new Promise((resolve, reject) => {
        if (!(new RegExp(detectedOptions.expectedFilenamePattern, 'i')).exec(editor.getTitle()))
          atom.confirm({
            message: "Unexpected filename! Proceed?",
            detailedMessage: "The filename you are attempting to format does not match the formatter's configuration. Would you like to format anyway?",
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

        libResult = sqlformatter.formatSql(inputSql, detectedOptions);

        return new Promise((resolve, reject) => {
          if (libResult.errorFound)
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

        if (selection) {
          editor.insertText(libResult.text, {select: true});
        } else {
          editor.setText(libResult.text);
          editor.setCursorBufferPosition(editor.getBuffer().positionForCharacterIndex(cursorOffset * libResult.text.length / (inputSql.length || 1)));
        }
      }).catch(e => {console.log(e); throw e;});
    }
  }

};
