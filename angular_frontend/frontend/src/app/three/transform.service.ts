import { Injectable } from '@angular/core';
import { TransformControls } from 'three-stdlib';
import { Camera, Scene, Object3D, Vector3, Euler } from 'three';
import { OrbitService } from './orbit.service';
import { SelectionService } from './selection.service';
import { CommandsService } from './commands.service';
import { UpdateTransformCommand } from '../editor/commands/update-transform.command';

@Injectable({ providedIn: 'root' })
export class TransformService {
  private controls!: TransformControls;
  private isDragging = false;

  private startPosition!: Vector3;
  private startRotation!: Euler;
  private startScale!: Vector3;

  constructor(
    private orbitService: OrbitService,
    private selectionService: SelectionService,
    private commandsService: CommandsService
  ) {}

  init(camera: Camera, domElement: HTMLElement, scene: Scene) {
    this.controls = new TransformControls(camera, domElement);
    scene.add(this.controls);

    /* =========================
       Drag start / end
       ========================= */
    this.controls.addEventListener(
      'dragging-changed' as any,
      (event: any) => {
        const dragging = event.value === true;
        this.isDragging = dragging;

        if (this.orbitService?.controls) {
          this.orbitService.controls.enabled = !dragging;
        }

        const obj = (this.controls as unknown as { object: Object3D | null }).object;

        if (!obj) return;

        if (dragging) {
          this.startPosition = obj.position.clone();
          this.startRotation = obj.rotation.clone();
          this.startScale = obj.scale.clone();
        } else {
          obj.updateMatrixWorld(true);
          this.commitTransform(obj);
        }
      }
    );

    /* =========================
       Live inspector sync
       ========================= */
    this.controls.addEventListener('change' as any, () => {
      if (this.isDragging) {
        this.selectionService.refreshSelectionDTO();
      }
    });

    this.controls.setSpace('world');
  }

  /* =========================
     Commit logic
     ========================= */

  commitTransform(obj: Object3D) {
    const mode = this.controls.getMode();

    if (mode === 'translate') {
      this.commitVec3(obj, 'position', this.startPosition);
    }

    if (mode === 'scale') {
      this.commitVec3(obj, 'scale', this.startScale);
    }

    if (mode === 'rotate') {
      this.commitEuler(obj, this.startRotation);
    }
  }

  private commitVec3(
    obj: Object3D,
    type: 'position' | 'scale',
    from: Vector3
  ) {
    (['x', 'y', 'z'] as const).forEach((axis, i) => {
      const index = i as 0 | 1 | 2;
      if (obj[type][axis] !== from[axis]) {
        this.commandsService.execute(
          new UpdateTransformCommand(obj, type, index, obj[type][axis])
        );
      }
    });
  }

  private commitEuler(obj: Object3D, from: Euler) {
    if (obj.rotation.x !== from.x) {
      this.commandsService.execute(
        new UpdateTransformCommand(obj, 'rotation', 0, obj.rotation.x)
      );
    }
    if (obj.rotation.y !== from.y) {
      this.commandsService.execute(
        new UpdateTransformCommand(obj, 'rotation', 1, obj.rotation.y)
      );
    }
    if (obj.rotation.z !== from.z) {
      this.commandsService.execute(
        new UpdateTransformCommand(obj, 'rotation', 2, obj.rotation.z)
      );
    }
  }

  /* =========================
     Public API
     ========================= */

  get dragging(): boolean {
    return this.isDragging;
  }

  attach(object: Object3D) {
    this.controls.attach(object);
    console.log('Transform attached to:', object.userData['objectId']);
  }

  detach() {
    this.controls.detach();
  }

  setMode(mode: 'translate' | 'rotate' | 'scale') {
    this.controls.setMode(mode);
  }
}
