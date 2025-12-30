import { BehaviorSubject } from 'rxjs';
import { THREE } from '../three/three';

export type SceneObjectType = 'cube' | 'sphere' | 'cylinder';


export interface SceneObject {
  id: string;
  type: SceneObjectType;
  mesh: THREE.Object3D;
}

export class SceneService {

  scene!: THREE.Scene;

  /** Group that holds ONLY user-created objects */
  private objectsGroup!: THREE.Group;

  init(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#202020');

    this.addLights();
    this.addGrid();
    this.createObjectsGroup();
  }

  /** -------------------------
   *  Helpers (not persisted)
   *  ------------------------- */
  private addLights(): void {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
  }

  private addGrid(): void {
    const grid = new THREE.GridHelper(20, 20);
    this.scene.add(grid);
  }


  private createObjectsGroup(): void {
    this.objectsGroup = new THREE.Group();
    this.objectsGroup.name = 'USER_OBJECTS';
    this.scene.add(this.objectsGroup);
    this.emitObjects();
  }


  removeObject(object: THREE.Object3D): void {
    this.objectsGroup.remove(object);
    this.emitObjects();               // 🔴 IMPORTANT
  }

  clearObjects(): void {
    this.objectsGroup.clear();
    this.emitObjects();               // 🔴 IMPORTANT
  }

  registerLoadedObject(mesh: THREE.Object3D) {
    this.objectsGroup.add(mesh);
    this.emitObjects();               // 🔴 IMPORTANT
  }

  /** -------------------------
   *  Scene mutations
   *  ------------------------- */
  /** -------------------------
   *  Serialization (save)
   *  ------------------------- */
  
  commitObjectTransform(object: THREE.Object3D): void {
    if (!object.userData['objectId']) return;
    object.updateMatrixWorld(true);
  }


  /** -------------------------
   *  Deserialization (load)
   *  ------------------------- */
  

  getSceneSnapshot() {
    const objects: any[] = [];

    this.objectsGroup.children.forEach(obj => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (!obj.userData['objectId']) return;

      const material = obj.material instanceof THREE.MeshStandardMaterial
        ? obj.material
        : Array.isArray(obj.material) && obj.material[0] instanceof THREE.MeshStandardMaterial
          ? obj.material[0]
          : null;

      objects.push({
        object_id: obj.userData['objectId'],
        position: obj.position.toArray(),
        quaternion: obj.quaternion.toArray(),
        scale: obj.scale.toArray(),
        material: material
          ? { color: `#${material.color.getHexString()}` }
          : undefined
      });
    });

    return { objects };
  }





  createMeshFromObjectPayload(payload: any): THREE.Mesh {
    let geometry: THREE.BufferGeometry;

    switch (payload.geometry?.type) {
      case 'sphere': {
        const p = payload.geometry.params;
        geometry = new THREE.SphereGeometry(
          p.radius ?? 0.5,
          p.widthSegments ?? 32,
          p.heightSegments ?? 16
        );
        break;
      }

      case 'cylinder': {
        const p = payload.geometry.params;
        geometry = new THREE.CylinderGeometry(
          p.radiusTop ?? 0.5,
          p.radiusBottom ?? 0.5,
          p.height ?? 1,
          p.radialSegments ?? 32
        );
        break;
      }

      case 'box':
      default: {
        const p = payload.geometry.params;
        geometry = new THREE.BoxGeometry(
          p.width ?? 1,
          p.height ?? 1,
          p.depth ?? 1
        );
        geometry.translate(0, (p.height ?? 1) / 2, 0);
        break;
      }
    }

    const material = new THREE.MeshStandardMaterial({
      color: payload.material?.color ?? '#ffffff'
    });

    const mesh = new THREE.Mesh(geometry, material);

    // 🔑 REQUIRED for updates & undo
    mesh.userData['payload'] = payload;
    mesh.userData['type'] = payload.geometry.type;

    return mesh;
  }


  syncWorldMatrices(): void {
    this.objectsGroup.children.forEach(obj => {
      obj.updateMatrixWorld(true);
    });
  }
  private objectsSubject =
      new BehaviorSubject<THREE.Object3D[]>([]);
  objects$ = this.objectsSubject.asObservable();

  private emitObjects() {
    Promise.resolve().then(() => {
      this.objectsSubject.next([...this.objectsGroup.children]);
    });
  }

  addCube(): THREE.Mesh {
  // Renderer-only concerns
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000
    });

    const cube = new THREE.Mesh(geometry, material);

    // Default transform (scene-level, not geometry-level)
    cube.position.set(0, 0.5, 0);

    // Identity only (no schema, no intent)
    cube.userData['objectId'] = null;

    this.objectsGroup.add(cube);
    this.emitObjects();
    return cube;
  }

  // three/scene.service.ts
  addSphere(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0.5, 0);

    sphere.userData['type'] = 'sphere';

    // ✅ MUST go into objectsGroup
    this.objectsGroup.add(sphere);
    this.emitObjects();

    return sphere;
  }


// three/scene.service.ts
  addCylinder(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, 0.5, 0);

    cylinder.userData['type'] = 'cylinder';

    // ✅ MUST go into objectsGroup
    this.objectsGroup.add(cylinder);
    this.emitObjects();

    return cylinder;
  }

  addExistingObject(object: THREE.Object3D): void {
    this.objectsGroup.add(object);
    this.emitObjects();
  }





}
