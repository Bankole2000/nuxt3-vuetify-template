<script setup lang="ts">
useSeo({ title: 'Social Media UI', description: 'Tweet, Instagram post, and poll components.' })
definePageMeta({ layout: 'catalogue' })

// ── Tweet ────────────────────────────────────────────────────────────────────

interface TweetComment {
  id: number
  avatar: string
  name: string
  handle: string
  body: string
  likes: number
  time: string
  liked: boolean
}

interface Tweet {
  avatar: string
  name: string
  handle: string
  verified: boolean
  body: string
  time: string
  likes: number
  retweets: number
  replies: number
  bookmarks: number
  liked: boolean
  retweeted: boolean
  bookmarked: boolean
  comments: TweetComment[]
}

const tweet = reactive<Tweet>({
  avatar: 'JD',
  name: 'Jamie Doyle',
  handle: '@jamiedoyle',
  verified: true,
  body: 'Just shipped a new feature after three weeks of fighting with edge cases. The code is elegant now, but nobody will ever see the 47 commits I reverted to get here. 🚀\n\nShipping is underrated. Perfect is the enemy of done.',
  time: '11:42 AM · Jul 4, 2026',
  likes: 1847,
  retweets: 312,
  replies: 94,
  bookmarks: 208,
  liked: false,
  retweeted: false,
  bookmarked: false,
  comments: [
    { id: 1, avatar: 'SR', name: 'Sofi R.', handle: '@sofirdev', body: 'That moment when git log looks like a crime scene 😂', likes: 214, time: '12m', liked: false },
    { id: 2, avatar: 'TK', name: 'Theo Kim', handle: '@theokim', body: 'The 47 reverted commits ARE the feature. The real treasure is the commits we reverted along the way.', likes: 891, time: '8m', liked: false },
    { id: 3, avatar: 'AL', name: 'Amara L.', handle: '@amaralux', body: 'Replying to @jamiedoyle — shipped > perfect. Frame this.', likes: 67, time: '3m', liked: false },
  ],
})

function toggleLike() { tweet.liked = !tweet.liked; tweet.likes += tweet.liked ? 1 : -1 }
function toggleRetweet() { tweet.retweeted = !tweet.retweeted; tweet.retweets += tweet.retweeted ? 1 : -1 }
function toggleBookmark() { tweet.bookmarked = !tweet.bookmarked; tweet.bookmarks += tweet.bookmarked ? 1 : -1 }
function toggleCommentLike(c: TweetComment) { c.liked = !c.liked; c.likes += c.liked ? 1 : -1 }

function fmtCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

const showComments = ref(true)

// ── Instagram Post ───────────────────────────────────────────────────────────

const igPost = reactive({
  avatar: 'NP',
  name: 'noor.pixels',
  location: 'Kyoto, Japan',
  imageGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 100%)',
  caption: '🌸 Golden hour at Fushimi Inari — the light through the torii gates at dusk is something else entirely. No filters, no edits. Just the sky doing its thing.',
  tags: ['travel', 'japan', 'goldenHour', 'kyoto', 'streetphotography'],
  likes: 4203,
  time: '2 hours ago',
  liked: false,
  saved: false,
  comments: [
    { id: 1, name: 'mika.travel', body: 'This is absolutely stunning 😍', liked: false, likes: 42 },
    { id: 2, name: 'lens.by.leo', body: 'The composition here is perfect. What time did you get there?', liked: false, likes: 18 },
    { id: 3, name: 'wanderlust.k', body: 'Adding this to my list immediately 🙏', liked: false, likes: 9 },
  ],
  newComment: '',
})

function toggleIgLike() { igPost.liked = !igPost.liked; igPost.likes += igPost.liked ? 1 : -1 }
function toggleIgSave() { igPost.saved = !igPost.saved }
function toggleIgCommentLike(c: { liked: boolean; likes: number }) { c.liked = !c.liked; c.likes += c.liked ? 1 : -1 }
function submitIgComment() {
  if (!igPost.newComment.trim()) return
  igPost.comments.push({ id: Date.now(), name: 'you', body: igPost.newComment.trim(), liked: false, likes: 0 })
  igPost.newComment = ''
}

