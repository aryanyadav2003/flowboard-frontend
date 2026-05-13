export interface Workspace {
  workspaceId: number;
  name: string;
  description?: string;
  logoUrl?: string;
  visibility: string;
  ownerId: number;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  visibility: string;
}