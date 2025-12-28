import { THREE } from '../three/three'; // adjust relative path
export class CameraService {
  camera!: THREE.PerspectiveCamera;

  init() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }
}