// ── Poll ─────────────────────────────────────────────────────────────────────

interface PollOption { id: number; label: string; votes: number; color: string }

const poll = reactive({
  question: 'What\'s the biggest bottleneck in your engineering workflow?',
  author: 'Dev Pulse',
  authorHandle: '@devpulse',
  avatar: 'DP',
  endsIn: '18 hours left',
  totalVotes: 0,
  voted: null as number | null,
  options: [
    { id: 1, label: 'Code review turnaround', votes: 841, color: '#6366f1' },
    { id: 2, label: 'Unclear requirements',   votes: 1204, color: '#8b5cf6' },
    { id: 3, label: 'Slow CI/CD pipelines',   votes: 533, color: '#a78bfa' },
    { id: 4, label: 'Meetings & interruptions', votes: 978, color: '#c4b5fd' },
  ] as PollOption[],
})

poll.totalVotes = poll.options.reduce((s, o) => s + o.votes, 0)

function votePoll(optionId: number) {
  if (poll.voted !== null) return
  poll.voted = optionId
  const opt = poll.options.find(o => o.id === optionId)
  if (opt) { opt.votes++; poll.totalVotes++ }
}

function pollPercent(votes: number) {
  if (poll.totalVotes === 0) return 0
  return Math.round((votes / poll.totalVotes) * 100)
}

function fmtVotes(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}
</script>

