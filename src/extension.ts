import * as vscode from 'vscode';
import ncp = require('copy-paste');

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("ruby-namespace-copy.copy", copyNamespace),
  );
}

export function copyNamespace() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const fileName = editor.document.fileName;
  if (!fileName.match(".rb") || fileName.match(".arb")) {
    vscode.window.showInformationMessage('File is not of a recognized Ruby extension.');
    return;
  }

  const regexp = /([\t ]*)(class|module) (\w+)/g;
  const text = editor.document.getText();
  const matches = [...text.matchAll(regexp)];

  let str = "";
  let identation = -1;
  let error = false;
  for (const match of matches) {
    if(identation != -1 && match[1].length < identation) {
      // vscode doesn't like to produce messages inside loops
      error = true;
      break;
    }
    identation = match[1].length;

    if(str == "") {
      str += match.at(-1);
    } else {
      str += "::" + match.at(-1);
    }
  }

  if(error) {
    vscode.window.showErrorMessage('Inconsistent identation or multiple classes per file detected. Returning first match, if any.');
  }

  ncp.copy(str);
}
