const router = require('express').Router();
const {PORT, SERVER, USER, VERSION, PASSWORD, DB_NAME, KEY} = process.env;
const {Sequelize, json} = require('sequelize');
const sequelize = new Sequelize(`mysql://${USER}:${PASSWORD}@${SERVER}:${PORT}/${DB_NAME}`)
const jwt = require('jsonwebtoken');
const sha1 = require('sha1');

//Models
const client = require('./models/client');
const Client = client(sequelize, Sequelize);
const city = require('./models/city');
const City = city(sequelize, Sequelize);
const department = require('./models/department');
const Department = department(sequelize, Sequelize);
const insurance = require('./models/insurance');
const Insurance = insurance(sequelize, Sequelize);

Department.hasMany(Client, { foreignKey: 'department_id' });
Client.belongsTo(Department, { foreignKey: 'department_id' });
City.hasMany(Client, { foreignKey: 'city_id' });
Client.belongsTo(City, { foreignKey: 'city_id' });
Insurance.hasMany(Client, { foreignKey: 'insurance_id' });
Client.belongsTo(Insurance, { foreignKey: 'insurance_id' });

// Middlewares

/**
 * 
 * @param {[rawHeaders]} req - Gets the token from the request's header.
 * @param {function} res - Sends to the user the response depending if the user has passed the token on the header request.
 * @param {function} next - When the user has passed a valid token on the request header proceeds to the next function.
 */

 function validateToken(req, res, next) {
    const decodeToken = req.rawHeaders.filter((item) => item.includes('Bearer'));
    const token = decodeToken.length > 0 ? decodeToken[0].split(' ')[1] : '';
    token ? next() : res.status(401).json({
        error: 'Invalid token',
        status: 401
    });;
}

// Routes

/**
 * Gets all clients from the database (only admin can see this information)
 */

router.get(`${VERSION}/client`, validateToken, (req, res) => {
    Client.findAll({
        attributes: {exclude: ['department_id', 'city_id', 'insurance_id']},
        include: [
            {
                model: Department
            },
            {
                model: City,
                attributes: {exclude: ['department_id']}
            },
            {
                model: Insurance
            }
        ]
    })
    .then((data) => {
        res.json(data)
    })
    .catch((err) => {
        res.status(500).json({
            error: `A problem has occurred with the server: ${err}.`,
            status: 500
        });
    })
});

/**
 * Creates a new client
 */

router.post(`${VERSION}/client/new`, validateToken, (req, res) => {
    const {name, last_name, email, client_type, dni_type, dni_number, phone, age, address, value_to_insure, department_id, city_id, insurance_id} = req.body;
    Insurance.findOne({where: {id: insurance_id}}).then(({percentage_to_insure, min_to_insure}) => {
        const insuredValue = value_to_insure * percentage_to_insure / 100;
        Client.create({
            name,
            last_name,
            email,
            client_type,
            dni_type,
            dni_number,
            phone,
            age,
            address,
            value_to_insure,
            department_id,
            city_id,
            insured: value_to_insure >= min_to_insure ? true : false,
            insurance_id,
            insured_value: insuredValue
        })
        .then(({id}) => {
            Client.findOne({
                where: {id: id},
                attributes: {exclude: ['insurance_id', 'department_id', 'city_id']},
                include: [
                    {
                        model: Department
                    },
                    {
                        model: City,
                        attributes: {exclude: ['department_id']}
                    },
                    {
                        model: Insurance
                    }
                ]
            }).then((data) => {
                res.json(data)
            }).catch((err) => {
                res.status(500).json({
                    error: `A problem has occurred with the server: ${err}.`,
                    status: 500
                });
            })
        })
        .catch(() => {
            res.status(400).json({
                error: `The information received is invalid or necessary information is missing.` ,
                status: 400
            });
        });
    })
    .catch((err) => {
        res.status(500).json({
            error: `A problem has occurred with the server: ${err}.`,
            status: 500
        });
    })
});

/**
 * Gets a clients by its id
 */