<template>
  <div class="social-page">
    <div class="social-page__header">
      <h1 class="social-page__title">Social Media UI</h1>
      <p class="social-page__sub">Interactive tweet thread, Instagram post, and voting poll — all fully reactive.</p>
    </div>

    <div class="social-grid">

      <!-- ── Tweet ──────────────────────────────────────────────────────────── -->
      <section class="social-section">
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:#1D9BF0">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Post
        </div>

        <div class="tweet-card">
          <!-- Author -->
          <div class="tweet-author">
            <div class="avatar avatar--blue">{{ tweet.avatar }}</div>
            <div class="tweet-author__info">
              <div class="tweet-author__name">
                {{ tweet.name }}
                <svg v-if="tweet.verified" class="verified-badge" viewBox="0 0 24 24" fill="#1D9BF0">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C3.13 9.33 2.25 10.57 2.25 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.33-2.19c1.4.46 2.91.2 3.92-.81s1.26-2.52.8-3.91C21.36 14.67 22.25 13.43 22.25 12zm-10.25 3.5l-3.75-3.75 1.06-1.06 2.69 2.69 5.19-5.19 1.06 1.06-6.25 6.25z"/>
                </svg>
              </div>
              <div class="tweet-author__handle">{{ tweet.handle }}</div>
            </div>
            <button class="tweet-follow-btn">Follow</button>
          </div>

          <!-- Body -->
          <div class="tweet-body">
            <p v-for="(line, i) in tweet.body.split('\n\n')" :key="i" :class="i > 0 ? 'tweet-body__para' : ''">{{ line }}</p>
          </div>

          <!-- Time -->
          <div class="tweet-time">{{ tweet.time }}</div>

          <!-- Stats bar -->
          <div class="tweet-stats">
            <span>{{ fmtCount(tweet.replies) }} <span class="tweet-stats__label">Replies</span></span>
            <span>{{ fmtCount(tweet.retweets) }} <span class="tweet-stats__label">Reposts</span></span>
            <span>{{ fmtCount(tweet.likes) }} <span class="tweet-stats__label">Likes</span></span>
            <span>{{ fmtCount(tweet.bookmarks) }} <span class="tweet-stats__label">Bookmarks</span></span>
          </div>

          <!-- Actions -->
          <div class="tweet-actions">
            <button class="tweet-action" @click="showComments = !showComments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ fmtCount(tweet.replies) }}
            </button>
            <button class="tweet-action" :class="{ 'tweet-action--green': tweet.retweeted }" @click="toggleRetweet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              {{ fmtCount(tweet.retweets) }}
            </button>
            <button class="tweet-action" :class="{ 'tweet-action--red': tweet.liked }" @click="toggleLike">
              <svg viewBox="0 0 24 24" :fill="tweet.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {{ fmtCount(tweet.likes) }}
            </button>
            <button class="tweet-action" :class="{ 'tweet-action--blue': tweet.bookmarked }" @click="toggleBookmark">
              <svg viewBox="0 0 24 24" :fill="tweet.bookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              {{ fmtCount(tweet.bookmarks) }}
            </button>
          </div>

          <!-- Comments -->
          <Transition name="slide">
            <div v-if="showComments" class="tweet-comments">
              <div v-for="c in tweet.comments" :key="c.id" class="tweet-comment">
                <div class="avatar avatar--sm avatar--muted">{{ c.avatar }}</div>
                <div class="tweet-comment__body">
                  <div class="tweet-comment__meta">
                    <span class="tweet-comment__name">{{ c.name }}</span>
                    <span class="tweet-comment__handle">{{ c.handle }}</span>
                    <span class="tweet-comment__time">· {{ c.time }}</span>
                  </div>
                  <p class="tweet-comment__text">{{ c.body }}</p>
                  <button class="tweet-action tweet-action--sm" :class="{ 'tweet-action--red': c.liked }" @click="toggleCommentLike(c)">
                    <svg viewBox="0 0 24 24" :fill="c.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {{ c.likes }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </section>

      <!-- ── Instagram Post ─────────────────────────────────────────────────── -->
      <section class="social-section">
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <defs>
              <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
                <stop offset="0%" stop-color="#f09433"/>
                <stop offset="25%" stop-color="#e6683c"/>
                <stop offset="50%" stop-color="#dc2743"/>
                <stop offset="75%" stop-color="#cc2366"/>
                <stop offset="100%" stop-color="#bc1888"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="url(#ig-grad)" stroke="none"/>
          </svg>
          Post
        </div>

        <div class="ig-card">
          <!-- Header -->
          <div class="ig-header">
            <div class="ig-avatar-wrap">
              <div class="ig-avatar-ring" />
              <div class="avatar avatar--ig">{{ igPost.avatar }}</div>
            </div>
            <div class="ig-header__info">
              <div class="ig-header__name">{{ igPost.name }}</div>
              <div class="ig-header__location">{{ igPost.location }}</div>
            </div>
            <button class="ig-more-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
          </div>

          <!-- Image (gradient placeholder) -->
          <div class="ig-image" :style="{ background: igPost.imageGradient }">
            <div class="ig-image__overlay">
              <span class="ig-image__label">Fushimi Inari Taisha</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="ig-actions">
            <div class="ig-actions__left">
              <button class="ig-action" :class="{ 'ig-action--liked': igPost.liked }" @click="toggleIgLike">
                <svg viewBox="0 0 24 24" :fill="igPost.liked ? '#ff3040' : 'none'" :stroke="igPost.liked ? '#ff3040' : 'currentColor'" stroke-width="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <button class="ig-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </button>
              <button class="ig-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <button class="ig-action" :class="{ 'ig-action--saved': igPost.saved }" @click="toggleIgSave">
              <svg viewBox="0 0 24 24" :fill="igPost.saved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>

          <!-- Likes -->
          <div class="ig-likes">{{ fmtVotes(igPost.likes) }} likes</div>

          <!-- Caption -->
          <div class="ig-caption">
            <span class="ig-caption__name">{{ igPost.name }}</span>
            {{ igPost.caption }}
            <div class="ig-tags">
              <span v-for="tag in igPost.tags" :key="tag" class="ig-tag">#{{ tag }}</span>
            </div>
          </div>

          <!-- Comments -->
          <div class="ig-comments">
            <div v-for="c in igPost.comments" :key="c.id" class="ig-comment">
              <div class="ig-comment__text">
                <span class="ig-comment__name">{{ c.name }}</span> {{ c.body }}
              </div>
              <button class="ig-action ig-action--sm" :class="{ 'ig-action--liked': c.liked }" @click="toggleIgCommentLike(c)">
                <svg viewBox="0 0 24 24" :fill="c.liked ? '#ff3040' : 'none'" :stroke="c.liked ? '#ff3040' : 'currentColor'" stroke-width="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          </div>

          <!-- New comment input -->
          <div class="ig-new-comment">
            <div class="avatar avatar--sm avatar--muted">YO</div>
            <input
              v-model="igPost.newComment"
              class="ig-new-comment__input"
              placeholder="Add a comment…"
              @keydown.enter="submitIgComment"
            />
            <button
              class="ig-new-comment__post"
              :disabled="!igPost.newComment.trim()"
              @click="submitIgComment"
            >Post</button>
          </div>

          <div class="ig-time">{{ igPost.time }}</div>
        </div>
      </section>

      <!-- ── Poll ──────────────────────────────────────────────────────────── -->
      <section class="social-section">
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
          Poll
        </div>

        <div class="poll-card">
          <div class="poll-header">
            <div class="avatar avatar--green">{{ poll.avatar }}</div>
            <div>
              <div class="poll-author__name">{{ poll.author }}</div>
              <div class="poll-author__handle">{{ poll.authorHandle }}</div>
            </div>
          </div>

          <p class="poll-question">{{ poll.question }}</p>

          <div class="poll-options">
            <button
              v-for="opt in poll.options"
              :key="opt.id"
              class="poll-option"
              :class="{
                'poll-option--voted': poll.voted !== null,
                'poll-option--winner': poll.voted !== null && pollPercent(opt.votes) === Math.max(...poll.options.map(o => pollPercent(o.votes))),
                'poll-option--selected': poll.voted === opt.id,
              }"
              :disabled="poll.voted !== null"
              @click="votePoll(opt.id)"
            >
              <div
                class="poll-option__bar"
                :style="poll.voted !== null
                  ? { width: pollPercent(opt.votes) + '%', background: opt.color + '33' }
                  : { width: '0%' }"
              />
              <span class="poll-option__label">{{ opt.label }}</span>
              <span v-if="poll.voted !== null" class="poll-option__pct">{{ pollPercent(opt.votes) }}%</span>
              <svg v-if="poll.voted === opt.id" class="poll-option__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>

          <div class="poll-footer">
            <span>{{ fmtVotes(poll.totalVotes) }} votes</span>
            <span class="poll-footer__dot">·</span>
            <span>{{ poll.endsIn }}</span>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* ── Tokens ─────────────────────────────────────────────────────────────────── */
