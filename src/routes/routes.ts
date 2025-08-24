import { createUser, getUser, loginUser, sendAmount, swapAmount } from "../controllers/controllers";
import { validateToken } from "../middleware/auth_jwt";


const { Router } = require("express");
const router = Router();
router.post("/users/create/", createUser);
router.post("/users/login/", loginUser);
router.get("/users/get/:id",validateToken, getUser);
router.post("/transactions/send/",validateToken, sendAmount);
router.post("/transactions/swap/",validateToken, swapAmount);

export default router;
