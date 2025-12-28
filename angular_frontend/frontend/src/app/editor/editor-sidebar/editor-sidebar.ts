import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Object3D } from 'three';
import { SceneService } from '../../three/scene.service';
import { SelectionService } from '../../three/selection.service';

@Component({
  selector: 'app-editor-sidebar',
  standalone: false,
  templateUrl: './editor-sidebar.html',
  styleUrl: './editor-sidebar.css',
})

export class EditorSidebar {

  objects$!: Observable<Object3D[]>;
  selected$!: Observable<Object3D | null>;

  constructor(
    private sceneService: SceneService,
    private selectionService: SelectionService
  ) {}

  ngOnInit(): void {
    this.objects$ = this.sceneService.objects$;
    this.selected$ = this.selectionService.selected$;
  }

  select(obj: Object3D) {
    this.selectionService.setSelected(obj);
  }

  trackById(_: number, obj: Object3D) {
    return obj.userData['objectId'] ?? obj.uuid;
  }

  getDisplayName(obj: Object3D): string {
    return obj.userData['objectId'] || obj.name || 'Object';
  }

}