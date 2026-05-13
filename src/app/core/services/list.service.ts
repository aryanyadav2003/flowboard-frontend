import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskList, CreateListRequest } from '../models/list.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ListService {
  private apiUrl = `${environment.apiUrl}/api/lists`;

  constructor(private http: HttpClient) {}

  getByBoard(boardId: number): Observable<ApiResponse<TaskList[]>> {
    return this.http.get<ApiResponse<TaskList[]>>(
      `${this.apiUrl}/board/${boardId}`
    );
  }

  create(request: CreateListRequest): Observable<ApiResponse<TaskList>> {
    return this.http.post<ApiResponse<TaskList>>(this.apiUrl, request);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}