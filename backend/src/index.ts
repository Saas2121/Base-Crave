import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
