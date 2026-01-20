
import type { GridRect, TabId, CardId } from './types';

export type HistoryCmd =
  | { type: 'transform'; tabId: TabId; cardId: CardId; from: GridRect; to: GridRect };

export class EditorHistory {
  private undoStack: HistoryCmd[] = [];
  private redoStack: HistoryCmd[] = [];
  private limit = 100;

  push(cmd: HistoryCmd) {
    this.undoStack.push(cmd);
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): HistoryCmd | null {
    const cmd = this.undoStack.pop();
    if (cmd) {
      this.redoStack.push(cmd);
      return cmd;
    }
    return null;
  }

  redo(): HistoryCmd | null {
    const cmd = this.redoStack.pop();
    if (cmd) {
      this.undoStack.push(cmd);
      return cmd;
    }
    return null;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

export const editorHistory = new EditorHistory();
