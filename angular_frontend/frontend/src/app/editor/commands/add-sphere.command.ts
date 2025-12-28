import { Command } from './command';
import { SceneService } from '../../three/scene.service';
import { ObjectService } from '../../three/objects.service';
import { THREE } from '../../three/three';

export class AddSphereCommand implements Command {

  private mesh!: THREE.Mesh;
  private objectId!: string;

  constructor(
    private sceneService: SceneService,
    private objectService: ObjectService,
    private projectId: string
  ) {}

  execute(): void {
    this.mesh = this.sceneService.addSphere();

    const payload = {
      type: 'mesh',
      geometry: 'sphere',
      material: { color: '#00ff00' }
    };

    this.objectService
      .create(this.projectId, payload)
      .subscribe((res: any) => {
        this.objectId = res.object_id;
        this.mesh.userData['objectId'] = this.objectId;

        // 🔴 THIS WAS MISSING
        this.sceneService.registerLoadedObject(this.mesh);
      });
  }


  undo(): void {
    if (!this.objectId) return;

    this.sceneService.removeObject(this.mesh);
    this.objectService.delete(this.projectId, this.objectId).subscribe();
  }
}
