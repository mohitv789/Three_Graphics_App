import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private base = '/api/projects/';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/projects/
   * List all projects for the logged-in user
   */
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.base, {
      withCredentials: true,
    });
  }

  /**
   * POST /api/projects/
   * Create a new project
   */
  create(name: string): Observable<{ project_id: string }> {
    return this.http.post<{ project_id: string }>(
      this.base,
      { name },
      { withCredentials: true }
    );
  }

  /**
   * GET /api/projects/:projectId/
   * Load project meta + scene
   */
  getProjectDetail(projectId: string): Observable<{
    project: any;
    scene: any;
  }> {
    return this.http.get<{
      project: any;
      scene: any;
    }>(`${this.base}${projectId}/`, {
      withCredentials: true,
    });
  }

  /**
   * POST /api/projects/:projectId/scene/
   * Save full scene JSON
   */
  saveScene(projectId: string, scene: any): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(
      `${this.base}${projectId}/scene/`,
      { scene },
      { withCredentials: true }
    );
  }

  loadScene(projectId: string) {
    return this.http.get(
      `${this.base}${projectId}/scene`,
      { withCredentials: true }
    );
  }
}
