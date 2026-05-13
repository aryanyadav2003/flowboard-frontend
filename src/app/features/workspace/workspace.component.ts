import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { WorkspaceService } from '../../core/services/workspace.service';
import { BoardService } from '../../core/services/board.service';
import { Workspace } from '../../core/models/workspace.model';
import { Board } from '../../core/models/board.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {
  workspaces: Workspace[] = [];
  selectedWorkspace: Workspace | null = null;
  boards: Board[] = [];

  loadingWorkspaces = false;
  loadingBoards     = false;
  showCreateModal   = false;
  showBoardModal    = false;

  newWorkspaceName = '';
  newWorkspaceVis  = 'PRIVATE';

  newBoardName = '';
  newBoardVis  = 'PRIVATE';

  errorMsg = '';

  constructor(
    private workspaceService: WorkspaceService,
    private boardService: BoardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    console.log('loadWorkspaces: starting...');
    this.loadingWorkspaces = true;
    this.cdr.detectChanges();

    this.workspaceService.getMyWorkspaces()
      .pipe(finalize(() => {
        console.log('loadWorkspaces: finalize called');
        this.loadingWorkspaces = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          console.log('loadWorkspaces: response received', res);
          const success = res?.success || res?.Success;
          const data = res?.data || res?.Data;
          
          if (success && data) {
            this.workspaces = data;
            console.log('loadWorkspaces: workspaces set', this.workspaces);
            this.cdr.detectChanges();
            if (this.workspaces.length > 0 && !this.selectedWorkspace) {
              console.log('loadWorkspaces: auto-selecting first workspace');
              this.selectWorkspace(this.workspaces[0]);
            }
          }
        },
        error: (err) => {
          console.error('loadWorkspaces: error', err);
          this.errorMsg = 'Failed to load workspaces';
          this.cdr.detectChanges();
        }
      });
  }

  selectWorkspace(workspace: Workspace): void {
    this.selectedWorkspace = workspace;
    this.boards = []; // Clear boards to prevent stale data
    this.loadBoards(workspace.workspaceId);
  }

  loadBoards(workspaceId: number): void {
    console.log(`loadBoards: starting for workspace ${workspaceId}...`);
    this.loadingBoards = true;
    this.cdr.detectChanges();

    this.boardService.getByWorkspace(workspaceId)
      .pipe(finalize(() => {
        console.log('loadBoards: finalize called');
        this.loadingBoards = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          console.log('loadBoards: response received', res);
          const success = res?.success || res?.Success;
          const data = res?.data || res?.Data;
          if (success && data) {
            this.boards = data;
            console.log('loadBoards: boards set', this.boards);
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('loadBoards: error', err);
          this.errorMsg = 'Failed to load boards';
          this.cdr.detectChanges();
        }
      });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.selectedWorkspace = null; // Clear background
    this.boards = [];
    this.errorMsg = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newWorkspaceName = '';
    this.newWorkspaceVis = 'PRIVATE';
    this.loadWorkspaces(); // Refresh list
  }

  createWorkspace(): void {
    if (!this.newWorkspaceName.trim()) {
      this.errorMsg = 'Workspace name is required';
      this.cdr.detectChanges();
      return;
    }

    this.loadingWorkspaces = true;
    this.cdr.detectChanges();

    this.workspaceService.create({
      name: this.newWorkspaceName,
      visibility: this.newWorkspaceVis
    })
    .pipe(finalize(() => {
      this.loadingWorkspaces = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.closeCreateModal();
        }
      },
      error: () => {
        this.errorMsg = 'Failed to create workspace';
        this.cdr.detectChanges();
      }
    });
  }

  openBoardModal(): void {
    if (!this.selectedWorkspace) return;
    this.showBoardModal = true;
    this.errorMsg = '';
  }

  closeBoardModal(): void {
    this.showBoardModal = false;
    this.newBoardName = '';
    this.newBoardVis = 'PRIVATE';
  }

  createBoard(): void {
    if (!this.selectedWorkspace) return;
    if (!this.newBoardName.trim()) {
      this.errorMsg = 'Board name is required';
      this.cdr.detectChanges();
      return;
    }

    this.loadingBoards = true;
    this.cdr.detectChanges();

    this.boardService.create({
      name: this.newBoardName,
      visibility: this.newBoardVis,
      workspaceId: this.selectedWorkspace.workspaceId
    })
    .pipe(finalize(() => {
      this.loadingBoards = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res: any) => {
        const success = res?.success || res?.Success;
        const data = res?.data || res?.Data;
        if (success) {
          this.boards.push(data);
          this.closeBoardModal();
        }
      },
      error: () => {
        this.errorMsg = 'Failed to create board';
        this.cdr.detectChanges();
      }
    });
  }

  openBoard(board: Board): void {
    this.router.navigate(['/boards', board.boardId]);
  }

  deleteWorkspace(workspaceId: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace?')) return;

    this.workspaceService.delete(workspaceId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.workspaces = this.workspaces.filter(
            w => w.workspaceId !== workspaceId
          );
          if (this.selectedWorkspace?.workspaceId === workspaceId) {
            this.selectedWorkspace = null;
            this.boards = [];
            if (this.workspaces.length > 0) {
              this.selectWorkspace(this.workspaces[0]);
            }
          }
        }
      }
    });
  }

  deleteBoard(boardId: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this board?')) return;

    this.boardService.delete(boardId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.boards = this.boards.filter(b => b.boardId !== boardId);
        }
      }
    });
  }
}
