import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { upload } from './middleware/upload';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
import authRoutes from './routes/auth';
import storesRoutes from './routes/stores';
import packsRoutes from './routes/packs';
import reservationsRoutes from './routes/reservations';
import favoritesRoutes from './routes/favorites';

app.use('/api/auth', authRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/packs', packsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/favorites', favoritesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Central error handling middleware (must be registered AFTER routes)
import { logErrors, wrapErrors, errorHandler } from './middleware/errorHandler';
app.use(logErrors);
app.use(wrapErrors);
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
