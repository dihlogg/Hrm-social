export type TargetType = 'POST' | 'COMMENT';

export interface NormalizedAction {
  employeeId: string;
  employeeFullName?: string;
  reactionType: string;
  targetType: TargetType;
  targetId: string;
}

export interface ReactionUpdate {
  id: string;
  reactionType: string;
}