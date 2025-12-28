import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { THREE } from '../three/three';
import { Object3D } from 'three';

export interface SelectedObjectDTO {
  objectId: string;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  material?: {
    color?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selectedSubject = new BehaviorSubject<Object3D | null>(null);

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private selectedMesh: THREE.Object3D | null = null;

  private selectedObject$ =
    new BehaviorSubject<SelectedObjectDTO | null>(null);
  selected$ = this.selectedSubject.asObservable();
  /** Observable used by UI (Inspector, panels, AI, etc.) */
  selection$ = this.selectedObject$.asObservable();

  /** Internal raycast selection */
  select(
    event: MouseEvent,
    camera: THREE.Camera,
    scene: THREE.Scene,
    domElement: HTMLElement
  ): void {
    if ((event.target as HTMLElement).closest('.transform-controls')) {
      return;
    }
    const rect = domElement.getBoundingClientRect();

    this.mouse.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(
      scene.children.filter(
        obj => obj.type !== 'TransformControls'
      ),
      true
    );

    if (intersects.length > 0) {
      this.setSelectedMesh(intersects[0].object);
    } else {
      this.clearSelection();
    }
  }

  private setSelectedMesh(mesh: THREE.Object3D): void {
    this.selectedMesh = mesh;

    let material;

    if (mesh instanceof THREE.Mesh) {
      const mat = mesh.material;

      material = Array.isArray(mat)
        ? { color: mat[0]?.color?.getHexString?.() }
        : { color: mat?.color?.getHexString?.() };
    }

    this.selectedSubject.next(mesh);
    const dto: SelectedObjectDTO = {
      objectId: mesh.userData['objectId'],
      transform: {
        position: mesh.position.toArray() as [number, number, number],
        rotation: [
          mesh.rotation.x,
          mesh.rotation.y,
          mesh.rotation.z
        ],
        scale: mesh.scale.toArray() as [number, number, number]
      },
      material
    };

    this.selectedObject$.next(dto);

  }


  clearSelection(): void {
    this.selectedMesh = null;
    this.selectedSubject.next(null);
    this.selectedObject$.next(null);
  }


  get selected(): Object3D | null {
    return this.selectedSubject.value;
  }
  /** Optional: internal access for command engine */
  getSelectedMesh(): THREE.Object3D | null {
    return this.selectedMesh;
  }

  setSelected(mesh: THREE.Object3D): void {
    this.setSelectedMesh(mesh);
  }
}
