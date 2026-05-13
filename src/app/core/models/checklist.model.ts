export interface Checklist {
  checklistId: number;
  cardId: number;
  title: string;
  totalItems: number;
  completedItems: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  itemId: number;
  checklistId: number;
  text: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}