import { THREE } from '../../three/three';

export class UpdateTransformCommand {
  private prevValue: number;

  constructor(
    private mesh: THREE.Object3D,
    private type: 'position' | 'rotation' | 'scale',
    private axis: 0 | 1 | 2,
    private nextValue: number
  ) {
    this.prevValue = this.read();
  }

  execute(): void {
    this.write(this.nextValue);
  }

  undo(): void {
    this.write(this.prevValue);
  }

  // =========================
  // Internal helpers
  // =========================

  private read(): number {
    switch (this.type) {
      case 'position':
        return this.mesh.position.getComponent(this.axis);

      case 'scale':
        return this.mesh.scale.getComponent(this.axis);

      case 'rotation':
        return this.axis === 0
          ? this.mesh.rotation.x
          : this.axis === 1
          ? this.mesh.rotation.y
          : this.mesh.rotation.z;
    }
  }

  private write(value: number): void {
    switch (this.type) {
      case 'position':
        this.mesh.position.setComponent(this.axis, value);
        break;

      case 'scale':
        this.mesh.scale.setComponent(this.axis, value);
        break;

      case 'rotation':
        if (this.axis === 0) this.mesh.rotation.x = value;
        if (this.axis === 1) this.mesh.rotation.y = value;
        if (this.axis === 2) this.mesh.rotation.z = value;
        break;
    }

    this.mesh.updateMatrixWorld(true);
  }
}
