export interface Label {
  labelId: number;
  boardId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface CardLabel {
  cardLabelId: number;
  cardId: number;
  labelId: number;
  labelName: string;
  labelColor: string;
  assignedAt: string;
}