import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('dist')); // serve Vite static build

app.use('/api/v1', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});