
import * as languageService from '../services/languageservice.js';
import AppError from '../utils/apperror.js';


export const getAllLanguagesController = async (req, res, next) => {
    try {
        const languages = await languageService.getAllLanguages();
        res.json({
            status: 'success',
            results: languages.length,
            data: {
                languages,
            },
        });
    } catch (error) {
        next(error);
    }
};


export const getLanguageBySlugController = async (req, res, next) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return next(new AppError('Language slug is required in the path.', 400));
        }

        const language = await languageService.getLanguageBySlug(slug);

        res.json({
            status: 'success',
            data: {
                language,
            },
        });
    } catch (error) {
        next(error);
    }
};