import { Component } from '@angular/core';
import { SelectionService } from '../../three/selection.service';
import { Observable } from 'rxjs';
import { SelectedObjectDTO } from '../../three/selection.service';


@Component({
  selector: 'app-object-inspector',
  standalone: false,
  templateUrl: './object-inspector.html',
  styleUrl: './object-inspector.css',
})

export class ObjectInspectorComponent {
  selection$: Observable<SelectedObjectDTO | null>;

  constructor(private selectionService: SelectionService) {
    this.selection$ = this.selectionService.selection$;
  }
}
