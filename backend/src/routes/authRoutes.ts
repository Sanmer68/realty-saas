import { Router } from 'express';
import { registro, login, getPerfil, updatePerfil } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', protect, getPerfil);
router.put('/perfil', protect, updatePerfil);

export default router;