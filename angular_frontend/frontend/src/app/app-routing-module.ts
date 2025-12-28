import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home-component/home-component';
import { EditorComponent } from './editor/editor';
import { AuthComponent } from './auth-component/auth-component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'login', component: AuthComponent },
  { path: 'home', component: HomeComponent },

  { path: 'editor/:projectId', component: EditorComponent },

  // Fallback
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
