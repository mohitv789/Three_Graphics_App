import { Component, Input } from '@angular/core';
import { SelectionService } from '../../three/selection.service';
import { Observable } from 'rxjs';
import { SelectedObjectDTO } from '../../three/selection.service';
import { CommandsService } from '../../three/commands.service';
import { UpdateTransformCommand } from '../commands/update-transform.command';
import { ChangeMaterialCommand } from '../commands/change-material.command';
import { ObjectService } from '../../three/objects.service';
import { THREE } from '../../three/three';

@Component({
  selector: 'app-object-inspector',
  standalone: false,
  templateUrl: './object-inspector.html',
  styleUrl: './object-inspector.css',
})

export class ObjectInspectorComponent {
  selection$: Observable<SelectedObjectDTO | null>;
  @Input() projectId!: string;
  constructor(private selectionService: SelectionService,private commandsService: CommandsService, private objectService: ObjectService) {
    this.selection$ = this.selectionService.selection$;
  }
  updateTransform(
    type: 'position' | 'rotation' | 'scale',
    axis: 0 | 1 | 2,
    value: string
  ) {
    const numericValue = parseFloat(value);
    if (Number.isNaN(numericValue)) return;

    const mesh = this.selectionService.getSelectedMesh();
    if (!mesh) return;

    this.commandsService.execute(
      new UpdateTransformCommand(mesh, type, axis, numericValue)
    );
  }
  radToDeg(rad: number): number {
    return rad * 180 / Math.PI;
  }
  degToRad(deg: number): number {
    return deg * Math.PI / 180;
  }
  updateRotation(axis: 0 | 1 | 2, value: string): void {
    const deg = parseFloat(value);
    if (Number.isNaN(deg)) return;

    const rad = this.degToRad(deg);

    const mesh = this.selectionService.getSelectedMesh();
    if (!mesh) return;

    this.commandsService.execute(
      new UpdateTransformCommand(mesh, 'rotation', axis, rad)
    );
  }
  

  updateMaterialColor(hex: string) {
    const selected = this.selectionService.getSelectedMesh();
    if (!selected) return;

    // ✅ TYPE NARROWING (THIS FIXES TS2345)
    if (!(selected instanceof THREE.Mesh)) return;

    const cmd = new ChangeMaterialCommand(
      selected,
      parseInt(hex.replace('#', ''), 16),
      this.selectionService,
      this.objectService,
      this.projectId
    );

    this.commandsService.execute(cmd);
  }



}
