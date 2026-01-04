import { Operation } from '../ops/operation';

export interface Command {
  execute(): void;
  undo(): void;

  // 🔹 OPTIONAL — default is “no op”
  toOps?(): Operation[];
}
