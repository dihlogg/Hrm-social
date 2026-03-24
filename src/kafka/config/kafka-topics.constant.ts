import 'dotenv/config'; // load .env

export const KAFKA_TOPICS = {
  REACTION_EVENTS: process.env.KAFKA_REACTION_EVENTS || 'reaction.events',
  REACTION_EVENTS_DLQ:
    process.env.KAFKA_REACTION_EVENTS_DLQ || 'reaction.events.dlq',
  USER_MENTIONED: process.env.KAFKA_USER_MENTIONED || 'user.mentioned',
  USER_MENTIONED_DLQ:
    process.env.KAFKA_USER_MENTIONED_DLQ || 'user.mentioned.dlq',
} as const;

export const KAFKA_DLQ_MAP: Record<string, string> = {
  [KAFKA_TOPICS.REACTION_EVENTS]: KAFKA_TOPICS.REACTION_EVENTS_DLQ,
  [KAFKA_TOPICS.USER_MENTIONED]: KAFKA_TOPICS.USER_MENTIONED_DLQ,
};
