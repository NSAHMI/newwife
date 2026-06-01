import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'journal_app';
const PORT = process.env.PORT || 3001;

let db, entriesCollection;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  entriesCollection = db.collection('entries');

  await entriesCollection.createIndex({ userId: 1, createdAt: -1 });
  await entriesCollection.createIndex({ userId: 1, dateKey: 1 });

  console.log(`Connected to MongoDB: ${DB_NAME}`);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create a user ID (device-based, no login needed)
app.post('/api/auth/device', (req, res) => {
  const { deviceId } = req.body;
  const userId = deviceId || uuidv4();
  res.json({ userId });
});

// Get all entries for a user
app.get('/api/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await entriesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = entries.map(({ _id, ...rest }) => ({
      ...rest,
      id: _id.toString(),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/entries error:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get a single entry
app.get('/api/entries/:userId/:entryId', async (req, res) => {
  try {
    const { userId, entryId } = req.params;
    const entry = await entriesCollection.findOne({
      _id: new ObjectId(entryId),
      userId,
    });

    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    const { _id, ...rest } = entry;
    res.json({ ...rest, id: _id.toString() });
  } catch (err) {
    console.error('GET /api/entry error:', err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Create a new entry
app.post('/api/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, body, mood, imageUrl, imagePath, tags } = req.body;

    const now = new Date().toISOString();
    const dateKey = now.substring(0, 10);
    const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

    const doc = {
      userId,
      title,
      body,
      mood,
      imageUrl: imageUrl || null,
      imagePath: imagePath || null,
      createdAt: now,
      updatedAt: now,
      dateKey,
      tags: tags || [],
      wordCount,
    };

    const result = await entriesCollection.insertOne(doc);
    res.json({ ...doc, id: result.insertedId.toString() });
  } catch (err) {
    console.error('POST /api/entries error:', err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Update an entry
app.put('/api/entries/:userId/:entryId', async (req, res) => {
  try {
    const { userId, entryId } = req.params;
    const updates = req.body;

    const updateDoc = { updatedAt: new Date().toISOString() };

    if (updates.title !== undefined) updateDoc.title = updates.title;
    if (updates.body !== undefined) {
      updateDoc.body = updates.body;
      updateDoc.wordCount = updates.body.trim()
        ? updates.body.trim().split(/\s+/).length
        : 0;
    }
    if (updates.mood !== undefined) updateDoc.mood = updates.mood;
    if (updates.imageUrl !== undefined) updateDoc.imageUrl = updates.imageUrl;
    if (updates.imagePath !== undefined) updateDoc.imagePath = updates.imagePath;
    if (updates.tags !== undefined) updateDoc.tags = updates.tags;

    const result = await entriesCollection.findOneAndUpdate(
      { _id: new ObjectId(entryId), userId },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ error: 'Entry not found' });

    const { _id, ...rest } = result;
    res.json({ ...rest, id: _id.toString() });
  } catch (err) {
    console.error('PUT /api/entry error:', err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete an entry
app.delete('/api/entries/:userId/:entryId', async (req, res) => {
  try {
    const { userId, entryId } = req.params;
    const result = await entriesCollection.deleteOne({
      _id: new ObjectId(entryId),
      userId,
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/entry error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Delete all entries for a user
app.delete('/api/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await entriesCollection.deleteMany({ userId });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/entries error:', err);
    res.status(500).json({ error: 'Failed to delete entries' });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
