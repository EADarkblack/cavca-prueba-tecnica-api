const router = require('express').Router();
const {PORT, SERVER, USER, VERSION, PASSWORD, DB_NAME, KEY} = process.env;
const {Sequelize, where} = require('sequelize');
const sequelize = new Sequelize(`mysql://${USER}:${PASSWORD}@${SERVER}:${PORT}/${DB_NAME}`)

//Models
const insurer = require('./models/insurer');
const Insurer = insurer(sequelize, Sequelize);
const insurance_type = require('./models/insurance_type');
const Insurance_type = insurance_type(sequelize, Sequelize);
const insurance = require('./models/insurance');
const Insurance = insurance(sequelize, Sequelize);
const city = require('./models/city');
const City = city(sequelize, Sequelize);
const department = require('./models/department');
const Department = department(sequelize, Sequelize);
const client = require('./models/client');
const Client = client(sequelize, Sequelize);
Insurance_type.hasMany(Insurance, { foreignKey: 'insurance_type_id' });
Insurance.belongsTo(Insurance_type, { foreignKey: 'insurance_type_id' });
Insurer.hasMany(Insurance_type, { foreignKey: 'insurer_id' });
Insurance_type.belongsTo(Insurer, { foreignKey: 'insurer_id' });
Department.hasMany(Client, { foreignKey: 'department_id' });
Client.belongsTo(Department, { foreignKey: 'department_id' });
City.hasMany(Client, { foreignKey: 'city_id' });
Client.belongsTo(City, { foreignKey: 'city_id' });

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
 * Gets all insurances from the database
 */

router.get(`${VERSION}/insurance`, validateToken, (req, res) => {
    Insurance.findAll({
        attributes: {exclude: ['insurance_type_id']},
        include: [
            {
                model: Insurance_type,
                attributes: {exclude: ['insurer_id']},
                include: [
                    {
                        model: Insurer
                    }
                ]
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
 * Creates a new insurance
 */

router.post(`${VERSION}/insurance/new`, validateToken, (req, res) => {
    const {name, percentage_to_insure, min_to_insure, available, insurance_type_id} = req.body;
    Insurance.create({
        name,
        percentage_to_insure,
        min_to_insure,
        available,
        insurance_type_id
    })
    .then(({id}) => {
        Insurance.findOne({
            where: {id: id},
            attributes: {exclude: ['insurance_type_id']},
            include: [
                {
                    model: Insurance_type,
                    attributes: {exclude: ['insurer_id']},
                    include: [
                        {
                            model: Insurer
                        }
                    ]
                }
            ]
        })
        .then((data) => {
            res.json(data);
        })
    })
    .catch((err) => {
        res.status(400).json({
            error: `The information received is invalid or necessary information is missing.` ,
            status: 400
        });
    });
});

/**
 * Gets an insurance selected by its id.
 */

router.get(`${VERSION}/insurance/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    Insurance.findOne({where: {id: id},
        attributes: {exclude: ['insurance_type_id']},
        include: [
            {
                model: Insurance_type,
                attributes: {exclude: ['insurer_id']},
                include: [
                    {
                        model: Insurer
                    }
                ]
            }
        ]
    })
    .then((data) => {
        data ? res.json(data) : res.status(404).json({
            error: 'Insurance not found.',
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
 * Edit an insurance by its id
 */

router.put(`${VERSION}/insurance/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    const {name, percentage_to_insure, min_to_insure, available, insurance_type_id} = req.body;
    Insurance.update({
        name,
        percentage_to_insure,
        min_to_insure,
        available,
        insurance_type_id
    }, {where: {id: id}})
    .then(() => {
        Insurance.findOne({where:{id: id},
            attributes: {exclude: ['insurance_type_id']},
            include: [
                {
                    model: Insurance_type,
                    attributes: {exclude: ['insurer_id']},
                    include: [
                        {
                            model: Insurer
                        }
                    ]
                }
            ]
        })
        .then((data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({
                    error: 'Insurance not found.',
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
    })
    .catch((err) => {
        res.status(500).json({
            error: `A problem has occurred with the server: ${err}.`,
            status: 500
        });
    });
});

/**
 * Deletes an insurance
 */

router.delete(`${VERSION}/insurance/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    Insurance.findOne({where: {id: id}})
    .then((data) => {
        if (data) {
            Insurance.destroy({where: {id: id}})
            .then(() => {
                res.json({
                    message: 'Insurance deleted successfully.',
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
                error: 'Insurance not found.',
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

/**
 * Get clients from a insurance by its id
 */

router.get(`${VERSION}/insurance/:id/client`, validateToken, (req, res) => {
    const { id } = req.params;
    Insurance.findOne({
        where: { id: id },
    })
        .then((data) => {
            const { id } = data.dataValues;
            Client.findAll({
                where: { insurance_id: id },
                attributes: { exclude: ['insurance_id', 'department_id', 'city_id'] },
                include: [
                    {
                        model: Department
                    },
                    {
                        model: City,
                        attributes: {exclude: ['department_id']}
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
                })
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