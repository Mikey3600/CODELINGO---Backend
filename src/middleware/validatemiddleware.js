import Joi from "joi";

export const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ message });
  }
  next();
};
export const projectStepSchema = Joi.object({
  stepId: Joi.string().required(),
  status: Joi.string().valid("not started", "in progress", "completed").required(),
});