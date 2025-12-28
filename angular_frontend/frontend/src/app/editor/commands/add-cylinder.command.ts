import { Command } from './command';
import { SceneService } from '../../three/scene.service';
import { ObjectService } from '../../three/objects.service';
import { THREE } from '../../three/three';

export class AddCylinderCommand implements Command {

  private mesh!: THREE.Mesh;
  private objectId!: string;

  constructor(
    private sceneService: SceneService,
    private objectService: ObjectService,
    private projectId: string
  ) {}

  execute(): void {
    this.mesh = this.sceneService.addCylinder();

    const payload = {
      type: 'mesh',
      geometry: 'cylinder',
      material: { color: '#0000ff' }
    };

    this.objectService
      .create(this.projectId, payload)
      .subscribe((res: any) => {
        this.objectId = res.object_id;

        // 🔴 REQUIRED for persistence
        this.mesh.userData['objectId'] = this.objectId;

        // 🔴 REQUIRED for explorer + save
        this.sceneService['emitObjects']();
      });
  }


  undo(): void {
    if (!this.objectId) return;

    this.sceneService.removeObject(this.mesh);
    this.objectService.delete(this.projectId, this.objectId).subscribe();
  }
}