:root {
  --bg:           #F8F9FA;
  --surface:      #FFFFFF;
  --surface-2:    #F1F3F5;
  --border:       #E2E5EA;
  --card-border:  #C8CDD6;
  --text:         #0F1117;
  --text-2:       #4B5563;
  --text-3:       #9CA3AF;
  --blue:         #1D9BF0;
  --blue-bg:      #EFF6FD;
  --red:          #F43F5E;
  --green:        #4ADE80;
  --ig-gradient:  linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:          #0F1117;
    --surface:     #1A1D27;
    --surface-2:   #242736;
    --border:      #2E3347;
    --card-border: #3E4560;
    --text:        #E7E9F0;
    --text-2:      #8B92A5;
    --text-3:      #555E73;
    --blue-bg:     #0D1F33;
  }
}

:root[data-theme="light"] {
  --bg:          #F8F9FA;
  --surface:     #FFFFFF;
  --surface-2:   #F1F3F5;
  --border:      #E2E5EA;
  --card-border: #C8CDD6;
  --text:        #0F1117;
  --text-2:      #4B5563;
  --text-3:      #9CA3AF;
  --blue-bg:     #EFF6FD;
}

:root[data-theme="dark"] {
  --bg:          #0F1117;
  --surface:     #1A1D27;
  --surface-2:   #242736;
  --border:      #2E3347;
  --card-border: #3E4560;
  --text:        #E7E9F0;
  --text-2:      #8B92A5;
  --text-3:      #555E73;
  --blue-bg:     #0D1F33;
}

