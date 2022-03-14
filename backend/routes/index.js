import express from "express";
import { getUsers, addUser, login } from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/refreshToken.js";
const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/user', verifyToken, addUser);
router.post('/login', login);
router.get('/refresh-token', refreshToken)

export default router;