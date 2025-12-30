import { Command } from './command';
import { SceneService } from '../../three/scene.service';
import { ObjectService } from '../../three/objects.service';
import { THREE } from '../../three/three';
import { v4 as uuidv4 } from 'uuid';

export class AddSphereCommand implements Command {

  private mesh!: THREE.Mesh;

  constructor(
    private sceneService: SceneService,
    private objectService: ObjectService,
    private projectId: string
  ) {}

  execute(): void {
    // 1️⃣ Render immediately
    this.mesh = this.sceneService.addSphere();

    // 2️⃣ Canonical payload (MATCHES serializer)
    const payload = {
      kind: 'mesh',
      geometry: {
        type: 'sphere',
        params: {
          radius: 0.5,
          widthSegments: 32,
          heightSegments: 16
        }
      },
      material: {
        type: 'standard',
        color: '#00ff00'
      },
      schema_version: 1
    };

    // 🔴 CRITICAL: attach payload BEFORE persistence
    this.mesh.userData['payload'] = payload;

    // 3️⃣ Persist
    this.objectService
      .create(this.projectId, payload)
      .subscribe((res : any) => {
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