router.get(`${VERSION}/client/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    Client.findOne({where: {id: id},
        attributes: {exclude: ['department_id', 'city_id', 'insurance_id']},
        include: [
            {
                model: Department
            },
            {
                model: City,
                attributes: {exclude: ['department_id']}
            },
            {
                model: Insurance
            }
        ]
    })
    .then((data) => {
        data ? res.json(data) : res.status(404).json({
            error: 'Client not found.',
            status: 404
        });  
    })
    .catch((err) => {
        res.status(500).json({
            error: `A problem has occurred with the server: ${err}.`,
            status: 500
        });
    });
});

/**
 * Edit a client by its id
 */

router.put(`${VERSION}/client/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    const {name, last_name, email, client_type, dni_type, dni_number, phone, age, address, value_to_insure, department_id, city_id, insurance_id} = req.body;
    Client.findOne({where:{id: id}})
    .then((data) => {
        const oldValue = data.insurance_id;
        const oldValueToInsure = data.value_to_insure;
        if (insurance_id && oldValue !== insurance_id) {
            Insurance.findOne({where: {id: insurance_id}})
            .then(({percentage_to_insure, min_to_insure}) => {
                let insuredValue;
                let insuredState;
                if (value_to_insure) {
                    insuredValue = value_to_insure * percentage_to_insure / 100;
                    insuredState = value_to_insure > min_to_insure ? true : false;
                } else {
                    insuredValue = oldValueToInsure * percentage_to_insure / 100;
                    insuredState = oldValueToInsure > min_to_insure ? true : false;
                }
                Client.update({
                    name,
                    last_name,
                    email,
                    client_type,
                    dni_type,
                    dni_number,
                    phone,
                    age,
                    address,
                    value_to_insure,
                    department_id,
                    city_id,
                    insurance_id,
                    insured: insuredState,
                    insured_value: insuredValue
                }, {where: {id: id}})
                .then(() => {
                    Client.findOne({where: {id: id},
                        attributes: {exclude: ['department_id', 'city_id', 'insurance_id']},
                        include: [
                            {
                                model: Department
                            },
                            {
                                model: City,
                                attributes: {exclude:['department_id']}
                            },
                            {
                                model: Insurance
                            }
                        ]
                    })
                    .then((data) => {
                        res.json(data)
                    })
                    .catch((err) => {
                        res.status(500).json({
                            error: `A problem has occurred with the server: ${err}.`,
                            status: 500
                        });
                    })
                })
                .catch(() => {
                    res.status(400).json({
                        error: `The information received is invalid or necessary information is missing.` ,
                        status: 400
                    });
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: `A problem has occurred with the server: ${err}.`,
                    status: 500
                });
            })
        } else {
            Insurance.findOne({where: {id: oldValue}})
            .then(({percentage_to_insure, min_to_insure}) => {;
                let insuredValue;
                let insuredState;
                if (value_to_insure) {
                    insuredValue = value_to_insure * percentage_to_insure / 100;
                    insuredState = value_to_insure >= min_to_insure ? true : false;
                } else {
                    insuredValue = oldValueToInsure * percentage_to_insure / 100;
                    insuredState = oldValueToInsure >= min_to_insure ? true : false;
                }
                Client.update({
                    name,
                    last_name,
                    email,
                    client_type,
                    dni_type,
                    dni_number,
                    phone,
                    age,
                    address,
                    value_to_insure,
                    department_id,
                    city_id,
                    insurance_id,
                    insured: insuredState,
                    insured_value: insuredValue
                }, {where: {id: id}})
                .then(() => {
                    Client.findOne({where: {id: id},
                        attributes: {exclude: ['department_id', 'city_id', 'insurance_id']},
                        include: [
                            {
                                model: Department
                            },
                            {
                                model: City,
                                attributes: {exclude:['department_id']}
                            },
                            {
                                model: Insurance
                            }
                        ]
                    })
                    .then((data) => {
                        res.json(data)
                    })
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: `A problem has occurred with the server: ${err}.`,
                    status: 500
                });
            })
        }
    })
    .catch((err) => {
        res.status(500).json({
            error: `A problem has occurred with the server: ${err}.`,
            status: 500
        });
    })
});

/**
 * Deletes a client
 */

router.delete(`${VERSION}/client/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    Client.findOne({where: {id: id}})
    .then((data) => {
        if (data) {
            Client.destroy({where: {id: id}})
            .then(() => {
                res.json({
                    message: 'Client deleted successfully.',
                    status: 200
                })
            })
            .catch(() => {
                res.status(500).json({
                    error: `A problem has occurred with the server: ${err}.`,
                    status: 500
                });
            });
        } else {
            res.status(404).json({
                error: 'Client not found.',
                status: 404
            });
        }
    })
    .catch((err) => {
        res.status(500).json({
            error: `A problem has occurred with the server: ${err}.`,
            status: 500
        });
    });
});

// export

module.exports = router;