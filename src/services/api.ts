import { Character, Confession, CreatorProfile, ConfessionReply } from '../types';
import { INITIAL_CHARACTERS, INITIAL_CONFESSIONS, INITIAL_PROFILE } from '../data/initialData';

const CONFESSIONS_KEY = 'thu_gui_mua_tuyet_confessions_v5';
const CHARACTERS_KEY = 'thu_gui_mua_tuyet_characters_v13';
const CHAR_VIEWS_KEY = 'thu_gui_mua_tuyet_char_views_v1';
const PROFILE_KEY = 'thu_gui_mua_tuyet_profile_v6';
const LAST_SUBMIT_KEY = 'thu_gui_mua_tuyet_last_submit';
const LEGACY_SAMPLE_IDS = new Set(['char-1', 'char-2', 'char-3', 'char-4']);
const LEGACY_BIOS = new Set([
  'Một góc nhỏ của Hạ Vi Vi, nơi những nhân vật, câu chuyện và lời tâm sự được lưu giữ.',
]);
const LEGACY_AVATARS = new Set([
  '/src/assets/images/creator_avatar_vivian_1792465365305.jpg',
  'https://ibb.co/F4BZVNjc',
]);
const LEGACY_COVERS = new Set([
  '/src/assets/images/winter_hero_landscape_1792465338779.jpg',
  '/winter-cover.jpg',
]);

const FORBIDDEN_WORDS = ['spam', 'quảng cáo', 'lừa đảo', 'hack', 'casino', 'cờ bạc'];

/** Converts only Mathematical Alphanumeric Unicode (U+1D400..U+1D7FF) into clean UTF-8 while keeping kaomoji intact */
function cleanVietnameseText(value: unknown): string {
  return String(value ?? '').replace(/\uD835[\uDC00-\uDFFF]/g, (ch) =>
    ch.normalize('NFKC')
  );
}

function sanitizeProfile(raw: any): CreatorProfile {
  const isLegacyBio = !raw?.bio || LEGACY_BIOS.has(String(raw.bio).trim());
  const rawAvatar = String(raw?.avatarUrl ?? '').trim();
  const rawCover = String(raw?.coverUrl ?? '').trim();

  return {
    name:
      raw?.name && !String(raw.name).toLowerCase().includes('miraly')
        ? cleanVietnameseText(raw.name)
        : INITIAL_PROFILE.name,
    tagline:
      raw?.tagline && !isLegacyBio
        ? cleanVietnameseText(raw.tagline)
        : INITIAL_PROFILE.tagline,
    bio:
      !isLegacyBio && !String(raw.bio).toLowerCase().includes('miraly')
        ? cleanVietnameseText(raw.bio)
        : INITIAL_PROFILE.bio,
    avatarUrl:
      rawAvatar && !LEGACY_AVATARS.has(rawAvatar)
        ? rawAvatar
        : INITIAL_PROFILE.avatarUrl,
    coverUrl:
      rawCover && !LEGACY_COVERS.has(rawCover)
        ? rawCover
        : INITIAL_PROFILE.coverUrl,
    facebookUrl: raw?.facebookUrl || INITIAL_PROFILE.facebookUrl,
    discordUrl: raw?.discordUrl || INITIAL_PROFILE.discordUrl,
  };
}

function normalizeCharacter(raw: any): Character {
  return {
    id: String(raw?.id || `char-${Date.now()}`),
    name: cleanVietnameseText(raw?.name || ''),
    slogan: cleanVietnameseText(raw?.slogan || ''),
    tags:
      Array.isArray(raw?.tags) && raw.tags.length > 0
        ? raw.tags.map((t: unknown) => cleanVietnameseText(t))
        : ['Nguyên bản (OC)'],
    backstory: cleanVietnameseText(raw?.backstory || raw?.fullBio || ''),
    firstMess: cleanVietnameseText(raw?.firstMess || ''),
    ggaiLink: String(raw?.ggaiLink ?? raw?.storyLink ?? ''),
    ggaiLinks: Array.isArray(raw?.ggaiLinks)
      ? raw.ggaiLinks
          .filter((item: any) => item && item.url)
          .map((item: any) => ({
            label: cleanVietnameseText(item.label || 'Mở Link GGAI'),
            url: String(item.url),
          }))
      : undefined,
    views: Number(raw?.views) || 0,
  };
}

