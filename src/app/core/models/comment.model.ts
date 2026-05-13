export interface Comment {
  commentId: number;
  cardId: number;
  userId: number;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  cardId: number;
  content: string;
}