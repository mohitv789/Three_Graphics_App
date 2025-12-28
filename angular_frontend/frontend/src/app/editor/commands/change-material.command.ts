import { Command } from './command';
import { THREE } from '../../three/three';
import { SelectionService } from '../../three/selection.service';

export class ChangeMaterialCommand implements Command {

  private previousColors: number[] | null = null;

  constructor(
    private mesh: THREE.Mesh,
    private newColor: number,
    private selectionService: SelectionService
  ) {}

  execute(): void {
    const materials = this.getStandardMaterials();
    if (!materials.length) return;

    this.previousColors = materials.map(m => m.color.getHex());
    materials.forEach(m => m.color.setHex(this.newColor));

    this.selectionService.setSelected(this.mesh);
  }

  undo(): void {
    if (!this.previousColors) return;

    const materials = this.getStandardMaterials();
    if (materials.length !== this.previousColors.length) return;

    materials.forEach((m, i) =>
      m.color.setHex(this.previousColors![i])
    );

    this.selectionService.setSelected(this.mesh);
  }

  /**
   * Narrow material type safely
   */
  private getStandardMaterials(): THREE.MeshStandardMaterial[] {
    const mat = this.mesh.material;

    if (Array.isArray(mat)) {
      return mat.filter(
        (m): m is THREE.MeshStandardMaterial =>
          m instanceof THREE.MeshStandardMaterial
      );
    }

    if (mat instanceof THREE.MeshStandardMaterial) {
      return [mat];
    }

    return [];
  }
}
