# ContentForge — Complete Backend Setup Guide
> Node.js · Express · MongoDB Atlas · Gemini 2.5 · RAG Pipeline

---

## Overview of What You're Building

```
Vue 3 Frontend (Port 5173)
        ↕ HTTP / REST API
Node.js + Express Backend (Port 3000)
        ↕
  ┌─────────────┬──────────────┬───────────────┐
  │ MongoDB Atlas│ Gemini 2.5   │ Google Embed  │
  │ (Database)  │ (LLM / Chat) │ (RAG Vectors) │
  └─────────────┴──────────────┴───────────────┘
```

---

## STEP 1 — Prerequisites (Install These First)

### 1.1 Install Node.js
Download from https://nodejs.org → choose LTS version (v20+)

Verify installation:
```bash
node --version   # should show v20+
npm --version    # should show v10+
```

### 1.2 Install Git
Download from https://git-scm.com (if not already installed)

### 1.3 Create a MongoDB Atlas Account (Free)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for FREE (no credit card needed)
3. Choose **Free Shared Cluster (M0)**
4. Pick region: **AWS · Middle East (Bahrain)** → best for Arab users
5. Click **Create Cluster** (takes ~3 minutes)

### 1.4 Get a Google Gemini API Key (Free)
1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy it — you'll use it in Step 4

---

## STEP 2 — Create the Backend Folder

Open your terminal (Command Prompt / VS Code Terminal) and run:

```bash
# Go to your project root (same level as your Vue frontend)
cd contentforge

# Create the backend folder
mkdir backend
cd backend

# Initialize Node.js project
npm init -y
```

---

## STEP 3 — Install All Dependencies

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken \
  @google/generative-ai multer express-async-errors node-cron axios
```

| Package | Purpose |
|---------|---------|
| `express` | Web framework — handles all API routes |
| `mongoose` | MongoDB connection & models |
| `dotenv` | Load secret keys from .env file |
| `cors` | Allow Vue frontend to call backend |
| `bcryptjs` | Hash user passwords |
| `jsonwebtoken` | Auth tokens (login sessions) |
| `@google/generative-ai` | Gemini 2.5 Flash + Embedding API |
| `multer` | Handle file uploads (PDF, images) |
| `express-async-errors` | Cleaner error handling |
| `node-cron` | Hourly trend scraping job |
| `axios` | HTTP requests to social platforms |

---

## STEP 4 — Create the .env File

Inside the `backend/` folder, create a file called `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/contentforge?retryWrites=true&w=majority

# Google AI (Gemini + Embeddings)
GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE

# JWT Auth
JWT_SECRET=contentforge_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

> ⚠️ NEVER commit .env to GitHub. Add it to .gitignore

---

## STEP 5 — Project Folder Structure

Create this structure inside `backend/`:

```
backend/
├── .env
├── package.json
├── server.js              ← Entry point
├── config/
│   └── db.js              ← MongoDB connection
├── models/
│   ├── User.js
│   ├── Brand.js
│   ├── Calendar.js
│   └── Post.js
├── routes/
│   ├── auth.js
│   ├── brand.js
│   ├── calendar.js
│   ├── posts.js
│   └── trends.js
├── controllers/
│   ├── authController.js
│   ├── brandController.js
│   ├── calendarController.js
│   └── postsController.js
├── middleware/
│   ├── auth.js            ← JWT verification
│   └── upload.js          ← Multer file handler
├── services/
│   ├── geminiService.js   ← AI generation
│   ├── embeddingService.js← RAG pipeline
│   └── trendService.js    ← Hourly scraping
└── uploads/               ← Uploaded brand files
```

Create all folders:
```bash
mkdir config models routes controllers middleware services uploads
```

---

## STEP 6 — MongoDB Connection (config/db.js)

```javascript
// backend/config/db.js
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
```

---

## STEP 7 — MongoDB Models

### 7.1 User Model (models/User.js)
```javascript
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  plan:     { type: String, enum: ['free','starter','growth','agency'], default: 'free' },
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password on login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
```

