import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardService } from '../../core/services/board.service';
import { ListService } from '../../core/services/list.service';
import { CardService } from '../../core/services/card.service';
import { Board } from '../../core/models/board.model';
import { TaskList } from '../../core/models/list.model';
import { Card } from '../../core/models/card.model';
import { finalize } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  boardId: number = 0;
  board: Board | null = null;
  lists: TaskList[] = [];
  cardsByList: { [listId: number]: Card[] } = {};

  loading        = false;
  showCardModal  = false;
  showListModal  = false;

  selectedListId = 0;
  newCardTitle   = '';
  newCardDesc    = '';
  newCardPriority = 'MEDIUM';

  newListName = '';

  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private boardService: BoardService,
    private listService: ListService,
    private cardService: CardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boardId = +params['id'];
      this.clearState();
      this.loadBoard();
      this.loadLists();
    });
  }

  clearState(): void {
    this.board = null;
    this.lists = [];
    this.cardsByList = {};
    this.errorMsg = '';
  }

  loadBoard(): void {
    this.boardService.getById(this.boardId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.board = res.data;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMsg = 'Failed to load board';
        this.cdr.detectChanges();
      }
    });

    // Load board members to determine role
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.boardService.getMembers(this.boardId).subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            const member = res.data.find((m: any) => m.userId === currentUser.userId);
            this.memberRole = member ? member.role : '';
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  loadLists(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.listService.getByBoard(this.boardId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            this.lists = res.data;
            this.cdr.detectChanges();
            this.lists.forEach(list => {
              this.loadCards(list.listId);
            });
          }
        },
        error: () => {
          this.errorMsg = 'Failed to load lists';
          this.cdr.detectChanges();
        }
      });
  }

  loadCards(listId: number): void {
    this.cardService.getByList(listId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.cardsByList[listId] = res.data;
          this.cdr.detectChanges();
        }
      }
    });
  }

  openCardModal(listId: number): void {
    this.selectedListId = listId;
    this.showCardModal = true;
    this.errorMsg = '';
  }

  closeCardModal(): void {
    this.showCardModal = false;
    this.newCardTitle = '';
    this.newCardDesc = '';
    this.newCardPriority = 'MEDIUM';
    this.selectedListId = 0;
  }

  createCard(): void {
    if (!this.newCardTitle.trim()) {
      this.errorMsg = 'Card title is required';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    this.cardService.create({
      title: this.newCardTitle,
      description: this.newCardDesc || undefined,
      listId: this.selectedListId,
      boardId: this.boardId,
      priority: this.newCardPriority
    })
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res: any) => {
        if (res.success) {
          if (!this.cardsByList[this.selectedListId]) {
            this.cardsByList[this.selectedListId] = [];
          }
          this.cardsByList[this.selectedListId].push(res.data);
          this.closeCardModal();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMsg = 'Failed to create card';
        this.cdr.detectChanges();
      }
    });
  }

  openListModal(): void {
    this.showListModal = true;
    this.errorMsg = '';
  }

  closeListModal(): void {
    this.showListModal = false;
    this.newListName = '';
  }

  createList(): void {
    if (!this.newListName.trim()) {
      this.errorMsg = 'List name is required';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    this.listService.create({
      name: this.newListName,
      boardId: this.boardId
    })
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.closeListModal();
          this.loadLists();
        }
      },
      error: () => {
        this.errorMsg = 'Failed to create list';
        this.cdr.detectChanges();
      }
    });
  }

  openCard(cardId: number): void {
    this.router.navigate(['/cards', cardId]);
  }

  deleteCard(cardId: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Delete this card?')) return;

    this.cardService.delete(cardId).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Remove from all lists
          for (const listId in this.cardsByList) {
            this.cardsByList[listId] = this.cardsByList[listId].filter(
              c => c.cardId !== cardId
            );
          }
        }
      }
    });
  }

  deleteList(listId: number): void {
    if (!confirm('Delete this list?')) return;

    this.listService.delete(listId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.lists = this.lists.filter(l => l.listId !== listId);
          delete this.cardsByList[listId];
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/workspaces']);
  }

  // Permission helpers
  memberRole: string = '';

  canManageBoard(): boolean {
    return this.memberRole === 'OWNER' || this.memberRole === 'ADMIN';
  }

  canCreateCard(): boolean {
    return true; // Or check roles
  }

  canCreateList(): boolean {
    return this.canManageBoard();
  }

  getCardsForList(listId: number): Card[] {
    return this.cardsByList[listId] || [];
  }

  canDeleteList(): boolean {
    return this.canCreateList();
  }

  canDeleteCard(card: any): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    // Creator or board owner/admin can delete
    return card.createdByUserId === user.userId || this.memberRole === 'OWNER' || this.memberRole === 'ADMIN';
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }
}