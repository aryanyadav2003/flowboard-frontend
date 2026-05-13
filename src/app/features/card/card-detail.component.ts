import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService } from '../../core/services/card.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentService } from '../../core/services/comment.service';
import { LabelService } from '../../core/services/label.service';
import { ChecklistService } from '../../core/services/checklist.service';
import { Card } from '../../core/models/card.model';
import { Comment } from '../../core/models/comment.model';
import { CardLabel } from '../../core/models/label.model';
import { Checklist, ChecklistItem } from '../../core/models/checklist.model';
import { finalize } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.css']
})
export class CardDetailComponent implements OnInit {
  cardId: number = 0;
  card: Card | null = null;
  comments: Comment[] = [];
  labels: CardLabel[] = [];
  checklists: Checklist[] = [];

  loading = false;
  errorMsg = '';

  // Current user info
  currentUser: any = null;

  // Title Editing
  editingTitle = false;
  editTitleValue = '';

  // Description Editing
  editingDesc = false;
  editDescValue = '';

  // Comments
  newCommentText = '';

  // Checklists
  showAddChecklist = false;
  newChecklistTitle = '';
  newItemNames: { [checklistId: number]: string } = {};

  // Users & Assignment
  showUserSearch = false;
  userSearchQuery = '';
  foundUsers: any[] = [];

  // Labels management
  allBoardLabels: any[] = [];
  showLabelManager = false;
  newLabelName = '';
  newLabelColor = '#4f46e5';

  // Permissions
  isOwner = false;
  isAdmin = false;
  isCreator = false;

  get assignees() {
    return this.card?.assignees || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private authService: AuthService,
    private commentService: CommentService,
    private labelService: LabelService,
    private checklistService: ChecklistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.route.params.subscribe(params => {
      this.cardId = +params['id'];
      this.loadCardDetails();
    });
  }

