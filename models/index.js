const Joi = require('joi');

const millItem = Joi.object().keys({
    millId: Joi.number().required(),
    sended_cpo: Joi.number().required(),
    sended_pk: Joi.number().required(),
}) 

module.exports = {
    authValidation:{
        loginValidation:Joi.object({    
            email: Joi.string().email({ tlds: { allow: false } }).required(),
            password: Joi.required()
        }),
        suspendValidation:Joi.object({    
            email: Joi.string().email({ tlds: { allow: false } }).required()
        }),
        resetValidation:Joi.object({    
            email: Joi.string().email({ tlds: { allow: false } }).required()
        }),
        verifyValidation:Joi.object({    
            email: Joi.string().email({ tlds: { allow: false } }).required(),
            code: Joi.number().required()
        }),
        changePasswordValidation:Joi.object({   
            email: Joi.string().email({ tlds: { allow: false } }).required(),
            password: Joi.string().required(),
            code: Joi.string().required(),
        })
    },
    formEntrierValidation:{
        addFormEntriesAnswerValidation:Joi.object({    
            booleanValue: Joi.boolean(),
            optionValue: Joi.number(),
            textValue: Joi.string().allow(null, ''),
            fileValue: Joi.string(),
            dateValue: Joi.date(),
            surveyId: Joi.number(),
        }),
        addFormEntriesSuppliersValidation:Joi.object({    
            name: Joi.string().allow(null, 'null', ''),
            supplier_category_id: Joi.number().allow(null, 'null', ''),
            total_farmer: Joi.number().allow(null, 'null', ''),
            location: Joi.string().allow(null, 'null', ''),
            longitude: Joi.number().allow(null, 'null', ''),
            latitude: Joi.number().allow(null, 'null', ''),
            location_description: Joi.string().allow(null, 'null', ''),
            total_concession_area: Joi.number().allow(null, 'null', ''),
            total_planted_area: Joi.number().allow(null, 'null', ''),
            total_produced_area: Joi.number().allow(null, 'null', ''),
            total_hcv_hcs: Joi.number().allow(null, 'null', ''),
            planting_year_id: Joi.number().allow(null, 'null', ''),
            legality_id: Joi.number().allow(null, 'null', ''),
            certificate_id: Joi.number().allow(null, 'null', ''),
            total_produce_tbs: Joi.number().allow(null, 'null', ''),
            total_received_tbs: Joi.number().allow(null, 'null', ''),
            file: Joi.string().allow(null, 'null', ''),
            village_id_list: Joi.string().custom((value, helpers) => {  
                try {    
                    const parsedArray = JSON.parse(value);    
                    if (!Array.isArray(parsedArray)) {      
                        throw new Error('Invalid array format');    
                    }    
                    for (let i = 0; i < parsedArray.length; i++) {
                        if(!Number.isInteger(parsedArray[i])){
                            throw new Error('Invalid array item format'); 
                        }
                    }
                    return parsedArray;  
                } catch (error) {    
                    throw new Error('Invalid array format'); 
                }
            }),
            location_list: Joi.string().custom((value, helpers) => {  
                try {    
                    const parsedArray = JSON.parse(value);    
                    if (!Array.isArray(parsedArray)) {      
                        throw new Error('Invalid array format');    
                    }    
                    return parsedArray;  
                } catch (error) {    
                    throw new Error('Invalid array format'); 
                }
            }),
        }),
        addFormEntriesDealersValidation:Joi.object({    
            name: Joi.string().allow(null, 'null', ''),
            farmer_name: Joi.string().allow(null, 'null', ''),
            location: Joi.string().allow(null, 'null', ''),
            longitude: Joi.number().allow(null, 'null', ''),
            latitude: Joi.number().allow(null, 'null', ''),
            location_description: Joi.string().allow(null, 'null', ''),
            total_concession_area: Joi.number().allow(null, 'null', ''),
            total_planted_area: Joi.number().allow(null, 'null', ''),
            total_produce_area: Joi.number().allow(null, 'null', ''),
            legality_id: Joi.number().allow(null, 'null', ''),
            total_produce_tbs: Joi.number().allow(null, 'null', ''),
            total_received_tbs: Joi.number().allow(null, 'null', ''),
            supplier_id: Joi.number().allow(null, 'null', ''),
            planting_year_id: Joi.number().allow(null, 'null', ''),
            file: Joi.string().allow(null, 'null', ''),
            village_id_list: Joi.string().custom((value, helpers) => {  
                try {    
                    const parsedArray = JSON.parse(value);    
                    if (!Array.isArray(parsedArray)) {      
                        throw new Error('Invalid array format');    
                    }    
                    for (let i = 0; i < parsedArray.length; i++) {
                        if(!Number.isInteger(parsedArray[i])){
                            throw new Error('Invalid array item format'); 
                        }
                    }
                    return parsedArray;  
                } catch (error) {    
                    throw new Error('Invalid array format'); 
                }
            }),
            location_list: Joi.string().custom((value, helpers) => {  
                try {    
                    const parsedArray = JSON.parse(value);    
                    if (!Array.isArray(parsedArray)) {      
                        throw new Error('Invalid array format');    
                    }    
                    return parsedArray;  
                } catch (error) {    
                    throw new Error('Invalid array format'); 
                }
            }),
        }),
        addFormEntriesMemberGroupsValidation:Joi.object({    
            name: Joi.string().allow(null, 'null', ''),
            farmer_name: Joi.string().allow(null, 'null', ''),
            location: Joi.string().allow(null, 'null', ''),
            longitude: Joi.number().allow(null, 'null', ''),
            latitude: Joi.number().allow(null, 'null', ''),
            location_description: Joi.string().allow(null, 'null', ''),
            province_id: Joi.number().allow(null, 'null', ''),
            district_id: Joi.number().allow(null, 'null', ''),
            village_id: Joi.number().allow(null, 'null', ''),
            total_concession_area: Joi.number().allow(null, 'null', ''),
            total_planted_area: Joi.number().allow(null, 'null', ''),
            total_produce_area: Joi.number().allow(null, 'null', ''),
            legality_id: Joi.number().allow(null, 'null', ''),
            total_produce_tbs: Joi.number().allow(null, 'null', ''),
            total_received_tbs: Joi.number().allow(null, 'null', ''),
            supplier_id: Joi.number().allow(null, 'null', ''),
            planting_year_id: Joi.number().allow(null, 'null', ''),
            file: Joi.string().allow(null, 'null', ''),
            location_list: Joi.string().custom((value, helpers) => {  
                try {    
                    const parsedArray = JSON.parse(value);    
                    if (!Array.isArray(parsedArray)) {      
                        throw new Error('Invalid array format');    
                    }    
                    return parsedArray;  
                } catch (error) {    
                    throw new Error('Invalid array format'); 
                }
            }),
        }),
        setFormEntriesTraceabilityValidation:Joi.object({    
            total_produced_cpo: Joi.number().required(),
            total_produced_pk: Joi.number().required(),
            average_yield_cpo: Joi.number().required(),
            average_yield_pk: Joi.number().required(),
        })
    },
    millsValidation:{
        millsValidation:Joi.object({
            name: Joi.string().allow(null, ''),
            umlid: Joi.string().allow(null, ''),
            pmks_name: Joi.string().allow(null, ''),
            group_name: Joi.string().allow(null, ''),
            pmks_status: Joi.string().allow(null, ''),
            pmks_commisioning: Joi.date().allow(null, ''),
            capacities: Joi.number().allow(null, ''),
            installation_biogass_methane: Joi.boolean().allow(null, ''),
            location: Joi.string().allow(null, ''),
            district_id: Joi.number().allow(null, ''),
            longitude: Joi.number().allow(null, ''),
            latitude: Joi.number().allow(null, ''),
            factory_site_permit_number: Joi.string().allow(null, ''),
            factory_site_ha: Joi.number().allow(null, ''),
            factory_site_permit_issue_date: Joi.date().allow(null, ''),
            farm_site_permit_number: Joi.string().allow(null, ''),
            farm_site_ha: Joi.number().allow(null, ''),
            farm_site_permit_issue_date: Joi.date().allow(null, ''),
            hgb_permit_number: Joi.string().allow(null, ''),
            hgb_ha: Joi.number().allow(null, ''),
            hgb_permit_issue_date: Joi.date().allow(null, ''),
            hgu_permit_number: Joi.string().allow(null, ''),
            hgu_ha: Joi.number().allow(null, ''),
            hgu_permit_issue_date: Joi.date().allow(null, ''),
            iup_permit_type: Joi.string().allow(null, ''),
            iup_permit_number: Joi.string().allow(null, ''),
            iup_ha: Joi.number().allow(null, ''),
            iup_permit_issue_date: Joi.date().allow(null, ''),
            iupb_permit_number: Joi.string().allow(null, ''),
            iupb_ha: Joi.number().allow(null, ''),
            iupb_permit_issue_date: Joi.date().allow(null, ''),
            amdal_ha: Joi.number().allow(null, ''),
            amdal_permit_issue_date: Joi.date().allow(null, ''),
            uklupl_ha: Joi.number().allow(null, ''),
            uklupl_permit_issue_date: Joi.date().allow(null, ''),
            environtmental_permit_number: Joi.string().allow(null, ''),
            environtmental_ha: Joi.number().allow(null, ''),
            environtmental_permit_issue_date: Joi.date().allow(null, ''),
            environtmental_permit_doc: Joi.string().allow(null, ''),
            farm_site_permit_doc: Joi.string().allow(null, ''),
            factory_site_permit_doc: Joi.string().allow(null, ''),
            hgb_permit_doc: Joi.string().allow(null, ''),
            hgu_permit_doc: Joi.string().allow(null, ''),
            iup_permit_doc: Joi.string().allow(null, ''),
            iupb_permit_doc: Joi.string().allow(null, ''),
            amdal_permit_doc: Joi.string().allow(null, ''),
            uklupl_permit_doc: Joi.string().allow(null, ''),
            cpo_sended_volume: Joi.number().allow(null, ''),
            pk_sended_volume: Joi.number().allow(null, ''),
            coordinate_mill_status: Joi.string().allow(null, ''),
        })
    },
    userValidation:{
        addUserValidation:Joi.object({    
            name: Joi.string(),
            email: Joi.string().email({ tlds: { allow: false } }).required(),
            contact: Joi.number(),
            department: Joi.string(),
            password: Joi.required(),
        }),
        assignSurveyValidation:Joi.object({       
            name: Joi.string().required(),
            start_periode: Joi.date().required(),
            end_periode: Joi.date().required(),
            type: Joi.string().required(),
            millList: Joi.array().items(millItem).min(1).required()
        }),
    },
    villageValidation:{
        villageValidation:Joi.object({    
            name: Joi.string().allow(null, ''),
            year: Joi.date().allow(null, ''),
            district_id: Joi.string().allow(null, ''),
            palm_oil_cover: Joi.string().allow(null, ''),
            latitude: Joi.string().allow(null, ''),
            longitude: Joi.string().allow(null, ''),
            file_excel_name: Joi.string().allow(null, ''),
        })
    }
};
