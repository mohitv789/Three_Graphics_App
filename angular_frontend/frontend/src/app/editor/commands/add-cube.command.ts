import { Command } from './command';
import { SceneService } from '../../three/scene.service';
import { ObjectService } from '../../three/objects.service';
import { THREE } from '../../three/three';

export class AddCubeCommand implements Command {

  private mesh!: THREE.Mesh;
  private objectId!: string;

  constructor(
    private sceneService: SceneService,
    private objectService: ObjectService,
    private projectId: string
  ) {}

  execute(): void {
    // 1️⃣ Create mesh locally (default transform)
    this.mesh = this.sceneService.addCube();

    // 🔴 Payload MUST NOT contain transforms
    const payload = {
      type: 'mesh',
      geometry: 'box',
      material: { color: '#ff0000' }
    };

    // 2️⃣ Persist object definition only
    this.objectService.create(this.projectId, payload)
      .subscribe((res: any) => {
        this.objectId = res.object_id;
        this.mesh.userData['objectId'] = res.object_id;
      });
  }

  undo(): void {
    if (!this.objectId) {
      console.warn('Undo skipped: objectId not ready');
      return;
    }

    this.sceneService.removeObject(this.mesh);

    this.objectService
      .delete(this.projectId, this.objectId)
      .subscribe();
  }
}
