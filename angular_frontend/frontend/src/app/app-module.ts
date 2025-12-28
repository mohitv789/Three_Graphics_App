import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { EditorComponent } from './editor/editor';
import { ProjectService } from './core/api/project.service';
import { CameraService } from './three/camera.service';
import { SceneService } from './three/scene.service';
import { RendererService } from './three/renderer.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ObjectService } from './three/objects.service';
import { SelectionService } from './three/selection.service';
import { TransformService } from './three/transform.service';
import { HomeComponent } from './home-component/home-component';
import { AuthComponent } from './auth-component/auth-component';
import { AuthService } from './auth-component/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavComponent } from './nav-component/nav-component';
import { OrbitService } from './three/orbit.service';
import { CommandsService } from './three/commands.service';
import { ObjectInspectorComponent} from './editor/object-inspector/object-inspector';
import { EditorSidebar } from './editor/editor-sidebar/editor-sidebar';

@NgModule({
  declarations: [
    App,
    EditorComponent,
    HomeComponent,
    AuthComponent,
    NavComponent,
    ObjectInspectorComponent,
    EditorSidebar
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    AuthService,
    ProjectService,
    CameraService,
    SceneService,
    RendererService,
    ObjectService,
    SelectionService,
    TransformService,
    OrbitService,
    CommandsService
  ],
  bootstrap: [App]
})
export class AppModule { }
