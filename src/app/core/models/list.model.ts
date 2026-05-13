export interface TaskList {
  listId: number;
  name: string;
  boardId: number;
  position: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListRequest {
  name: string;
  boardId: number;
}