"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            // Instead of returning the response, just send it and return
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        next(); // No return needed here
    };
}
