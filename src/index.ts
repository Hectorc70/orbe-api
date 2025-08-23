import dotenv from "dotenv";
dotenv.config();

import express, { Express} from "express";
import cors from "cors";
import apiRoutes from './routes/routes';
import connectDB from "./common/database/connection";
const app: Express = express()
app.use(cors());
app.use(express.json());
// Conectar a MongoDB
connectDB();
// Usamos las rutas definidas para los recursos
app.use('/', apiRoutes);
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});