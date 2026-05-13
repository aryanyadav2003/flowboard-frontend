import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Card, CreateCardRequest, MoveCardRequest } from '../models/card.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private apiUrl = `${environment.apiUrl}/api/cards`;

  constructor(private http: HttpClient) {}

  getByList(listId: number): Observable<ApiResponse<Card[]>> {
    return this.http.get<ApiResponse<Card[]>>(`${this.apiUrl}/list/${listId}`);
  }

  getById(id: number): Observable<ApiResponse<Card>> {
    return this.http.get<ApiResponse<Card>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCardRequest): Observable<ApiResponse<Card>> {
    return this.http.post<ApiResponse<Card>>(this.apiUrl, request);
  }

  update(id: number, data: any): Observable<ApiResponse<Card>> {
    return this.http.put<ApiResponse<Card>>(`${this.apiUrl}/${id}`, data);
  }

  move(id: number, request: MoveCardRequest): Observable<ApiResponse<Card>> {
    return this.http.put<ApiResponse<Card>>(
      `${this.apiUrl}/${id}/move`, request
    );
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  assignUser(cardId: number, userId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${cardId}/assign`, { userId }
    );
  }

  unassignUser(cardId: number, userId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${cardId}/unassign/${userId}`
    );
  }

  archive(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/archive`, {});
  }

  getMyTasks(): Observable<ApiResponse<Card[]>> {
    return this.http.get<ApiResponse<Card[]>>(`${this.apiUrl}/my-tasks`);
  }
}