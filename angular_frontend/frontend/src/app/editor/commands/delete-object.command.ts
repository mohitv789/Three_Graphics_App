import { Command } from './command';
import { SceneService } from '../../three/scene.service';
import { ObjectService } from '../../three/objects.service';
import { SelectionService } from '../../three/selection.service';
import { THREE } from '../../three/three';

export class DeleteObjectCommand implements Command {

  private mesh!: THREE.Object3D;
  private objectId!: string;

  constructor(
    private sceneService: SceneService,
    private objectService: ObjectService,
    private selectionService: SelectionService,
    private projectId: string
  ) {}

  execute(): void {
    const selected = this.selectionService.getSelectedMesh();
    if (!selected) {
      console.warn('Delete skipped: no object selected');
      return;
    }

    const objectId = selected.userData?.['objectId'];
    if (!objectId) {
      console.warn('Delete skipped: selected object has no objectId');
      return;
    }

    this.mesh = selected;
    this.objectId = objectId;

    // 1️⃣ Clear selection (reactive-safe)
    this.selectionService.clearSelection();

    // 2️⃣ Remove from scene immediately
    this.sceneService.removeObject(this.mesh);

    // 3️⃣ Persist delete (hard delete)
    this.objectService
      .delete(this.projectId, this.objectId)
      .subscribe();
  }

  undo(): void {
    if (!this.mesh) {
      console.warn('Undo delete skipped: missing mesh');
      return;
    }

    // 🔁 Local-only undo
    this.sceneService.addExistingObject(this.mesh);

    // Restore selection (rebuilds DTO + streams)
    this.selectionService.setSelected(this.mesh);
  }
}
