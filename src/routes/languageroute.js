import express from 'express';
import {
    getAllLanguagesController,
    getLanguageBySlugController,
} from '../controller/languagecontroller.js';

const router = express.Router();


router.get('/', getAllLanguagesController);
router.get('/:slug', getLanguageBySlugController);

export default router;