import { createUser } from "../controllers/controllers";
import { validateToken } from "../middleware/auth_jwt";


const { Router } = require("express");
const router = Router();
router.post("/users/create/", createUser);

export default router;