export class ApiService {
  // --- Profile methods ---
  static async getProfile(): Promise<CreatorProfile> {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        return sanitizeProfile(data);
      }
    } catch {
      // Fallback to local storage
    }
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? sanitizeProfile(JSON.parse(stored)) : INITIAL_PROFILE;
  }

  static async updateProfile(profile: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const current = await this.getProfile();
    const updated = sanitizeProfile({ ...current, ...profile });
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // ignored
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  }

  // --- Character & View Counter methods ---
  static async getCharacterViewsMap(): Promise<Record<string, number>> {
    let localViews: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(CHAR_VIEWS_KEY);
      if (raw) localViews = JSON.parse(raw);
    } catch {
      // ignored
    }

    try {
      const res = await fetch('/api/character-views');
      if (res.ok) {
        const serverViews = await res.json();
        if (serverViews && typeof serverViews === 'object') {
          const merged: Record<string, number> = { ...localViews };
          for (const [k, v] of Object.entries(serverViews)) {
            merged[k] = Math.max(Number(merged[k]) || 0, Number(v) || 0);
          }
          localStorage.setItem(CHAR_VIEWS_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {
      // Fallback to localViews
    }
    return localViews;
  }

  static async incrementCharacterView(id: string): Promise<number> {
    let localViews: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(CHAR_VIEWS_KEY);
      if (raw) localViews = JSON.parse(raw);
    } catch {
      // ignored
    }

    let nextCount = (Number(localViews[id]) || 0) + 1;
    localViews[id] = nextCount;
    localStorage.setItem(CHAR_VIEWS_KEY, JSON.stringify(localViews));

    try {
      const res = await fetch(`/api/characters/${encodeURIComponent(id)}/view`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.views === 'number') {
          nextCount = Math.max(nextCount, data.views);
          localViews[id] = nextCount;
          localStorage.setItem(CHAR_VIEWS_KEY, JSON.stringify(localViews));
        }
      }
    } catch {
      // Fallback to local count
    }

    return nextCount;
  }

  static async getCharacters(): Promise<Character[]> {
    const viewsMap = await this.getCharacterViewsMap();

    const mergeWithInitial = (items: Character[]): Character[] => {
      const byId = new Map<string, Character>();
      items.forEach((c) => byId.set(c.id, c));
      INITIAL_CHARACTERS.forEach((initChar) => byId.set(initChar.id, initChar));

      const initialIds = new Set(INITIAL_CHARACTERS.map((c) => c.id));
      const customChars = items.filter((c) => !initialIds.has(c.id));
      return [...INITIAL_CHARACTERS.map((c) => byId.get(c.id)!), ...customChars].map((c) => ({
        ...c,
        views: Math.max(Number(viewsMap[c.id]) || 0, Number(c.views) || 0),
      }));
    };

    try {
      const res = await fetch('/api/characters');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const cleaned = data
            .filter((item) => !LEGACY_SAMPLE_IDS.has(String(item?.id)))
            .map(normalizeCharacter);
          if (cleaned.length > 0) {
            return mergeWithInitial(cleaned);
          }
        }
      }
    } catch {
      // Fallback
    }
    const stored = localStorage.getItem(CHARACTERS_KEY);
    if (!stored) {
      const initialWithViews = mergeWithInitial(INITIAL_CHARACTERS);
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(initialWithViews));
      return initialWithViews;
    }
    const parsed = JSON.parse(stored)
      .filter((item: any) => !LEGACY_SAMPLE_IDS.has(String(item?.id)))
      .map(normalizeCharacter);
    const merged = mergeWithInitial(parsed);
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(merged));
    return merged;
  }

  static async addCharacter(char: Omit<Character, 'id' | 'views'>): Promise<Character> {
    const newChar: Character = normalizeCharacter({
      ...char,
      id: `char-${Date.now()}`,
      views: 0,
    });

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChar),
      });
      if (res.ok) {
        const saved = normalizeCharacter(await res.json());
        const current = await this.getCharacters();
        const merged = [saved, ...current.filter((c) => c.id !== saved.id)];
        localStorage.setItem(CHARACTERS_KEY, JSON.stringify(merged));
        return saved;
      }
    } catch {
      // ignored
    }

    const current = await this.getCharacters();
    const updated = [newChar, ...current];
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(updated));
    return newChar;
  }

  static async updateCharacter(id: string, updates: Omit<Character, 'id' | 'views'>): Promise<Character> {
    const updatedChar: Character = normalizeCharacter({ ...updates, id });

    try {
      await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedChar),
      });
    } catch {
      // ignored
    }

    const current = await this.getCharacters();
    const updatedList = current.map((c) => (c.id === id ? updatedChar : c));
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(updatedList));
    return updatedChar;
  }

  static async deleteCharacter(id: string): Promise<void> {
    try {
      await fetch(`/api/characters/${id}`, { method: 'DELETE' });
    } catch {
      // ignored
    }

    const current = await this.getCharacters();
    const filtered = current.filter((c) => c.id !== id);
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(filtered));
  }

  // --- Confession methods ---
  static async getConfessions(): Promise<Confession[]> {
    try {
      const res = await fetch('/api/confessions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    const stored = localStorage.getItem(CONFESSIONS_KEY);
    if (!stored) {
      localStorage.setItem(CONFESSIONS_KEY, JSON.stringify(INITIAL_CONFESSIONS));
      return INITIAL_CONFESSIONS;
    }
    return JSON.parse(stored);
  }

  static async submitConfession(data: {
    sender: string;
    isAnonymous: boolean;
    content: string;
    topic: Confession['topic'];
    stamp: Confession['stamp'];
  }): Promise<{ success: boolean; confession?: Confession; error?: string }> {
    const lastSubmit = Number(localStorage.getItem(LAST_SUBMIT_KEY) || '0');
    const now = Date.now();
    if (now - lastSubmit < 10000) {
      const waitSeconds = Math.ceil((10000 - (now - lastSubmit)) / 1000);
      return {
        success: false,
        error: `Bạn đang gửi thư quá nhanh. Xin vui lòng chờ ${waitSeconds} giây để ngắm tuyết rơi trước khi gửi tiếp nhé!`,
      };
    }

    const trimmedContent = data.content.trim();
    if (trimmedContent.length < 10) {
      return {
        success: false,
        error: 'Lời tâm sự phải có độ dài tối thiểu 10 ký tự để trọn vẹn ý nghĩa.',
      };
    }

    if (trimmedContent.length > 800) {
      return {
        success: false,
        error: 'Bức thư tối đa 800 ký tự để vừa vặn trong phong bì mùa đông.',
      };
    }

    const lowerContent = trimmedContent.toLowerCase();
    const hasForbidden = FORBIDDEN_WORDS.some((word) => lowerContent.includes(word));
    if (hasForbidden) {
      return {
        success: false,
        error: 'Nội dung chứa từ ngữ không phù hợp với không gian tuyết trắng.',
      };
    }

    const finalSender = data.isAnonymous
      ? 'Người Qua Đường Trong Bão Tuyết'
      : data.sender.trim() || 'Lữ khách mùa đông';

    const newConfession: Confession = {
      id: `conf-${Date.now()}`,
      sender: finalSender,
      isAnonymous: data.isAnonymous,
      content: trimmedContent,
      topic: data.topic,
      stamp: data.stamp,
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      heartsCount: 1,
      status: 'approved',
      replies: [],
    };

    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfession),
      });
      if (res.ok) {
        const result = await res.json();
        localStorage.setItem(LAST_SUBMIT_KEY, String(now));
        return { success: true, confession: result };
      }
    } catch {
      // Fallback to local
    }

    const current = await this.getConfessions();
    const updated = [newConfession, ...current];
    localStorage.setItem(CONFESSIONS_KEY, JSON.stringify(updated));
    localStorage.setItem(LAST_SUBMIT_KEY, String(now));

    return { success: true, confession: newConfession };
  }

  static async toggleHeart(id: string): Promise<number> {
    const confessions = await this.getConfessions();
    let newCount = 0;
    const updated = confessions.map((c) => {
      if (c.id === id) {
        const isLiked = c.userLiked;
        const count = isLiked ? Math.max(0, c.heartsCount - 1) : c.heartsCount + 1;
        newCount = count;
        return {
          ...c,
          heartsCount: count,
          userLiked: !isLiked,
        };
      }
      return c;
    });

    localStorage.setItem(CONFESSIONS_KEY, JSON.stringify(updated));

    try {
      await fetch(`/api/confessions/${id}/like`, { method: 'POST' });
    } catch {
      // ignored
    }

    return newCount;
  }

  static async addReply(confessionId: string, replyText: string, isCreator = false): Promise<ConfessionReply | null> {
    const trimmed = replyText.trim();
    if (!trimmed) return null;

    const reply: ConfessionReply = {
      id: `rep-${Date.now()}`,
      sender: isCreator ? 'Hạ Vi Vi ♡' : 'Lữ khách ghé qua',
      content: trimmed,
      createdAt: new Date().toLocaleString('vi-VN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isCreator,
    };

    const confessions = await this.getConfessions();
    const updated = confessions.map((c) => {
      if (c.id === confessionId) {
        return {
          ...c,
          replies: [...(c.replies || []), reply],
        };
      }
      return c;
    });

    localStorage.setItem(CONFESSIONS_KEY, JSON.stringify(updated));

    try {
      await fetch(`/api/confessions/${confessionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reply),
      });
    } catch {
      // ignored
    }

    return reply;
  }
}
