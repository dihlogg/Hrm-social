export interface ReactionEvent {
  action: string;
  data?: ReactionEventData;
}

interface ReactionEventData {
  employeeId: string;
  employeeFullName?: string;
  reactionType: string;
  postId?: string;
  postCommentId?: string;
  createDate?: string;
}
