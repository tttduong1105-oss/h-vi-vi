# Security Specification — Thư Gửi Mùa Tuyết (Hòm Thư Firebase)

## 1. Data Invariants
1. **Default Deny**: All paths outside `/letters/{letterId}` and `/letters/{letterId}/replies/{replyId}` are unconditionally denied (`allow read, write: if false`).
2. **ID Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates path IDs against `^[a-zA-Z0-9_\-]+$` with length `1..128`.
3. **Query Enforcement (No Blanket Reads)**: `get` and `list` on `/letters` and `/letters/{letterId}/replies` strictly enforce `resource.data.status == 'approved'` without `get()`/`exists()` inside `list` blocks.
4. **Strict Key & Size Blueprint**: `isValidLetter` and `isValidReply` enforce `hasAll` + `hasOnly` allowed keys, type checks, enum bounds (`topic in ['Tâm sự', 'Feedback', 'Góp ý tưởng']`, `stamp in ['snowflake', 'pine', 'dove', 'tea', 'star']`), and `.size()` caps on every string field (including optional compressed `imageUrl <= 250000`).
5. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` (server timestamp).
6. **Identity & Creator Badge Protection**: `authorUid` must match `request.auth.uid` when signed in or `'anonymous'` when unauthenticated. `isCreator == true` on replies is strictly gated to the verified runtime creator email (`tttduong1105@gmail.com` with `email_verified == true`).
7. **Atomic Relational Sync**: Creating a reply in `/letters/{letterId}/replies/{replyId}` requires parent `/letters/{letterId}` to exist with `status == 'approved'` and atomically increment `repliesCount` by `+1` in the same batch (`getAfter`).
8. **Action-Based Immutable Updates & No Client Deletes**: Letter updates can only increment `heartsCount` by `+1` or `repliesCount` by `+1` while keeping all content, sender, image, status, and creation metadata immutable. Client deletes are forbidden (`allow delete: if false`).

## 2. The "Dirty Dozen" Adversarial Payloads (All Must Return `PERMISSION_DENIED`)
1. **Shadow Field Injection on Letter Create**: Valid letter payload + `"isAdmin": true` -> Rejected by `hasOnly(...)`.
2. **Invalid Topic Enum**: Letter with `"topic": "Quảng cáo"` -> Rejected by `topic in ['Tâm sự', 'Feedback', 'Góp ý tưởng']`.
3. **Oversized Content / Image Bomb**: Letter with `content` of 2,000 chars or `imageUrl` of 400,000 chars -> Rejected by `.size() <= 800` / `.size() <= 250000`.
4. **Client Timestamp Spoofing**: Letter with past/future `createdAt` instead of `serverTimestamp()` -> Rejected by `incoming().createdAt == request.time`.
5. **Artificial Heart Inflation on Create**: Letter created with `heartsCount: 500` -> Rejected by `incoming().heartsCount == 1`.
6. **Heart Jump Attack on Update**: Updating `heartsCount` from `1` to `100` -> Rejected by `incoming().heartsCount == existing().heartsCount + 1`.
7. **Immutable Content Tampering on Update**: Modifying `content` or `imageUrl` alongside `heartsCount` -> Rejected by `affectedKeys().hasOnly(['heartsCount', 'updatedAt'])`.
8. **ID Poisoning**: Creating `/letters/bad$id!with spaces` -> Rejected by `isValidId(letterId)`.
9. **Creator Impersonation with Unverified Email**: Reply with `isCreator: true` where `email == 'tttduong1105@gmail.com'` but `email_verified == false` -> Rejected by `isVerifiedCreator()`.
10. **UID Spoofing**: Unauthenticated client setting `authorUid: "victim-uid-123"` -> Rejected by `(!isSignedIn() && incoming().authorUid == 'anonymous')`.
11. **Orphaned / Non-Atomic Reply**: Creating `/letters/nonexistent/replies/rep-1` or omitting batch `+1` on parent `repliesCount` -> Rejected by `exists(...)` and `getAfter(...)`.
12. **Unauthorized Unfiltered List / Delete**: Listing `/letters` without `where('status', '==', 'approved')` or calling `deleteDoc` on any letter -> Rejected by `existing().status == 'approved'` and `allow delete: if false`.
