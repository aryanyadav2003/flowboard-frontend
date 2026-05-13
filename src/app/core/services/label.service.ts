import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Label, CardLabel } from '../models/label.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class LabelService {
  private apiUrl = `${environment.apiUrl}/api/labels`;

  constructor(private http: HttpClient) {}

  getByBoard(boardId: number): Observable<ApiResponse<Label[]>> {
    return this.http.get<ApiResponse<Label[]>>(
      `${this.apiUrl}/board/${boardId}`
    );
  }

  getByCard(cardId: number): Observable<ApiResponse<CardLabel[]>> {
    return this.http.get<ApiResponse<CardLabel[]>>(
      `${this.apiUrl}/card/${cardId}`
    );
  }

  create(boardId: number, name: string, color: string): Observable<ApiResponse<Label>> {
    return this.http.post<ApiResponse<Label>>(
      this.apiUrl, { boardId, name, color }
    );
  }

  assignToCard(labelId: number, cardId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${labelId}/assign`, { cardId }
    );
  }

  removeFromCard(labelId: number, cardId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${labelId}/unassign/${cardId}`
    );
  }
}