export interface Board {
  boardId: number;
  name: string;
  description?: string;
  coverImageUrl?: string;
  visibility: string;
  workspaceId: number;
  ownerId: number;
  isArchived: boolean;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  visibility: string;
  workspaceId: number;
}