import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Checklist, ChecklistItem } from '../models/checklist.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private apiUrl = `${environment.apiUrl}/api/checklists`;

  constructor(private http: HttpClient) {}

  getByCard(cardId: number): Observable<ApiResponse<Checklist[]>> {
    return this.http.get<ApiResponse<Checklist[]>>(
      `${this.apiUrl}/card/${cardId}`
    );
  }

  create(cardId: number, title: string): Observable<ApiResponse<Checklist>> {
    return this.http.post<ApiResponse<Checklist>>(
      this.apiUrl, { cardId, title }
    );
  }

  addItem(checklistId: number, text: string): Observable<ApiResponse<ChecklistItem>> {
    return this.http.post<ApiResponse<ChecklistItem>>(
      `${this.apiUrl}/${checklistId}/items`, { text }
    );
  }

  toggleItem(itemId: number): Observable<ApiResponse<ChecklistItem>> {
    return this.http.put<ApiResponse<ChecklistItem>>(
      `${this.apiUrl}/items/${itemId}/toggle`, {}
    );
  }

  deleteItem(itemId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/items/${itemId}`
    );
  }

  delete(checklistId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${checklistId}`
    );
  }
}