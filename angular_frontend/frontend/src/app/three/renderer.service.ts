import { THREE } from '../three/three'; // adjust relative path

import { WebGLRenderer } from 'three';
export class RendererService {
  renderer!: THREE.WebGLRenderer;

  init(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.resize();
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);
  }

  get domElement(): HTMLElement {
    if (!this.renderer) {
      throw new Error(
        'RendererService: renderer not initialized. Call init(canvas) first.'
      );
    }
    return this.renderer.domElement;
  }


  get instance(): WebGLRenderer {
    return this.renderer;
  }
}
