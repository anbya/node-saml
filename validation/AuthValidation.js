const Joi = require('joi');
const models = require('../models');

exports.loginValidation = (req, res, next) => {  
    const schema = models.authValidation.loginValidation;  
    const { error } = schema.validate(req.body);  
    if (error) {    
        return res.status(422).json({ error: error.details[0].message });  
    } 
    next();
};

exports.suspendValidation = (req, res, next) => {  
    const schema = models.authValidation.suspendValidation;  
    const { error } = schema.validate(req.body);  
    if (error) {    
        return res.status(422).json({ error: error.details[0].message });  
    } 
    next();
};

exports.resetValidation = (req, res, next) => {  
    const schema = models.authValidation.resetValidation;  
    const { error } = schema.validate(req.body);  
    if (error) {    
        return res.status(422).json({ error: error.details[0].message });  
    } 
    next();
};

exports.verifyValidation = (req, res, next) => {  
    const schema = models.authValidation.verifyValidation;  
    const { error } = schema.validate(req.body);  
    if (error) {    
        return res.status(422).json({ error: error.details[0].message });  
    } 
    next();
};

exports.changePasswordValidation = (req, res, next) => {  
    const schema = models.authValidation.changePasswordValidation;  
    const { error } = schema.validate(req.body);  
    if (error) {    
        return res.status(422).json({ error: error.details[0].message });  
    } 
    next();
};