/* ── Page layout ─────────────────────────────────────────────────────────── */
.social-page {
  background: var(--bg);
  min-height: 100vh;
  padding: 32px 24px 64px;
  font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
  color: var(--text);
}

.social-page__header {
  max-width: 960px;
  margin: 0 auto 32px;
}

.social-page__title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin: 0 0 4px;
}

.social-page__sub {
  font-size: 14px;
  color: var(--text-2);
  margin: 0;
}

.social-grid {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  align-items: start;
}

/* ── Section label ───────────────────────────────────────────────────────── */
.social-section { display: flex; flex-direction: column; gap: 10px; }

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
}

/* ── Shared avatar ───────────────────────────────────────────────────────── */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  color: #fff;
  user-select: none;
}

.avatar--blue    { background: #1D9BF0; }
.avatar--ig      { background: linear-gradient(135deg, #f09433, #dc2743, #bc1888); }
.avatar--green   { background: #059669; }
.avatar--muted   { background: var(--surface-2); color: var(--text-3); font-size: 11px; }
.avatar--sm      { width: 28px; height: 28px; font-size: 10px; }

/* ── Tweet card ──────────────────────────────────────────────────────────── */
.tweet-card {
  background: var(--surface);
  border: 2px solid #A8B0BC;
  border-radius: 16px;
  padding: 18px 18px 4px;
}

.tweet-author {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.tweet-author__info { flex: 1; min-width: 0; }

.tweet-author__name {
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text);
}

.verified-badge { width: 18px; height: 18px; flex-shrink: 0; }

.tweet-author__handle { font-size: 14px; color: var(--text-3); margin-top: 1px; }

.tweet-follow-btn {
  background: var(--text);
  color: var(--surface);
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.tweet-follow-btn:hover { opacity: 0.85; }

.tweet-body { font-size: 16px; line-height: 1.55; color: var(--text); margin-bottom: 14px; }
.tweet-body p { margin: 0; }
.tweet-body__para { margin-top: 12px; }

.tweet-time {
  font-size: 13px;
  color: var(--text-3);
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.tweet-stats {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.tweet-stats__label { font-weight: 400; color: var(--text-3); }

.tweet-actions {
  display: flex;
  justify-content: space-between;
  padding: 4px 0 8px;
  border-bottom: 1px solid var(--border);
}

.tweet-action {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px;
  border-radius: 50px;
  transition: color 0.15s, background 0.15s;
}
.tweet-action svg { width: 18px; height: 18px; flex-shrink: 0; }
.tweet-action--sm { padding: 4px 6px; font-size: 12px; }
.tweet-action--sm svg { width: 15px; height: 15px; }
.tweet-action:hover { background: var(--blue-bg); color: var(--blue); }
.tweet-action--red  { color: var(--red); }
.tweet-action--green { color: var(--green); }
.tweet-action--blue { color: var(--blue); }

.tweet-comments { padding-top: 4px; }

.tweet-comment {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.tweet-comment:last-child { border-bottom: none; }

.tweet-comment__body { flex: 1; min-width: 0; }

.tweet-comment__meta {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}
.tweet-comment__name  { font-size: 14px; font-weight: 700; color: var(--text); }
.tweet-comment__handle { font-size: 13px; color: var(--text-3); }
.tweet-comment__time   { font-size: 13px; color: var(--text-3); }
.tweet-comment__text   { font-size: 14px; line-height: 1.5; color: var(--text); margin: 0; }

/* ── Instagram card ──────────────────────────────────────────────────────── */
.ig-card {
  background: var(--surface);
  border: 2px solid #A8B0BC;
  border-radius: 12px;
  overflow: hidden;
}

.ig-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.ig-avatar-wrap { position: relative; flex-shrink: 0; }

.ig-avatar-ring {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: var(--ig-gradient);
  z-index: 0;
}

.ig-avatar-wrap .avatar { position: relative; z-index: 1; border: 2px solid var(--surface); }

.ig-header__info { flex: 1; min-width: 0; }
.ig-header__name { font-size: 14px; font-weight: 700; color: var(--text); }
.ig-header__location { font-size: 11px; color: var(--text-3); }

.ig-more-btn {
  background: none;
  border: none;
  color: var(--text-2);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.ig-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  display: flex;
  align-items: flex-end;
}

.ig-image__overlay {
  width: 100%;
  padding: 32px 16px 14px;
  background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%);
}

.ig-image__label {
  color: rgba(255,255,255,0.9);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ig-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 4px;
}

.ig-actions__left { display: flex; gap: 4px; }

.ig-action {
  background: none;
  border: none;
  color: var(--text-2);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: color 0.15s, transform 0.1s;
}
.ig-action svg { width: 22px; height: 22px; }
.ig-action--sm svg { width: 16px; height: 16px; }
.ig-action:hover { transform: scale(1.12); }
.ig-action--liked { color: #ff3040; }
.ig-action--saved { color: var(--text); }

.ig-likes {
  padding: 0 14px 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.ig-caption {
  padding: 0 14px 10px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
}

.ig-caption__name {
  font-weight: 700;
  margin-right: 4px;
}

.ig-tags {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ig-tag {
  color: var(--blue);
  font-size: 13px;
}

.ig-comments { padding: 0 14px 2px; }

.ig-comment {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
}

.ig-comment__text {
  font-size: 13px;
  line-height: 1.45;
  color: var(--text);
  flex: 1;
}

.ig-comment__name {
  font-weight: 700;
  margin-right: 4px;
}

.ig-new-comment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
}

.ig-new-comment__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text);
  caret-color: var(--blue);
}
.ig-new-comment__input::placeholder { color: var(--text-3); }

.ig-new-comment__post {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: var(--blue);
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.15s;
}
.ig-new-comment__post:disabled { opacity: 0.35; cursor: default; }
.ig-new-comment__post:not(:disabled):hover { opacity: 1; }

.ig-time {
  padding: 4px 14px 12px;
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Poll card ───────────────────────────────────────────────────────────── */
.poll-card {
  background: var(--surface);
  border: 2px solid #A8B0BC;
  border-radius: 16px;
  padding: 20px;
}

.poll-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.poll-author__name   { font-size: 15px; font-weight: 700; color: var(--text); }
.poll-author__handle { font-size: 13px; color: var(--text-3); }

.poll-question {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text);
  margin: 0 0 18px;
  text-wrap: balance;
}

.poll-options { display: flex; flex-direction: column; gap: 10px; }

.poll-option {
  position: relative;
  width: 100%;
  text-align: left;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 13px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.15s, transform 0.1s;
}

.poll-option:not(:disabled):hover { border-color: #6366f1; transform: translateY(-1px); }
.poll-option:disabled { cursor: default; }

.poll-option--selected { border-color: #6366f1; }
.poll-option--winner { border-color: #4ADE80; }

.poll-option__bar {
  position: absolute;
  inset: 0;
  height: 100%;
  border-radius: 8px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.poll-option__label { position: relative; z-index: 1; }

.poll-option__pct {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.poll-option__check {
  width: 16px;
  height: 16px;
  color: #4ADE80;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.poll-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.poll-footer__dot { color: var(--text-3); }

/* ── Slide transition ────────────────────────────────────────────────────── */
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 600px; }
</style>
