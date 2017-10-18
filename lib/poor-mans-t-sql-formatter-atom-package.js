'use babel';

import PoorMansTSqlFormatterAtomPackageView from './poor-mans-t-sql-formatter-atom-package-view';
import { CompositeDisposable } from 'atom';

export default {

  poorMansTSqlFormatterAtomPackageView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.poorMansTSqlFormatterAtomPackageView = new PoorMansTSqlFormatterAtomPackageView(state.poorMansTSqlFormatterAtomPackageViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.poorMansTSqlFormatterAtomPackageView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'poor-mans-t-sql-formatter-atom-package:toggle': () => this.toggle()
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

  toggle() {
    console.log('PoorMansTSqlFormatterAtomPackage was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
