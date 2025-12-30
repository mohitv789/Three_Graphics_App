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
    // render immediately
    this.mesh = this.sceneService.addCube();

    const payload = {
      kind: 'mesh',
      geometry: {
        type: 'box',
        params: { width: 1, height: 1, depth: 1 }
      },
      material: {
        type: 'standard',
        color: '#ff0000'
      },
      schema_version: 1
    };

    // 🔴 CRITICAL: attach payload BEFORE backend call
    this.mesh.userData['payload'] = payload;

    this.objectService.create(this.projectId, payload)
      .subscribe((res:any) => {
        this.mesh.userData['objectId'] = res['object_id'];
      });
  }


  undo(): void {
    if (!this.objectId) {
      console.warn('Undo skipped: objectId not ready');
      return;
    }

    /**
     * 1️⃣ Remove from scene (UX)
     */
    this.sceneService.removeObject(this.mesh);

    /**
     * 2️⃣ Remove from backend (authority)
     */
    this.objectService
      .delete(this.projectId, this.objectId)
      .subscribe();
  }
}
