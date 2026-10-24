export interface CharacterLink {
  label: string;
  url: string;
}

export interface Character {
  id: string;
  name: string;
  slogan: string;
  tags: string[];
  backstory: string;
  firstMess: string;
  ggaiLink: string;
  ggaiLinks?: CharacterLink[];
  views: number;
}

export interface ConfessionReply {
  id: string;
  letterId?: string;
  sender: string;
  content: string;
  createdAt: string;
  createdAtMs?: number;
  isCreator?: boolean;
}

export type ConfessionCategory = 'Tâm sự' | 'Feedback' | 'Góp ý tưởng';

export type ConfessionTopic = 'Tất cả' | ConfessionCategory;

export type StampType = 'snowflake' | 'pine' | 'dove' | 'tea' | 'star';

export interface Confession {
  id: string;
  sender: string;
  isAnonymous: boolean;
  content: string;
  topic: ConfessionCategory;
  stamp: StampType;
  imageUrl?: string;
  createdAt: string;
  createdAtMs?: number;
  heartsCount: number;
  repliesCount?: number;
  userLiked?: boolean;
  status: 'approved' | 'archived';
  replies: ConfessionReply[];
}

export interface CreatorProfile {
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  facebookUrl: string;
  discordUrl: string;
}