  loadCardDetails(): void {
    this.loading = true;
    this.cardService.getById(this.cardId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            this.card = res.data;
            this.editTitleValue = res.data.title;
            this.editDescValue = res.data.description || '';
            this.checkPermissions();
            this.loadComments();
            this.loadLabels();
            this.loadAllBoardLabels();
            this.loadChecklists();
          } else {
            this.errorMsg = 'Card not found';
          }
        },
        error: () => this.errorMsg = 'Failed to load card'
      });
  }

  // ── INLINE EDITING ─────────────────────────────────

  saveTitle(): void {
    if (!this.editTitleValue.trim() || !this.card) return;
    this.cardService.update(this.cardId, {
      title: this.editTitleValue,
      description: this.card.description,
      status: this.card.status,
      priority: this.card.priority,
      dueDate: this.card.dueDate
    }).subscribe(res => {
      if (res.success) {
        this.card!.title = this.editTitleValue;
        this.editingTitle = false;
        this.cdr.detectChanges();
      }
    });
  }

  startEditDesc(): void {
    this.editDescValue = this.card?.description || '';
    this.editingDesc = true;
  }

  saveDesc(): void {
    if (!this.card) return;
    this.cardService.update(this.cardId, {
      title: this.card.title,
      description: this.editDescValue,
      status: this.card.status,
      priority: this.card.priority,
      dueDate: this.card.dueDate
    }).subscribe(res => {
      if (res.success) {
        this.card!.description = this.editDescValue;
        this.editingDesc = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── COMMENTS ───────────────────────────────────────

  loadComments(): void {
    this.commentService.getByCard(this.cardId).subscribe(res => {
      if (res.success) {
        this.comments = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  addComment(): void {
    if (!this.newCommentText.trim()) return;
    this.commentService.create({ cardId: this.cardId, content: this.newCommentText })
      .subscribe(res => {
        if (res.success) {
          this.comments.push(res.data);
          this.newCommentText = '';
          this.cdr.detectChanges();
        }
      });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Delete comment?')) return;
    this.commentService.delete(commentId).subscribe(res => {
      if (res.success) {
        this.comments = this.comments.filter(c => c.commentId !== commentId);
        this.cdr.detectChanges();
      }
    });
  }

  // ── CHECKLISTS ─────────────────────────────────────

  loadChecklists(): void {
    this.checklistService.getByCard(this.cardId).subscribe(res => {
      if (res.success) {
        this.checklists = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  addChecklist(): void {
    if (!this.newChecklistTitle.trim()) return;
    this.checklistService.create(this.cardId, this.newChecklistTitle).subscribe(res => {
      if (res.success) {
        this.checklists.push(res.data);
        this.newChecklistTitle = '';
        this.showAddChecklist = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteChecklist(checklistId: number): void {
    if (!confirm('Delete checklist?')) return;
    this.checklistService.delete(checklistId).subscribe(res => {
      if (res.success) {
        this.checklists = this.checklists.filter(c => c.checklistId !== checklistId);
        this.cdr.detectChanges();
      }
    });
  }

  addItem(checklistId: number): void {
    const name = this.newItemNames[checklistId];
    if (!name?.trim()) return;
    this.checklistService.addItem(checklistId, name).subscribe(res => {
      if (res.success) {
        const cl = this.checklists.find(c => c.checklistId === checklistId);
        if (cl) {
          cl.items.push(res.data);
          cl.totalItems++;
          this.newItemNames[checklistId] = '';
          this.cdr.detectChanges();
        }
      }
    });
  }

  toggleItem(item: ChecklistItem): void {
    this.checklistService.toggleItem(item.itemId).subscribe(res => {
      if (res.success) {
        item.isCompleted = res.data.isCompleted;
        this.cdr.detectChanges();
      }
    });
  }

  deleteItem(itemId: number): void {
    this.checklistService.deleteItem(itemId).subscribe(res => {
      if (res.success) {
        this.checklists.forEach(cl => {
          const idx = cl.items.findIndex((i: any) => i.itemId === itemId);
          if (idx !== -1) {
            cl.items.splice(idx, 1);
            cl.totalItems--;
          }
        });
        this.cdr.detectChanges();
      }
    });
  }

  getChecklistProgress(cl: Checklist): number {
    if (!cl.items || cl.items.length === 0) return 0;
    const completed = cl.items.filter((i: any) => i.isCompleted).length;
    return Math.round((completed / cl.items.length) * 100);
  }

  // ── ASSIGNEES ──────────────────────────────────────

  searchUsers(): void {
    if (!this.userSearchQuery.trim()) {
      this.foundUsers = [];
      return;
    }
    this.authService.searchUsers(this.userSearchQuery).subscribe(res => {
      if (res.success) {
        this.foundUsers = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  assignOtherUser(userId: number): void {
    this.cardService.assignUser(this.cardId, userId).subscribe(res => {
      if (res.success) {
        this.showUserSearch = false;
        this.userSearchQuery = '';
        this.loadCardDetails();
      }
    });
  }

  unassignUser(userId: number): void {
    this.cardService.unassignUser(this.cardId, userId).subscribe(res => {
      if (res.success) {
        this.loadCardDetails();
      }
    });
  }

  saveDueDate(newDate: string): void {
    if (!this.card) return;
    this.cardService.update(this.cardId, {
      title: this.card.title,
      description: this.card.description,
      status: this.card.status,
      priority: this.card.priority,
      dueDate: newDate || null
    }).subscribe(res => {
      if (res.success) {
        this.card!.dueDate = newDate;
        this.cdr.detectChanges();
      }
    });
  }

  // ── LABELS ─────────────────────────────────────────

  loadLabels(): void {
    this.labelService.getByCard(this.cardId).subscribe(res => {
      if (res.success) {
        this.labels = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllBoardLabels(): void {
    if (!this.card) return;
    this.labelService.getByBoard(this.card.boardId).subscribe(res => {
      if (res.success) {
        this.allBoardLabels = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  createLabel(): void {
    if (!this.newLabelName.trim() || !this.card) return;
    this.labelService.create(this.card.boardId, this.newLabelName, this.newLabelColor).subscribe(res => {
      if (res.success) {
        this.allBoardLabels.push(res.data);
        this.newLabelName = '';
        this.cdr.detectChanges();
      }
    });
  }

  toggleLabel(label: any): void {
    const isAssigned = this.labels.some(l => l.labelId === label.labelId);
    if (isAssigned) {
      this.labelService.removeFromCard(label.labelId, this.cardId).subscribe(res => {
        if (res.success) {
          this.labels = this.labels.filter(l => l.labelId !== label.labelId);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.labelService.assignToCard(label.labelId, this.cardId).subscribe(res => {
        if (res.success) {
          this.loadLabels();
        }
      });
    }
  }

  isLabelAssigned(labelId: number): boolean {
    return this.labels.some(l => l.labelId === labelId);
  }

  // ── MISC / PERMISSIONS ─────────────────────────────

  checkPermissions(): void {
    if (!this.currentUser || !this.card) return;
    this.isAdmin = this.currentUser.role === 'ADMIN' || this.currentUser.role === 'PlatformAdmin';
    this.isCreator = this.card.createdByUserId === this.currentUser.userId;
    this.isOwner = this.isCreator || this.isAdmin;
  }

  canEdit(): boolean { return this.isOwner || this.isAdmin || this.isCreator; }
  canDelete(): boolean { return this.isOwner || this.isAdmin; }
  canDeleteComment(c: any): boolean { return this.currentUser?.userId === c.userId || this.isAdmin; }

  goBack(): void {
    this.router.navigate(['/boards', this.card?.boardId]);
  }

  deleteCard(): void {
    if (!confirm('Are you sure you want to delete this card?')) return;
    this.cardService.delete(this.cardId).subscribe(res => {
      if (res.success) {
        this.goBack();
      }
    });
  }

  moveCard(): void {
    const listId = prompt('Enter target List ID:');
    if (!listId) return;

    this.cardService.move(this.cardId, {
      listId: parseInt(listId),
      newPosition: 0
    }).subscribe(res => {
      if (res.success) {
        alert('Card moved successfully');
        this.goBack();
      }
    });
  }

  archiveCard(): void {
    if (!confirm('Archive this card? It will be hidden from the board.')) return;
    this.cardService.archive(this.cardId).subscribe(res => {
      if (res.success) {
        this.goBack();
      }
    });
  }

  getPriorityClass(priority: string): string {
    return priority ? `priority-${priority.toLowerCase()}` : '';
  }
}