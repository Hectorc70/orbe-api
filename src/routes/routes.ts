import { createUser, loginUser } from "../controllers/controllers";
import { validateToken } from "../middleware/auth_jwt";


const { Router } = require("express");
const router = Router();
router.post("/users/create/", createUser);
router.post("/users/login/", loginUser);



export default router;
