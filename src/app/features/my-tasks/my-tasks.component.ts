import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardService } from '../../core/services/card.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit {
  tasks: any[] = [];
  loading = false;
  errorMsg = '';

  constructor(
    private cardService: CardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.cardService.getMyTasks().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tasks = res.data || [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Failed to load your tasks.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCard(cardId: number): void {
    this.router.navigate(['/cards', cardId]);
  }

  getPriorityClass(priority: string): string {
    return `priority-${(priority || 'medium').toLowerCase()}`;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'TO_DO': '⬜',
      'IN_PROGRESS': '🔄',
      'IN_REVIEW': '👁️',
      'DONE': '✅'
    };
    return icons[status] || '⬜';
  }
}
