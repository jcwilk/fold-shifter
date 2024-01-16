import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "fold-shifter" is now active!');

  let moveUp = vscode.commands.registerCommand('fold-shifter.moveDividerUp', () => {
    moveDivider(true);
  });

  let moveDown = vscode.commands.registerCommand('fold-shifter.moveDividerDown', () => {
    moveDivider(false);
  });

  context.subscriptions.push(moveUp, moveDown);
}

export function deactivate() {}

function gapCandidate(line: vscode.TextLine): boolean {
  return line.isEmptyOrWhitespace || line.text.startsWith('---');
}

function documentToGapRanges(document: vscode.TextDocument): vscode.Range[] {
  const gapRanges: vscode.Range[] = [];
  let startLine = 0;
  let endLine = 0;
  let inGap = false;
  for (let i = 0; i < document.lineCount; i++) {
    let line = document.lineAt(i);
    if (gapCandidate(line)) {
      if (!inGap) {
        startLine = i;
        inGap = true;
      }
    }
    else {
      if (inGap) {
        endLine = i - 1;
        gapRanges.push(new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length));
        inGap = false;
      }
    }
  }
  if (inGap) {
    endLine = document.lineCount - 1;
    gapRanges.push(new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length));
  }
  return gapRanges;
}

function gapContainsFold(gapRange: vscode.Range, document: vscode.TextDocument): boolean {
  for (let i = gapRange.start.line; i <= gapRange.end.line; i++) {
    let line = document.lineAt(i);
    if (line.text.startsWith('---')) {
      return true;
    }
  }
  return false;
}

function replaceGapWithFold(gapRange: vscode.Range, editBuilder: vscode.TextEditorEdit) {
  editBuilder.replace(gapRange, '\n---\n');
}

function replaceGapWithNewlines(gapRange: vscode.Range, editBuilder: vscode.TextEditorEdit) {
  editBuilder.delete(gapRange);
}

function moveDivider(up: boolean) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  const document = editor.document;

  const gapRanges = documentToGapRanges(document);
  if (gapRanges.length === 0) {
    return; // No gaps found
  };

  const topFoldGapIndex = gapRanges.findIndex(gap => gapContainsFold(gap, document));

  editor.edit(editBuilder => {
    if (up) {
      if (topFoldGapIndex === -1) {
        replaceGapWithFold(gapRanges[gapRanges.length - 1], editBuilder);
        return;
      }

      if (topFoldGapIndex === 0) {
        return; // Already at the top
      }

      replaceGapWithNewlines(gapRanges[topFoldGapIndex], editBuilder);
      replaceGapWithFold(gapRanges[topFoldGapIndex - 1], editBuilder);
      return;
    }

    // down

    if (topFoldGapIndex === -1) {
      // No folds found
      replaceGapWithFold(gapRanges[0], editBuilder);
      return;
    }

    if (topFoldGapIndex === gapRanges.length - 1) {
      // Already at the bottom
      replaceGapWithNewlines(gapRanges[topFoldGapIndex], editBuilder);
      return;
    }

    replaceGapWithNewlines(gapRanges[topFoldGapIndex], editBuilder);
    replaceGapWithFold(gapRanges[topFoldGapIndex + 1], editBuilder);
  });
}


