// src/routes/profile.routes.ts
import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/documents/' });
const router = Router();

router.use(authMiddleware);

router.get('/', ProfileController.getProfile as any);
router.get('/status', ProfileController.getProfileStatus as any);
router.patch('/basic-details', ProfileController.updateBasicDetails);
router.patch('/contact-details', ProfileController.updateContactDetails as any);
router.patch('/job-details', ProfileController.updateJobDetails as any);
router.patch('/bank-details', ProfileController.updateBankDetails as any);
router.post('/documents', upload.array('files'), ProfileController.uploadDocuments as any);
router.get('/section/:section', ProfileController.getProfileSection as any);

export default router;