import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Board, CreateBoardRequest } from '../models/board.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private apiUrl = `${environment.apiUrl}/api/boards`;

  constructor(private http: HttpClient) {}

  getMyBoards(): Observable<ApiResponse<Board[]>> {
    return this.http.get<ApiResponse<Board[]>>(`${this.apiUrl}/my`);
  }

  getByWorkspace(workspaceId: number): Observable<ApiResponse<Board[]>> {
    return this.http.get<ApiResponse<Board[]>>(
      `${this.apiUrl}/workspace/${workspaceId}`
    );
  }

  getById(id: number): Observable<ApiResponse<Board>> {
    return this.http.get<ApiResponse<Board>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateBoardRequest): Observable<ApiResponse<Board>> {
    return this.http.post<ApiResponse<Board>>(this.apiUrl, request);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getMembers(boardId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${boardId}/members`);
  }
}