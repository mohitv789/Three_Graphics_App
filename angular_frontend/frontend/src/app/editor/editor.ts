import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
  OnInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { THREE } from '../three/three';
import { SceneService } from '../three/scene.service';
import { CameraService } from '../three/camera.service';
import { RendererService } from '../three/renderer.service';
import { SelectionService } from '../three/selection.service';
import { ObjectService } from '../three/objects.service';
import { ProjectService } from '../core/api/project.service';
import { OrbitService } from '../three/orbit.service';
import { CommandsService } from '../three/commands.service';
import { AddCubeCommand } from './commands/add-cube.command';
import { TransformService } from '../three/transform.service';
import { AddSphereCommand } from './commands/add-sphere.command';
import { AddCylinderCommand } from './commands/add-cylinder.command';
import { ChangeMaterialCommand } from './commands/change-material.command';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.html',
  styleUrls: ['./editor.css'],
  standalone: false
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  projectId!: string;
  saving = false;

  constructor(
    private sceneService: SceneService,
    private cameraService: CameraService,
    private rendererService: RendererService,
    private selectionService: SelectionService,
    private objectService: ObjectService,
    private projectService: ProjectService,
    private orbitService: OrbitService,
    public commandsService: CommandsService,
    private transformService: TransformService,
    private zone: NgZone,
    private route: ActivatedRoute
  ) {}

  /* -----------------------------
     Lifecycle
  ------------------------------ */

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;

    /* 1️⃣ Core THREE init (ONCE) */
    this.sceneService.init();
    this.cameraService.init();
    this.rendererService.init(canvas);

    /* 2️⃣ Camera controls */
    this.orbitService.init(
      this.cameraService.camera,
      this.rendererService.domElement
    );

    /* 3️⃣ Transform controls */
    this.transformService.init(
      this.cameraService.camera,
      this.rendererService.domElement,
      this.sceneService.scene
    );

    this.rendererService.domElement.style.touchAction = 'none';

    /* 4️⃣ Selection → Transform binding */
    this.selectionService.selection$.subscribe(obj => {
      if (obj) {
        this.transformService.attach(this.selectionService.getSelectedMesh()!);
      } else {
        this.transformService.detach();
      }
    });


    /* 5️⃣ Transform commit hook */
    this.transformService.commitTransform = (obj: any) => {
      this.sceneService.commitObjectTransform(obj);
    };

    /* 6️⃣ Mouse picking */
    canvas.addEventListener('pointerdown', e => this.onSelect(e));

    /* 7️⃣ Load persisted scene */
    this.loadProjectScene();

    /* 8️⃣ Render loop */
    this.animate();
  }

  /* -----------------------------
     Render loop
  ------------------------------ */

  private animate(): void {
    this.zone.runOutsideAngular(() => {
      const loop = () => {
        requestAnimationFrame(loop);

        this.orbitService.update();
        this.rendererService.render(
          this.sceneService.scene,
          this.cameraService.camera
        );
      };
      loop();
    });
  }

  /* -----------------------------
     Selection
  ------------------------------ */

  onSelect(event: MouseEvent): void {
    if (event.button !== 0) return; // left click only

    // ignore transform gizmo clicks
    if ((event.target as HTMLElement).closest('.transform-controls')) return;

    // ignore while dragging transform
    if (this.transformService.dragging) return;

    this.selectionService.select(
      event,
      this.cameraService.camera,
      this.sceneService.scene,
      this.rendererService.domElement
    );
  }

  /* -----------------------------
     Transform mode
  ------------------------------ */

  setTransform(mode: 'translate' | 'rotate' | 'scale') {
    this.transformService.setMode(mode);
  }

  /* -----------------------------
     Object creation
  ------------------------------ */

  addCube(): void {
    const cmd = new AddCubeCommand(
      this.sceneService,
      this.objectService,
      this.projectId
    );
    this.commandsService.execute(cmd);
  }

  addSphere() {
    const cmd = new AddSphereCommand(
      this.sceneService,
      this.objectService,
      this.projectId
    );

    this.commandsService.execute(cmd);
  }
  addCylinder() {
    const cmd = new AddCylinderCommand(
      this.sceneService,
      this.objectService,
      this.projectId
    );

    this.commandsService.execute(cmd);
  }
  changeColor(hex: number) {
    const mesh = this.selectionService.getSelectedMesh() as THREE.Mesh;
    if (!mesh) return;

    const cmd = new ChangeMaterialCommand(
      mesh,
      hex,
      this.selectionService,
      this.objectService,
      this.projectId
    );

    this.commandsService.execute(cmd);
  }


  /* -----------------------------
     Save scene
  ------------------------------ */

  saveScene(): void {
    this.saving = true;

    this.sceneService.syncWorldMatrices();

    const snapshot = this.sceneService.getSceneSnapshot();

    const payload = {
      objects: snapshot.objects,
      camera: {
        position: this.cameraService.camera.position.toArray()
      }
    };

    this.projectService.saveScene(this.projectId, payload).subscribe({
      next: () => this.saving = false,
      error: () => this.saving = false
    });
  }


  /* -----------------------------
     Load scene
  ------------------------------ */

  loadProjectScene(): void {
    this.projectService
      .getProjectDetail(this.projectId)
      .subscribe(projectRes => {

        // ✅ FIXED: unwrap scene.scene
        const sceneSnapshot = projectRes.scene?.scene ?? {};

        this.objectService
          .list(this.projectId)
          .subscribe(objectsRes => {

            const sceneObjects = sceneSnapshot.objects;

            if (Array.isArray(sceneObjects) && sceneObjects.length > 0) {

              const objectMap = new Map<string, any>();
              objectsRes.forEach(o => objectMap.set(o.object_id, o.payload));

              sceneObjects.forEach((ref: any) => {
                const payload = objectMap.get(ref.object_id);
                if (!payload) return;

                const mesh =
                  this.sceneService.createMeshFromObjectPayload(payload);

                mesh.position.fromArray(ref.position);
                mesh.quaternion.fromArray(ref.quaternion);
                mesh.scale.fromArray(ref.scale);

                if (ref.material?.color && mesh.material instanceof THREE.MeshStandardMaterial) {
                  mesh.material.color.set(ref.material.color);
                }


                mesh.userData['objectId'] = ref.object_id;
                mesh.userData['payload'] = ref.payload;
                this.sceneService.registerLoadedObject(mesh);
              });

              return;
            }
          });
      });
  }



  /* -----------------------------
     Recenter
  ------------------------------ */

  recenterOnSelection(): void {
    const obj = this.selectionService.getSelectedMesh();
    if (!obj) return;

    this.orbitService.recenterOn(obj);
  }

  /* -----------------------------
     Shortcuts
  ------------------------------ */

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      this.commandsService.undo();
    }

    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      this.commandsService.redo();
    }

    if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      this.recenterOnSelection();
    }
  }
}
