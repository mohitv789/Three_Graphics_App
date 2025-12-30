import { Injectable } from '@angular/core';
import { Command } from '../editor/commands/command';
import { SelectionService } from '../three/selection.service';

@Injectable({ providedIn: 'root' })
export class CommandsService {

  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  constructor(
    private selectionService: SelectionService
  ) {}

  execute(cmd: Command): void {
    cmd.execute();

    // 🔁 sync inspector AFTER mutation
    this.selectionService.refreshSelectionDTO();

    this.undoStack.push(cmd);
    this.redoStack.length = 0;
  }

  undo(): void {
    const cmd = this.undoStack.pop();
    if (!cmd) return;

    cmd.undo();
    this.selectionService.refreshSelectionDTO();
    this.redoStack.push(cmd);
  }

  redo(): void {
    const cmd = this.redoStack.pop();
    if (!cmd) return;

    cmd.execute();
    this.selectionService.refreshSelectionDTO();
    this.undoStack.push(cmd);
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
