import { THREE } from '../three/three'; // adjust relative path
import { TransformControls } from 'three/addons/controls/TransformControls.js';

declare module 'three/addons/controls/TransformControls.js' {
  interface TransformControls extends THREE.Object3D {}
}
