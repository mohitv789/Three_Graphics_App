import { Object3D, Mesh, Material, Color } from 'three';

export class UpdateMaterialColorCommand {
  private prevColor?: string; // hex WITHOUT '#'

  constructor(
    private object: Object3D,
    private nextHex: string   // expects '#rrggbb'
  ) {
    const mat = this.getMaterial();
    this.prevColor = mat?.color?.getHexString();
  }

  execute(): void {
    const mat = this.getMaterial();
    if (!mat?.color) return;

    mat.color.set(this.nextHex);
    mat.needsUpdate = true;
  }

  undo(): void {
    const mat = this.getMaterial();
    if (!mat?.color || !this.prevColor) return;

    mat.color.set('#' + this.prevColor);
    mat.needsUpdate = true;
  }

  // =========================
  // Type-safe material access
  // =========================
  private getMaterial(): (Material & { color?: Color }) | null {
    if (!(this.object instanceof Mesh)) return null;

    const mat = this.object.material;
    return Array.isArray(mat) ? mat[0] : mat;
  }
}
