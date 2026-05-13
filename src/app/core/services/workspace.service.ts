import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workspace, CreateWorkspaceRequest } from '../models/workspace.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private apiUrl = `${environment.apiUrl}/api/workspaces`;

  constructor(private http: HttpClient) {}

  getMyWorkspaces(): Observable<ApiResponse<Workspace[]>> {
    return this.http.get<ApiResponse<Workspace[]>>(`${this.apiUrl}/my`);
  }

  getById(id: number): Observable<ApiResponse<Workspace>> {
    return this.http.get<ApiResponse<Workspace>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateWorkspaceRequest): Observable<ApiResponse<Workspace>> {
    return this.http.post<ApiResponse<Workspace>>(this.apiUrl, request);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}