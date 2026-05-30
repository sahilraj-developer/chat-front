# WhatsChat — Feature Roadmap & Scaling Guide

## What was added in this update

- **WhatsApp-style UI** — dark theme, green accents, chat bubbles, three-column layout on desktop
- **Groups** — create with name + members, group messaging, unread counts
- **Communities** — create with invite code, join via code, announcement group auto-created
- **Voice & video calls** — WebRTC peer calls with Socket.io signaling (1:1, direct chats only)

---

## Recommended features to add next

### Messaging (high impact)

| Feature | Why |
|--------|-----|
| **Message reactions** | Quick engagement without replies |
| **Reply / quote** | Thread context in busy groups |
| **Forward messages** | Share content across chats |
| **Voice notes** | Very common in WhatsApp usage |
| **File / document sharing** | Beyond images (PDF, docs) |
| **Message delete for everyone** | Privacy & mistake correction |
| **Edit message** | User expectation in modern chat |
| **Typing indicators** | Real-time presence |
| **Read receipts (✓✓)** | Already partial via `seen`; extend to groups |
| **Disappearing messages** | Privacy-focused users |
| **Pinned messages** | Important info in groups |

### Groups & communities

| Feature | Why |
|--------|-----|
| **Group admin tools** | Remove members, promote admins, mute |
| **Group voice/video calls** | Multi-party WebRTC or SFU (see below) |
| **Community sub-groups UI** | Browse groups inside a community |
| **Invite links** | Shareable URLs instead of codes only |
| **Polls in groups** | Engagement & decisions |

### Calls & media

| Feature | Why |
|--------|-----|
| **TURN server** | Calls fail behind strict NAT without it |
| **Group calls** | Use **Livekit**, **Daily**, or **mediasoup** SFU |
| **Screen sharing** | Remote work & support |
| **Push notifications** | FCM/APNs for incoming messages & calls |

### Security & trust

| Feature | Why |
|--------|-----|
| **End-to-end encryption** | Signal Protocol or libsignal — major effort |
| **2FA** | Account protection |
| **Report / block user** | Safety & moderation |
| **Rate limiting** | Abuse prevention on APIs |

### Product & growth

| Feature | Why |
|--------|-----|
| **Status / stories (24h)** | WhatsApp-style engagement loop |
| **QR code to add contact** | Easy onboarding |
| **Contact sync / phone book** | Real WhatsApp parity |
| **Multi-device sync** | Session per device |
| **Business catalog / bots** | Monetization & automation |

---

## How to scale the architecture

### Phase 1 — Single server (current)

```
React (Vite) → Express + Socket.io → MongoDB
                    ↓
              Cloudinary (images)
```

**Good for:** demos, <500 concurrent users, learning.

**Limits:** Socket.io on one Node process; MongoDB on one instance; no horizontal socket scaling.

---

### Phase 2 — Production basics

1. **Environment**
   - Separate `dev` / `staging` / `prod`
   - Secrets in vault (not `.env` in repo)
   - Restrict CORS to your frontend domain

2. **Database**
   - MongoDB Atlas with indexes:
     - `{ senderId: 1, receiverId: 1, createdAt: -1 }` (DMs)
     - `{ groupId: 1, createdAt: -1 }`
     - `{ communityId: 1, createdAt: -1 }`
   - Pagination (`limit` + `before` cursor) on message fetch

3. **Media**
   - Keep Cloudinary or move to S3 + CloudFront
   - Never store base64 images in MongoDB long-term

4. **Calls**
   - Add **coturn** or Twilio TURN for reliable WebRTC
   - For group calls, don’t mesh WebRTC — use an SFU

---

### Phase 3 — Horizontal scale

```
                    ┌─────────────┐
  Clients ─────────►│ Load balancer│
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      API server 1    API server 2    API server N
           │               │               │
           └───────────────┼───────────────┘
                           ▼
              Redis (Socket.io adapter)
                           ▼
                    MongoDB replica set
```

- **Socket.io Redis adapter** — share rooms/events across Node instances
- **Sticky sessions** or Redis for `userId → socketId` map
- **Bull/BullMQ** — email, push, image processing queues
- **Redis cache** — online users, recent chats, rate limits

---

### Phase 4 — Microservices (large scale)

| Service | Responsibility |
|---------|----------------|
| **Auth** | JWT, refresh tokens, OAuth |
| **Chat** | Messages CRUD, history |
| **Realtime** | WebSocket only |
| **Media** | Upload, transcode |
| **Calls** | Livekit/mediasoup dedicated |
| **Notifications** | FCM, email |
| **Search** | Elasticsearch for message/user search |

**Message pipeline example:**

```
Client → API (validate) → Kafka/RabbitMQ → Worker → MongoDB + push to Realtime service
```

---

### Tech stack upgrades (when ready)

| Area | Option |
|------|--------|
| Frontend mobile | React Native / Expo |
| State | TanStack Query + Zustand |
| Realtime | Ably, Pusher, or self-hosted Socket.io cluster |
| DB at scale | Sharded MongoDB or Cassandra for messages |
| CDN | Cloudflare for static + API edge |
| Observability | Sentry, Datadog, structured logs |
| CI/CD | GitHub Actions → Docker → AWS ECS / Railway / Render |

---

### Folder structure suggestion as you grow

```
chatapp/
├── apps/
│   ├── web/          # React
│   └── mobile/       # React Native (later)
├── packages/
│   ├── shared-types/
│   └── api-client/
├── services/
│   ├── api/
│   ├── realtime/
│   └── worker/
└── infra/            # Docker, k8s, Terraform
```

---

## Quick wins you can implement this week

1. Add **typing** socket event (`typing` / `stopTyping`)
2. Add **last message preview** on sidebar (store on Group/Community or aggregate)
3. Add **pagination** to `getMessages` (50 messages per page)
4. Deploy backend with **Render/Railway** and frontend on **Vercel**
5. Add **TURN** credentials for calls (`VITE_ICE_SERVERS` env)

---

## API reference (new endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group `{ name, description, memberIds }` |
| GET | `/api/groups` | List my groups |
| GET | `/api/groups/users` | Users to add to group |
| POST | `/api/communities` | Create community |
| GET | `/api/communities` | List my communities |
| POST | `/api/communities/join` | Join `{ inviteCode }` |
| GET | `/api/messages/group/:id` | Group messages |
| GET | `/api/messages/community/:id` | Community messages |
| POST | `/api/messages/send/group/:id` | Send to group |
| POST | `/api/messages/send/community/:id` | Send to community |

### Socket events (calls)

| Event | Direction | Purpose |
|-------|-----------|---------|
| `call-user` | Client → Server | Start call with SDP offer |
| `incoming-call` | Server → Client | Ringing |
| `call-accepted` | Both | SDP answer |
| `ice-candidate` | Both | ICE trickle |
| `end-call` / `call-rejected` | Both | Hang up / decline |

---

Questions or want help implementing any item from this doc? Pick a phase or feature and we can build it next.
