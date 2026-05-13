export interface Card {
  cardId: number;
  title: string;
  description?: string;
  listId: number;
  boardId: number;
  position: number;
  status: string;
  priority: string;
  createdByUserId: number;
  dueDate?: string;
  isArchived: boolean;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  assignees: CardAssignee[];
  labels: any[];
}

export interface CardAssignee {
  assigneeId: number;
  cardId: number;
  userId: number;
  assignedAt: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  listId: number;
  boardId: number;
  priority: string;
  dueDate?: string;
}

export interface MoveCardRequest {
  listId: number;
  newPosition: number;
}