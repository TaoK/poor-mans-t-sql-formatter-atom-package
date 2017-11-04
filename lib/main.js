'use babel';

import PoorMansTSqlFormatterAtomPackageView from './poor-mans-t-sql-formatter-atom-package-view';
import sqlformatter from 'poor-mans-t-sql-formatter';
import { CompositeDisposable } from 'atom';

export default {

  poorMansTSqlFormatterAtomPackageView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    //TODO: Add options panel, remove demo nonsense
    this.poorMansTSqlFormatterAtomPackageView = new PoorMansTSqlFormatterAtomPackageView(state.poorMansTSqlFormatterAtomPackageViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.poorMansTSqlFormatterAtomPackageView.getElement(),
      visible: false
    });

    //Easy disposal...
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'poor-mans-t-sql-formatter:format': () => this.format()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.poorMansTSqlFormatterAtomPackageView.destroy();
  },

  serialize() {
    return {
      poorMansTSqlFormatterAtomPackageViewState: this.poorMansTSqlFormatterAtomPackageView.serialize()
    };
  },
/*
  config: {
	formatOnSave: {
		type: 'boolean',
		default: false
	}
  },
*/
  format() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      //TODO: Add whole-doc formatting, and don't highlight the result in that case
      //TODO: Detect file extension, warn if issue?
      //TODO: Detect formatting failure, warn before completing edit?
      //TODO: Check how file encodings work
      //TODO: pass in options (assuming there's an options UI somewhere :) )
      let selection = editor.getSelectedText();
      let libResult = sqlformatter.formatSql(selection);
      editor.insertText(libResult.text, {select: true});
    }
  }

};