### 7.2 Brand Model (models/Brand.js)
```javascript
const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true },
  industry:       String,
  website:        String,
  targetAudience: String,
  dialects:       [String],   // ['Egyptian Arabic', 'Gulf Arabic']
  tones:          [String],   // ['Warm', 'Bold', 'Community-first']
  avoidTopics:    String,
  platforms:      [String],   // ['Instagram', 'Facebook', 'LinkedIn']
  
  // RAG: stored chunks (vectorized brand memory)
  ragChunks: [{
    content:   String,
    embedding: [Number],  // Google text-embedding-004 vector
    source:    String,    // 'guidelines' | 'past_posts'
  }],

  guidelinesFile: String,   // path to uploaded PDF
  pastPostsFiles: [String], // paths to uploaded images
}, { timestamps: true })

module.exports = mongoose.model('Brand', brandSchema)
```

### 7.3 Post Model (models/Post.js)
```javascript
const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  brand:    { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  calendar: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar' },
  
  platform:   { type: String, enum: ['Instagram','Facebook','LinkedIn','Twitter/X','TikTok'] },
  dialect:    String,
  copyAR:     String,   // Arabic copy
  copyEN:     String,   // English copy
  hashtags:   [String],
  imagePrompt:String,
  imageUrl:   String,   // DALL-E generated image
  
  // A/B variant from Critic Agent
  variantB: {
    copyAR:   String,
    copyEN:   String,
    hashtags: [String],
  },

  status: {
    type: String,
    enum: ['draft','pending_review','approved','scheduled','published'],
    default: 'draft'
  },
  scheduledAt:  Date,
  publishedAt:  Date,
  date:         String,   // '2026-05-26'
}, { timestamps: true })

module.exports = mongoose.model('Post', postSchema)
```

### 7.4 Calendar Model (models/Calendar.js)
```javascript
const mongoose = require('mongoose')

const calendarSchema = new mongoose.Schema({
  brand:     { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  title:     String,
  brief:     String,
  startDate: Date,
  endDate:   Date,
  posts:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  status:    { type: String, enum: ['generating','ready','approved'], default: 'generating' },
  trendsUsed:[String],
}, { timestamps: true })

module.exports = mongoose.model('Calendar', calendarSchema)
```

---

## STEP 8 — Gemini AI Service (services/geminiService.js)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── Generate a full 2-week content calendar ──────────────────────────────────
async function generateCalendar({ brief, brand, trends, dialect, platforms }) {

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `
You are ContentForge, an AI content strategist for Arabic and bilingual brands.

BRAND CONTEXT:
- Brand Name: ${brand.name}
- Industry: ${brand.industry}
- Target Audience: ${brand.targetAudience}
- Dialect: ${dialect}
- Tone: ${brand.tones.join(', ')}
- Avoid: ${brand.avoidTopics || 'nothing specified'}

CAMPAIGN BRIEF:
${brief}

TRENDING TOPICS RIGHT NOW:
${trends.join(', ')}

TASK:
Generate a 14-day content calendar for platforms: ${platforms.join(', ')}.
Include rest days (no post) on 2-3 days per week.

Respond ONLY with a valid JSON array. No extra text. Format:
[
  {
    "date": "2026-05-26",
    "platform": "Instagram",
    "dialect": "Egyptian Arabic",
    "copyAR": "Arabic post text here",
    "copyEN": "English translation here",
    "hashtags": ["hashtag1", "hashtag2"],
    "imagePrompt": "DALL-E prompt for the visual",
    "goal": "Awareness | Engagement | Conversion"
  }
]
Only include dates that have posts. Skip rest days entirely.
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Strip markdown fences if present
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── Generate A/B variant for a single post ───────────────────────────────────
async function generateVariantB({ post, brand }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `
You are an A/B Critic Agent for ContentForge.

Original post for ${post.platform} (${post.dialect}):
Arabic: ${post.copyAR}
English: ${post.copyEN}

Brand tone: ${brand.tones.join(', ')}

Create a Version B with:
- A stronger hook (lead with the offer or a question)
- Different CTA structure
- Same brand voice

Respond ONLY with JSON:
{
  "copyAR": "...",
  "copyEN": "...",
  "hashtags": ["..."]
}
`

  const result = await model.generateContent(prompt)
  const clean = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

module.exports = { generateCalendar, generateVariantB }
```

---

## STEP 9 — RAG Embedding Service (services/embeddingService.js)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai')
const Brand = require('../models/Brand')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── Chunk text into ~300-word segments ───────────────────────────────────────
function chunkText(text, maxWords = 300) {
  const words = text.split(/\s+/)
  const chunks = []
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
  }
  return chunks
}

