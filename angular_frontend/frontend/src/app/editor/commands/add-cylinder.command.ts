import { Command } from './command';
import { SceneService } from '../../three/scene.service';
import { ObjectService } from '../../three/objects.service';
import { THREE } from '../../three/three';
import { v4 as uuidv4 } from 'uuid';

export class AddCylinderCommand implements Command {

  private mesh!: THREE.Mesh;

  constructor(
    private sceneService: SceneService,
    private objectService: ObjectService,
    private projectId: string
  ) {}

  execute(): void {
    // 1️⃣ Render immediately
    this.mesh = this.sceneService.addCylinder();

    // 2️⃣ Canonical payload
    const payload = {
      kind: 'mesh',
      geometry: {
        type: 'cylinder',
        params: {
          radiusTop: 0.5,
          radiusBottom: 0.5,
          height: 1,
          radialSegments: 32
        }
      },
      material: {
        type: 'standard',
        color: '#0000ff'
      },
      schema_version: 1
    };

    // 🔴 CRITICAL: attach payload BEFORE persistence
    this.mesh.userData['payload'] = payload;

    // 3️⃣ Persist
    this.objectService
      .create(this.projectId, payload)
      .subscribe((res:any) => {
        this.mesh.userData['objectId'] = res['object_id'];
      });
  }

  undo(): void {
    const objectId = this.mesh.userData['objectId'];
    this.sceneService.removeObject(this.mesh);

    if (objectId) {
      this.objectService
        .delete(this.projectId, objectId)
        .subscribe();
    }
  }
}
