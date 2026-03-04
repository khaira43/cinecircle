import { Router } from "express";
import { register, login } from "../controllers/authController";
import { validateRegister, validateLogin } from "../middleware/validators/authValidators";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Temporary test route — remove this after testings
// router.get("/me", protect, (req: AuthRequest, res: Response) => {
//   res.json({ message: "Token is valid!", user: req.user });
// });

export default router;