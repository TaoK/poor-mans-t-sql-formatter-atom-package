'use babel';

//TODO: Check file encodings work
//TODO: Check options (superficially tested)
//TODO: Check selection edit and doc edit (manually tested)
//TODO: Check error check (manually tested)
//TODO: check line endings are respected (manually tested)
//TODO: check scopes are respected (manually tested)
//TODO: ensure format sql context menu option only appears in the right scope (manually tested)


import PoorMansTSqlFormatterAtomPackage from '../lib/main';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('PoorMansTSqlFormatterAtomPackage', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('poor-mans-t-sql-formatter');
  });

  describe('when the poor-mans-t-sql-formatter-atom-package:format event is triggered', () => {

    it('formats the active text if any', () => {

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'poor-mans-t-sql-formatter:format');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        //do something?
      });
    });

  });
});
