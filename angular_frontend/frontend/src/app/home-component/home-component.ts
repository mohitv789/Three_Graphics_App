import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';


import { AuthService } from '../auth-component/auth.service';
import { ProjectService } from '../core/api/project.service';

@Component({
  selector: 'app-home-component',
  templateUrl: './home-component.html',
  standalone: false,
  styleUrls: ['./home-component.css'],
})
export class HomeComponent implements OnInit {

  projects$!: Observable<any[]>;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projects$ = this.projectService.getAll().pipe(
      tap(projects => console.log('Projects loaded:', projects)),
      catchError(err => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        throw err;
      })
    );
  }

  createNewProject(): void {
    const name = `Project ${new Date().toLocaleString()}`;

    this.projectService.create(name).subscribe({
      next: (project) => this.openProject(project.project_id),
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  openProject(id: string): void {
    this.router.navigate(['/editor', id]);
  }
}
