import { Command } from './command';
import { THREE } from '../../three/three';
import { SelectionService } from '../../three/selection.service';
import { ObjectService } from '../../three/objects.service';

export class ChangeMaterialCommand implements Command {

  private previousHex?: string; // WITHOUT '#'

  constructor(
    private mesh: THREE.Mesh,
    private nextColor: number,
    private selectionService: SelectionService,
    private objectService: ObjectService,
    private projectId: string
  ) {}

  execute(): void {
    const mat = this.getMaterial();
    if (!mat?.color) return;

    // 1️⃣ Store previous color (undo)
    this.previousHex = mat.color.getHexString();

    // 2️⃣ Apply locally (UX)
    mat.color.setHex(this.nextColor);
    mat.needsUpdate = true;

    // 3️⃣ Persist
    this.persist(`#${this.nextColor.toString(16).padStart(6, '0')}`);

    // 4️⃣ Refresh inspector
    this.selectionService.setSelected(this.mesh);
  }

  undo(): void {
    if (!this.previousHex) return;

    const mat = this.getMaterial();
    if (!mat?.color) return;

    // 1️⃣ Restore locally
    mat.color.set('#' + this.previousHex);
    mat.needsUpdate = true;

    // 2️⃣ Persist rollback
    this.persist('#' + this.previousHex);

    // 3️⃣ Refresh inspector
    this.selectionService.setSelected(this.mesh);
  }

  // =========================
  // Backend persistence
  // =========================

  private persist(color: string): void {
    const objectId = this.mesh.userData['objectId'];
    const payload = this.mesh.userData['payload'];

    // Not yet persisted → local-only
    if (!objectId || objectId.startsWith('temp#')) return;
    if (!payload) return;

    const updatedPayload = {
      ...payload,
      material: {
        ...payload.material,
        color
      }
    };

    this.objectService
      .update(this.projectId, objectId, updatedPayload)
      .subscribe({
        error: () => console.error('Failed to update material')
      });

    // Keep local canonical state in sync
    this.mesh.userData['payload'] = updatedPayload;
  }

  // =========================
  // Type-safe material access
  // =========================

  private getMaterial(): THREE.MeshStandardMaterial | null {
    const mat = this.mesh.material;

    if (Array.isArray(mat)) {
      return mat.find(
        (m): m is THREE.MeshStandardMaterial =>
          m instanceof THREE.MeshStandardMaterial
      ) ?? null;
    }

    return mat instanceof THREE.MeshStandardMaterial ? mat : null;
  }
}
