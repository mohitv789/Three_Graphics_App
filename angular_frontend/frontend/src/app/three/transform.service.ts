import { Injectable } from '@angular/core';
import { TransformControls } from 'three-stdlib';
import { Camera, Scene, Object3D } from 'three';
import { OrbitService } from './orbit.service';

@Injectable({ providedIn: 'root' })
export class TransformService {
  private controls!: TransformControls;
  private isDragging = false;

  onTransformCommit?: (obj: Object3D) => void;

  constructor(private orbitService: OrbitService) {}

  init(camera: Camera, domElement: HTMLElement, scene: Scene) {
    this.controls = new TransformControls(camera, domElement);
    scene.add(this.controls);

    // 🔴 PRIMARY COMMIT POINT
    this.controls.addEventListener(
      'dragging-changed' as any,
      (event: any) => {
        const dragging = event.value === true;
        this.isDragging = dragging;

        // Disable orbit while dragging
        if (this.orbitService?.controls) {
          this.orbitService.controls.enabled = !dragging;
        }

        // 🔑 Commit transform when drag ends
        if (!dragging) {
          const obj = (this.controls as any).object as Object3D | null;
          if (obj && this.onTransformCommit) {
            obj.updateMatrixWorld(true);
            this.onTransformCommit(obj);
          }
        }
      }
    );

    this.controls.setSpace('world');
  }

  /* -----------------------------
     Public API
  ------------------------------ */

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
