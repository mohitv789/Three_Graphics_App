import { THREE } from '../three/three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class OrbitService {
  controls!: OrbitControls;

  init(
    camera: THREE.Camera,
    domElement: HTMLElement
  ): void {
    this.controls = new OrbitControls(camera, domElement);
    this.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;

    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  update(): void {
    this.controls.update();
  }

  dispose(): void {
    this.controls.dispose();
  }

  recenterOn(target: THREE.Object3D) {
    const controls = this.controls;

    // Move orbit pivot
    controls.target.copy(target.position);

    // Optional: keep camera distance
    const distance = controls.object.position
      .clone()
      .sub(controls.target)
      .length();

    const dir = controls.object.position
      .clone()
      .sub(controls.target)
      .normalize();

    controls.object.position
      .copy(target.position)
      .add(dir.multiplyScalar(distance));

    controls.update();
  }

}
