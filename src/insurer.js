const router = require('express').Router();
const {PORT, SERVER, USER, VERSION, PASSWORD, DB_NAME, KEY} = process.env;
const {Sequelize, where} = require('sequelize');
const sequelize = new Sequelize(`mysql://${USER}:${PASSWORD}@${SERVER}:${PORT}/${DB_NAME}`)

//Models
const insurer = require('./models/insurer');
const Insurer = insurer(sequelize, Sequelize);
const city = require('./models/city');
const City = city(sequelize, Sequelize);
const department = require('./models/department');
const Department = department(sequelize, Sequelize);
const insurance_type = require('./models/insurance_type');
const Insurance_type = insurance_type(sequelize, Sequelize);
Department.hasMany(Insurer, { foreignKey: 'department_id' });
Insurer.belongsTo(Department, { foreignKey: 'department_id' });
City.hasMany(Insurer, { foreignKey: 'city_id' });
Insurer.belongsTo(City, { foreignKey: 'city_id' });
Insurer.hasMany(Insurance_type, { foreignKey: 'insurer_id' });
Insurance_type.belongsTo(Insurer, { foreignKey: 'insurer_id' });
Department.hasMany(City, { foreignKey: 'department_id' });
City.belongsTo(Department, { foreignKey: 'department_id' });

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
 * Gets all insurers from the database
 */

router.get(`${VERSION}/insurer`, validateToken, (req, res) => {
    Insurer.findAll({
        attributes: {exclude: ['department_id', 'city_id']},
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
 * Creates an new insurer
 */

router.post(`${VERSION}/insurer/new`, validateToken, (req, res) => {
    const {name, nit, address, email, phone, available, department_id, city_id} = req.body;
    Insurer.create({
        name, 
        nit,
        address,
        email,
        phone,
        available,
        department_id,
        city_id
    })
    .then(({id}) => {
        Insurer.findOne({
            where: {id: id},
            attributes: {exclude: ['department_id', 'city_id']},
            include: [
                {
                    model: Department,

                },
                {
                    model: City,
                    attributes: {exclude: ['department_id']}
                }
            ]
        })
        .then((data) => {
            res.json(data);
        })
    })
    .catch((err) => {
        console.log(err);
        res.status(400).json({
            error: `The information received is invalid or necessary information is missing.` ,
            status: 400
        });
    });
});

/**
 * Returns an insurer selected by its id.
 */

router.get(`${VERSION}/insurer/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    Insurer.findOne({where: {id: id},
        attributes: {exclude: ['department_id', 'city_id']},
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
            error: 'Insurer not found.',
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
 * Edit an insurer by its id
 */

router.put(`${VERSION}/insurer/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    const {name, nit, address, email, phone, available, department_id, city_id} = req.body;
    Insurer.update({
        name, 
        nit,
        address,
        email,
        phone,
        available,
        department_id,
        city_id
    }, {where: {id: id}})
    .then(() => {
        Insurer.findOne({where:{id: id},
            attributes: {exclude: ['department_id', 'city_id']},
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
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({
                    error: 'Insurer not found.',
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
 * Deletes an insurer
 */

router.delete(`${VERSION}/insurer/:id`, validateToken, (req, res) => {
    const {id} = req.params;
    Insurer.findOne({where: {id: id}})
    .then((data) => {
        if (data) {
            Insurer.destroy({where: {id: id}})
            .then(() => {
                res.json({
                    message: 'Insurer deleted successfully.',
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
                error: 'Insurer not found.',
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
 * Get insurances type from a insurer by its id / id = id_city
 */

router.get(`${VERSION}/insurer/:id/insurancetype`, validateToken, (req, res) => {
    const { id } = req.params;
    Insurer.findOne({
        where: { id: id },
    })
        .then((data) => {
            const { id } = data.dataValues;
            Insurance_type.findAll({
                where: { insurer_id: id },
                attributes: { exclude: ['insurer_id'] }
            })
                .then((data) => {
                    data ? res.json(data) : res.status(404).json({
                        error: 'Insurance type not found.',
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