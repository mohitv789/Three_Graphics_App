import { Injectable } from '@angular/core';
import { Command } from '../editor/commands/command';

@Injectable({ providedIn: 'root' })
export class CommandsService {

  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  execute(cmd: Command): void {
    cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack.length = 0; // clear redo
  }

  undo(): void {
    const cmd = this.undoStack.pop();
    if (!cmd) return;

    cmd.undo();
    this.redoStack.push(cmd);
  }

  redo(): void {
    const cmd = this.redoStack.pop();
    if (!cmd) return;

    cmd.execute();
    this.undoStack.push(cmd);
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
