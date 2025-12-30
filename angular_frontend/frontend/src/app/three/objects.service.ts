import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../config';

@Injectable({ providedIn: 'root' })
export class ObjectService {

  constructor(private http: HttpClient) {}

  list(projectId: string) {
    return this.http.get<any[]>(
      `${BASE_URL}/projects/${projectId}/objects/`,
      { withCredentials: true }
    );
  }

  create(projectId: string, payload: any) {
    return this.http.post(
      `${BASE_URL}/projects/${projectId}/objects/`,
      payload,
      { withCredentials: true }
    );
  }

  update(projectId: string, objectId: string, payload: any) {
    return this.http.put(
      `${BASE_URL}/projects/${projectId}/objects/${objectId}/`,
      payload,
      { withCredentials: true }
    );
  }

  delete(projectId: string, objectId: string) {
    return this.http.delete(
      `${BASE_URL}/projects/${projectId}/objects/${objectId}/`,
      { withCredentials: true }
    );
  }
}