// ── Embed a single string using Google text-embedding-004 ────────────────────
async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
}

// ── Embed all brand chunks and save to MongoDB ───────────────────────────────
async function embedBrandVault(brandId, guidelinesText, pastPostsText) {
  const chunks = []

  // Chunk brand guidelines
  const guideChunks = chunkText(guidelinesText)
  for (const chunk of guideChunks) {
    const embedding = await embedText(chunk)
    chunks.push({ content: chunk, embedding, source: 'guidelines' })
  }

  // Chunk past posts
  const postChunks = chunkText(pastPostsText)
  for (const chunk of postChunks) {
    const embedding = await embedText(chunk)
    chunks.push({ content: chunk, embedding, source: 'past_posts' })
  }

  // Save to MongoDB
  await Brand.findByIdAndUpdate(brandId, { ragChunks: chunks })
  console.log(`✅ Embedded ${chunks.length} chunks for brand ${brandId}`)
  return chunks.length
}

// ── Cosine similarity between two vectors ────────────────────────────────────
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dot / (magA * magB)
}

// ── Retrieve top-4 most relevant chunks for a given query ────────────────────
async function retrieveRelevantChunks(brandId, query, topK = 4) {
  const brand = await Brand.findById(brandId)
  if (!brand || !brand.ragChunks.length) return []

  const queryEmbedding = await embedText(query)

  const scored = brand.ragChunks.map(chunk => ({
    content: chunk.content,
    source:  chunk.source,
    score:   cosineSimilarity(queryEmbedding, chunk.embedding)
  }))

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.content)
}

module.exports = { embedBrandVault, retrieveRelevantChunks }
```

---

## STEP 10 — Auth Routes (routes/auth.js)

```javascript
const express    = require('express')
const router     = express.Router()
const User       = require('../models/User')
const jwt        = require('jsonwebtoken')

// Generate JWT token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ message: 'Email already registered' })

  const user = await User.create({ name, email, password })
  const token = signToken(user._id)

  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.plan } })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Please provide email and password' })

  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' })

  const token = signToken(user._id)
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.plan } })
})

module.exports = router
```

---

## STEP 11 — Calendar Route (routes/calendar.js)

```javascript
const express    = require('express')
const router     = express.Router()
const protect    = require('../middleware/auth')
const Calendar   = require('../models/Calendar')
const Post       = require('../models/Post')
const Brand      = require('../models/Brand')
const { generateCalendar, generateVariantB } = require('../services/geminiService')
const { retrieveRelevantChunks }             = require('../services/embeddingService')

// POST /api/calendar/generate
// Body: { brandId, brief, dialect, platforms, startDate }
router.post('/generate', protect, async (req, res) => {
  const { brandId, brief, dialect, platforms, startDate } = req.body

  const brand = await Brand.findById(brandId)
  if (!brand) return res.status(404).json({ message: 'Brand not found' })

  // 1. Retrieve RAG context
  const relevantChunks = await retrieveRelevantChunks(brandId, brief)

  // 2. Get live trends (simplified — replace with real scraper)
  const trends = ['#رمضان_كريم', '#قهوة_الصباح', 'Cold brew Egypt 2026']

  // 3. Call Gemini to generate calendar JSON
  const posts = await generateCalendar({
    brief, brand, trends, dialect, platforms,
    brandContext: relevantChunks.join('\n\n')
  })

  // 4. Save calendar to MongoDB
  const calendar = await Calendar.create({
    brand: brandId, user: req.user._id,
    brief, startDate: startDate || new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    trendsUsed: trends, status: 'ready'
  })

  // 5. Save each post
  const savedPosts = await Promise.all(posts.map(p =>
    Post.create({ ...p, brand: brandId, calendar: calendar._id })
  ))

  // 6. Link posts to calendar
  calendar.posts = savedPosts.map(p => p._id)
  await calendar.save()

  res.json({ calendar, posts: savedPosts })
})

