import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
   Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Confession, ConfessionCategory, ConfessionReply, StampType } from '../types';

const LIKED_LETTERS_KEY = 'thu_gui_mua_tuyet_liked_letters_v1';
const LAST_LETTER_SUBMIT_KEY = 'thu_gui_mua_tuyet_last_letter_submit_v1';
const FORBIDDEN_WORDS = ['spam', 'quảng cáo', 'lừa đảo', 'hack', 'casino', 'cờ bạc'];

const ALLOWED_TOPICS: ConfessionCategory[] = ['Tâm sự', 'Feedback', 'Góp ý tưởng'];
const ALLOWED_STAMPS: StampType[] = ['snowflake', 'pine', 'dove', 'tea', 'star'];

function getLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_LETTERS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLikedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(LIKED_LETTERS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignored
  }
}

function formatViTimestamp(date: Date): string {
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatReplyTimestamp(date: Date): string {
  return date.toLocaleString('vi-VN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

export function subscribeToLetters(
  onUpdate: (letters: Confession[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'letters';
  const q = query(collection(db, path), where('status', '==', 'approved'));

  return onSnapshot(
    q,
    (snapshot) => {
      const likedIds = getLikedIds();
      const items: Confession[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const topic: ConfessionCategory = ALLOWED_TOPICS.includes(d.topic)
          ? d.topic
          : 'Tâm sự';
        const stamp: StampType = ALLOWED_STAMPS.includes(d.stamp)
          ? d.stamp
          : 'snowflake';

        return {
          id: docSnap.id,
          sender: String(d.sender || 'Người Qua Đường Trong Bão Tuyết'),
          isAnonymous: Boolean(d.isAnonymous),
          content: String(d.content || ''),
          topic,
          stamp,
          imageUrl: typeof d.imageUrl === 'string' && d.imageUrl ? d.imageUrl : undefined,
          createdAt: String(d.createdAtLabel || ''),
          createdAtMs: Number(d.createdAtMs) || 0,
          heartsCount: Number(d.heartsCount) || 1,
          repliesCount: Number(d.repliesCount) || 0,
          userLiked: likedIds.has(docSnap.id),
          status: 'approved',
          replies: [],
        };
      });

      items.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

export function subscribeToLetterReplies(
  letterId: string,
  onUpdate: (replies: ConfessionReply[]) => void
): Unsubscribe {
  const path = `letters/${letterId}/replies`;
  const q = query(
    collection(db, 'letters', letterId, 'replies'),
    where('status', '==', 'approved')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ConfessionReply[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          letterId,
          sender: String(d.sender || 'Lữ khách ghé qua'),
          content: String(d.content || ''),
          createdAt: String(d.createdAtLabel || ''),
          createdAtMs: Number(d.createdAtMs) || 0,
          isCreator: Boolean(d.isCreator),
        };
      });
      items.sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0));
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

export async function submitLetterToFirebase(input: {
  sender: string;
  isAnonymous: boolean;
  content: string;
  topic: ConfessionCategory;
  stamp: StampType;
  imageUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const now = Date.now();
  const lastSubmit = Number(localStorage.getItem(LAST_LETTER_SUBMIT_KEY) || '0');
  if (now - lastSubmit < 8000) {
    const waitSec = Math.ceil((8000 - (now - lastSubmit)) / 1000);
    return {
      success: false,
      error: `Bạn đang gửi thư hơi nhanh. Vui lòng chờ ${waitSec} giây trước khi gửi tiếp nhé!`,
    };
  }

  const trimmedContent = input.content.trim();
  if (trimmedContent.length < 5) {
    return {
      success: false,
      error: 'Nội dung bức thư cần tối thiểu 5 ký tự.',
    };
  }
  if (trimmedContent.length > 800) {
    return {
      success: false,
      error: 'Nội dung tối đa 800 ký tự.',
    };
  }

  const lower = trimmedContent.toLowerCase();
  if (FORBIDDEN_WORDS.some((w) => lower.includes(w))) {
    return {
      success: false,
      error: 'Nội dung chứa từ ngữ không phù hợp với hòm thư.',
    };
  }

  const safeTopic: ConfessionCategory = ALLOWED_TOPICS.includes(input.topic)
    ? input.topic
    : 'Tâm sự';
  const safeStamp: StampType = ALLOWED_STAMPS.includes(input.stamp)
    ? input.stamp
    : 'snowflake';

  const rawSender = input.isAnonymous
    ? 'Người Qua Đường Trong Bão Tuyết'
    : (input.sender.trim() || 'Lữ khách mùa đông').slice(0, 60);

  const letterId = generateSafeId('letter');
  const createdAtLabel = formatViTimestamp(new Date(now)).slice(0, 40);
  const authorUid = auth.currentUser?.uid || 'anonymous';

  const docPayload: Record<string, unknown> = {
    sender: rawSender,
    isAnonymous: Boolean(input.isAnonymous),
    content: trimmedContent,
    topic: safeTopic,
    stamp: safeStamp,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtMs: now,
    createdAtLabel,
    heartsCount: 1,
    repliesCount: 0,
    status: 'approved',
    authorUid,
  };

  if (input.imageUrl && input.imageUrl.length >= 12 && input.imageUrl.length <= 250000) {
    docPayload.imageUrl = input.imageUrl;
  }

  const path = `letters/${letterId}`;
  try {
    await setDoc(doc(db, 'letters', letterId), docPayload);
    localStorage.setItem(LAST_LETTER_SUBMIT_KEY, String(now));
    return { success: true };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch {
      // Logged structured error
    }
    return {
      success: false,
      error: 'Không thể lưu thư lên Firebase lúc này. Vui lòng thử lại nhé.',
    };
  }
}

export async function heartLetterInFirebase(letterId: string): Promise<void> {
  const likedIds = getLikedIds();
  if (likedIds.has(letterId)) {
    return;
  }

  likedIds.add(letterId);
  saveLikedIds(likedIds);

  const path = `letters/${letterId}`;
  try {
    await updateDoc(doc(db, 'letters', letterId), {
      heartsCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    likedIds.delete(letterId);
    saveLikedIds(likedIds);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitReplyToFirebase(
  letterId: string,
  replyText: string,
  senderAlias?: string
): Promise<void> {
  const trimmed = replyText.trim().slice(0, 500);
  if (!trimmed) return;

  const now = Date.now();
  const replyId = generateSafeId('rep');
  const currentUser = auth.currentUser;
  const isVerifiedCreator =
    Boolean(currentUser) &&
    currentUser?.emailVerified === true &&
    currentUser?.email === 'tttduong1105@gmail.com';

  const sender = isVerifiedCreator
    ? 'Hạ Vi Vi ♡'
    : (senderAlias?.trim() || 'Lữ khách ghé qua').slice(0, 60);

  const createdAtLabel = formatReplyTimestamp(new Date(now)).slice(0, 40);
  const authorUid = currentUser?.uid || 'anonymous';

  const letterRef = doc(db, 'letters', letterId);
  const replyRef = doc(db, 'letters', letterId, 'replies', replyId);

  const batch = writeBatch(db);
  batch.set(replyRef, {
    letterId,
    sender,
    content: trimmed,
    createdAt: serverTimestamp(),
    createdAtMs: now,
    createdAtLabel,
    isCreator: isVerifiedCreator,
    status: 'approved',
    authorUid,
  });
  batch.update(letterRef, {
    repliesCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `letters/${letterId}/replies/${replyId}`);
  }
}
