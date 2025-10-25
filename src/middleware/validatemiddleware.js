import Joi from "joi";
import AppError from "../utils/apperror.js"; // Import the custom error class


export const validateRequest = (schema) => (req, res, next) => {
    
    const { error } = schema.validate(req.body, { 
        abortEarly: false, 
        allowUnknown: false,
    });

    if (error) {

        const message = error.details.map((d) => d.message).join(", ");
        
        
        return next(new AppError(`Validation Failed: ${message}`, 400));
    }
    
   
    next();
};


export const projectStepSchema = Joi.object({
    stepId: Joi.string().required(),
    status: Joi.string().valid("not started", "in progress", "completed").required(),
});


export const profileUpdateSchema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    bio: Joi.string().max(500).optional(),
    avatar_url: Joi.string().uri().optional(),
   
    password: Joi.string().min(8).optional(), 
});


export const createChallengeSchema = Joi.object({
    title: Joi.string().max(100).required(),
    description: Joi.string().max(500).required(),
    difficulty: Joi.number().min(1).max(5).required(),
    topic: Joi.string().required(),
});