// GET /api/calendar/:id — Load a saved calendar
router.get('/:id', protect, async (req, res) => {
  const calendar = await Calendar.findById(req.params.id).populate('posts')
  if (!calendar) return res.status(404).json({ message: 'Calendar not found' })
  res.json(calendar)
})

// GET /api/calendar/brand/:brandId — All calendars for a brand
router.get('/brand/:brandId', protect, async (req, res) => {
  const calendars = await Calendar.find({ brand: req.params.brandId }).sort('-createdAt')
  res.json(calendars)
})

module.exports = router
```

---

## STEP 12 — Auth Middleware (middleware/auth.js)

```javascript
const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}

module.exports = protect
```

---

## STEP 13 — Main Server Entry (server.js)

```javascript
require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors    = require('cors')
const connectDB = require('./config/db')

const app = express()
connectDB()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/brand',    require('./routes/brand'))
app.use('/api/calendar', require('./routes/calendar'))
app.use('/api/posts',    require('./routes/posts'))
app.use('/api/trends',   require('./routes/trends'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Server Error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 ContentForge backend running on port ${PORT}`))
```

---

## STEP 14 — Connect Vue Frontend to Backend

In your Vue 3 project, create `src/api/index.js`:

```javascript
// contentforge/src/api/index.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// Auto-attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth
export const login    = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)

// ── Calendar
export const generateCalendar = (data) => api.post('/calendar/generate', data)
export const getCalendar      = (id)   => api.get(`/calendar/${id}`)
export const getBrandCalendars= (brandId) => api.get(`/calendar/brand/${brandId}`)

// ── Posts
export const updatePostStatus = (id, status) => api.patch(`/posts/${id}/status`, { status })
export const approvePost      = (id)          => api.patch(`/posts/${id}/approve`)

// ── Brand
export const saveBrand        = (data) => api.post('/brand', data)
export const getBrand         = (id)   => api.get(`/brand/${id}`)

export default api
```

Then in `package.json` of your frontend, add:
```bash
npm install axios
```

---

## STEP 15 — Run Both Servers

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd contentforge/backend
node server.js
# → 🚀 ContentForge backend running on port 3000
# → ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

**Terminal 2 — Frontend:**
```bash
cd contentforge
npm run dev
# → Local: http://localhost:5173
```

---

## STEP 16 — Deploy to Production

### Backend → Render (Free)
1. Push `backend/` folder to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all `.env` variables in Render's **Environment** tab
7. Render gives you a URL like: `https://contentforge-api.onrender.com`

### Frontend → Vercel (Free)
1. In `contentforge/src/api/index.js` change `baseURL` to your Render URL
2. Push frontend to GitHub
3. Go to https://vercel.com → New Project → Import your repo
4. Framework preset: **Vite**
5. Done — Vercel auto-deploys on every push

---

## Summary: All API Endpoints

| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT token |
| POST | `/api/brand` | Save brand vault + trigger RAG embedding |
| GET  | `/api/brand/:id` | Load brand profile |
| POST | `/api/calendar/generate` | Generate 2-week calendar with Gemini |
| GET  | `/api/calendar/:id` | Load saved calendar |
| GET  | `/api/calendar/brand/:id` | All calendars for a brand |
| PATCH| `/api/posts/:id/status` | Update post status (draft → approved etc.) |
| PATCH| `/api/posts/:id/approve` | Approve a single post |
| GET  | `/api/trends` | Get latest scraped trends |
| GET  | `/api/health` | Check if server is running |
