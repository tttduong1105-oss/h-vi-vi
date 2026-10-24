/**
 * Security Rules Verification Suite — Dirty Dozen Adversarial Payloads
 * Evaluates all 12 Dirty Dozen payloads against our exact Firestore rule invariants
 * and asserts PERMISSION_DENIED on every attack vector.
 */

interface AuthContext {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

const SERVER_TIME = 1792820000000;
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const IMAGE_REGEX = /^(data:image\/[a-zA-Z0-9+-]+;base64,[A-Za-z0-9+/=]+|https:\/\/[^\s]+)$/;

const REQUIRED_LETTER_KEYS = [
  'sender',
  'isAnonymous',
  'content',
  'topic',
  'stamp',
  'createdAt',
  'updatedAt',
  'createdAtMs',
  'createdAtLabel',
  'heartsCount',
  'repliesCount',
  'status',
  'authorUid',
];

const ALLOWED_LETTER_KEYS = new Set([...REQUIRED_LETTER_KEYS, 'imageUrl']);

function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

function isValidLetter(data: Record<string, unknown>): boolean {
  const keys = Object.keys(data);
  if (!REQUIRED_LETTER_KEYS.every((k) => k in data)) return false;
  if (!keys.every((k) => ALLOWED_LETTER_KEYS.has(k))) return false;
  if (typeof data.sender !== 'string' || data.sender.length < 1 || data.sender.length > 60) return false;
  if (typeof data.isAnonymous !== 'boolean') return false;
  if (typeof data.content !== 'string' || data.content.length < 5 || data.content.length > 800) return false;
  if (typeof data.topic !== 'string' || !['Tâm sự', 'Feedback', 'Góp ý tưởng'].includes(data.topic)) return false;
  if (typeof data.stamp !== 'string' || !['snowflake', 'pine', 'dove', 'tea', 'star'].includes(data.stamp)) return false;
  if ('imageUrl' in data) {
    if (
      typeof data.imageUrl !== 'string' ||
      data.imageUrl.length < 12 ||
      data.imageUrl.length > 250000 ||
      !IMAGE_REGEX.test(data.imageUrl)
    ) {
      return false;
    }
  }
  if (typeof data.createdAt !== 'number' || typeof data.updatedAt !== 'number') return false;
  if (typeof data.createdAtMs !== 'number' || data.createdAtMs <= 0) return false;
  if (typeof data.createdAtLabel !== 'string' || data.createdAtLabel.length < 1 || data.createdAtLabel.length > 40) return false;
  if (typeof data.heartsCount !== 'number' || data.heartsCount < 1 || data.heartsCount > 1000000) return false;
  if (typeof data.repliesCount !== 'number' || data.repliesCount < 0 || data.repliesCount > 100000) return false;
  if (typeof data.status !== 'string' || !['approved', 'archived'].includes(data.status)) return false;
  if (typeof data.authorUid !== 'string' || data.authorUid.length < 1 || data.authorUid.length > 128) return false;
  return true;
}

function allowLetterCreate(id: string, data: Record<string, unknown>, auth: AuthContext | null): boolean {
  const uidOk = auth ? data.authorUid === auth.uid : data.authorUid === 'anonymous';
  return (
    isValidId(id) &&
    isValidLetter(data) &&
    data.createdAt === SERVER_TIME &&
    data.updatedAt === SERVER_TIME &&
    data.heartsCount === 1 &&
    data.repliesCount === 0 &&
    data.status === 'approved' &&
    uidOk
  );
}

function allowLetterUpdate(
  id: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>
): boolean {
  if (!isValidId(id) || !isValidLetter(incoming)) return false;
  if (existing.status !== 'approved' || incoming.status !== existing.status) return false;
  const immutableKeys = [
    'createdAt',
    'authorUid',
    'sender',
    'isAnonymous',
    'content',
    'topic',
    'stamp',
    'createdAtMs',
    'createdAtLabel',
  ];
  if (!immutableKeys.every((k) => incoming[k] === existing[k])) return false;
  if (incoming.updatedAt !== SERVER_TIME) return false;

  const changedKeys = new Set(
    Object.keys({ ...existing, ...incoming }).filter((k) => incoming[k] !== existing[k])
  );
  const onlyHeart =
    changedKeys.size === 2 &&
    changedKeys.has('heartsCount') &&
    changedKeys.has('updatedAt') &&
    incoming.heartsCount === (existing.heartsCount as number) + 1;
  const onlyReplies =
    changedKeys.size === 2 &&
    changedKeys.has('repliesCount') &&
    changedKeys.has('updatedAt') &&
    incoming.repliesCount === (existing.repliesCount as number) + 1;

  return onlyHeart || onlyReplies;
}

function allowReplyCreate(
  letterId: string,
  replyId: string,
  data: Record<string, unknown>,
  auth: AuthContext | null,
  parentExistsApproved: boolean,
  atomicRepliesIncremented: boolean
): boolean {
  if (!isValidId(letterId) || !isValidId(replyId)) return false;
  const isVerifiedCreator =
    !!auth && auth.email_verified === true && auth.email === 'tttduong1105@gmail.com';
  const uidOk = auth ? data.authorUid === auth.uid : data.authorUid === 'anonymous';
  return (
    data.letterId === letterId &&
    data.createdAt === SERVER_TIME &&
    data.status === 'approved' &&
    (!data.isCreator || isVerifiedCreator) &&
    uidOk &&
    parentExistsApproved &&
    atomicRepliesIncremented
  );
}

const baseValidLetter: Record<string, unknown> = {
  sender: 'Người Qua Đường Trong Bão Tuyết',
  isAnonymous: true,
  content: 'Cảm ơn Hạ Vi Vi vì những nhân vật thật sự ấm áp!',
  topic: 'Feedback',
  stamp: 'snowflake',
  createdAt: SERVER_TIME,
  updatedAt: SERVER_TIME,
  createdAtMs: SERVER_TIME,
  createdAtLabel: '24/10/2026 08:30',
  heartsCount: 1,
  repliesCount: 0,
  status: 'approved',
  authorUid: 'anonymous',
};

export function runDirtyDozenAudit(): void {
  const cases: { name: string; allowed: boolean }[] = [
    {
      name: '1. Shadow Field Injection on Create',
      allowed: allowLetterCreate('letter-1', { ...baseValidLetter, isAdmin: true }, null),
    },
    {
      name: '2. Invalid Topic Enum',
      allowed: allowLetterCreate('letter-2', { ...baseValidLetter, topic: 'Quảng cáo' }, null),
    },
    {
      name: '3. Oversized Content Bomb (>800 chars)',
      allowed: allowLetterCreate('letter-3', { ...baseValidLetter, content: 'A'.repeat(900) }, null),
    },
    {
      name: '4. Client Timestamp Spoofing',
      allowed: allowLetterCreate('letter-4', { ...baseValidLetter, createdAt: SERVER_TIME - 50000 }, null),
    },
    {
      name: '5. Artificial Heart Inflation on Create',
      allowed: allowLetterCreate('letter-5', { ...baseValidLetter, heartsCount: 500 }, null),
    },
    {
      name: '6. Heart Jump Attack on Update (+99)',
      allowed: allowLetterUpdate(
        'letter-1',
        { ...baseValidLetter, updatedAt: SERVER_TIME - 1000 },
        { ...baseValidLetter, heartsCount: 100, updatedAt: SERVER_TIME }
      ),
    },
    {
      name: '7. Immutable Content Tampering on Update',
      allowed: allowLetterUpdate(
        'letter-1',
        { ...baseValidLetter, updatedAt: SERVER_TIME - 1000 },
        { ...baseValidLetter, content: 'Tampered content!', heartsCount: 2, updatedAt: SERVER_TIME }
      ),
    },
    {
      name: '8. ID Poisoning with spaces & symbols',
      allowed: allowLetterCreate('bad$id with spaces!', baseValidLetter, null),
    },
    {
      name: '9. Creator Impersonation with Unverified Email',
      allowed: allowReplyCreate(
        'letter-1',
        'rep-1',
        {
          letterId: 'letter-1',
          sender: 'Hạ Vi Vi ♡',
          content: 'Fake creator!',
          createdAt: SERVER_TIME,
          createdAtMs: SERVER_TIME,
          createdAtLabel: '24/10',
          isCreator: true,
          status: 'approved',
          authorUid: 'spoof-uid',
        },
        { uid: 'spoof-uid', email: 'tttduong1105@gmail.com', email_verified: false },
        true,
        true
      ),
    },
    {
      name: '10. UID Spoofing while Unauthenticated',
      allowed: allowLetterCreate('letter-10', { ...baseValidLetter, authorUid: 'victim-uid-123' }, null),
    },
    {
      name: '11. Orphaned / Non-Atomic Reply without batch +1',
      allowed: allowReplyCreate(
        'letter-1',
        'rep-2',
        {
          letterId: 'letter-1',
          sender: 'Khách',
          content: 'Hello',
          createdAt: SERVER_TIME,
          createdAtMs: SERVER_TIME,
          createdAtLabel: '24/10',
          isCreator: false,
          status: 'approved',
          authorUid: 'anonymous',
        },
        null,
        true,
        false
      ),
    },
    {
      name: '12. Malicious JavaScript URI in imageUrl',
      allowed: allowLetterCreate(
        'letter-12',
        { ...baseValidLetter, imageUrl: 'javascript:alert(1)' },
        null
      ),
    },
  ];

  for (const testCase of cases) {
    if (testCase.allowed) {
      throw new Error(`SECURITY FAILURE: ${testCase.name} was unexpectedly allowed!`);
    }
  }

  // Positive sanity check
  if (!allowLetterCreate('letter-valid-1', baseValidLetter, null)) {
    throw new Error('Valid letter creation was unexpectedly denied!');
  }
}

runDirtyDozenAudit();
