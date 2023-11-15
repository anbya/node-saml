const Joi = require('joi');
const models = require('../models');

exports.addUserValidation = (req, res, next) => {  
    const schema = models.userValidation.addUserValidation;  
    const { error } = schema.validate(req.body);  
    if (error) {    
        return res.status(422).json({ error: error.details[0].message });  
    } 
    next();
};