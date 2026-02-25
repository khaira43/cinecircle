import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'CineCircle API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
