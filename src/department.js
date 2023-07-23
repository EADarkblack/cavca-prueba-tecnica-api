// Dependencies

const router = require('express').Router();
const { PORT, SERVER, USER, VERSION, PASSWORD, DB_NAME } = process.env;
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(`mysql://${USER}:${PASSWORD}@${SERVER}:${PORT}/${DB_NAME}`);

// Models

const department = require('./models/department');
const Department = department(sequelize, Sequelize);
const city = require('./models/city');
const City = city(sequelize, Sequelize);
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
 * Allows to get all departments from the database
 */

router.get(`${VERSION}/department`, validateToken, (req, res) => {
    Department.findAll({
        include: [{
            model: City,
            attributes: { exclude: ['department_id'] }
        }]
    })
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({
                error: `A problem has occurred with the server: ${err}.`,
                status: 500
            });
        });
});

/**
 * Allows to create a new department in the database
 */

router.post(`${VERSION}/department/new`, validateToken, (req, res) => {
    const { name } = req.body;
    Department.create({
        name
    })
        .then((data) => {
            const {id} = data.dataValues;
            Department.findOne({ where: { id: id } },)
                .then((data) => {
                    const { id, name, createdAt, updatedAt } = data.dataValues;
                    res.json({
                        id,
                        name,
                        createdAt,
                        updatedAt,
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        error: `A problem has occurred with the server: ${err}.`,
                        status: 500
                    });
                });
        })
        .catch(() => {
            res.status(400).json({
                error: 'The information received is invalid or necessary information is missing.',
                status: 400
            })
        });
});

/**
 * Allows to get a specific department from the database using its id
 */

router.get(`${VERSION}/department/:id`, validateToken, (req, res) => {
    const { id } = req.params;
    Department.findOne({
        where: { id: id }
    })
        .then((data) => {
            data ? res.json(data) : res.status(404).json({
                error: 'Department not found.',
                status: 404
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
 * Allows to update a specific department in the database using its id
 */

router.put(`${VERSION}/department/:id`, validateToken, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    Department.update({
        name
    }, { where: { id: id } })
        .then(() => {
            Department.findOne({ where: { id: id } })
                .then((data) => {
                    const { id, name, createdAt, updatedAt } = data.dataValues;
                    res.json({
                        id,
                        name,
                        createdAt,
                        updatedAt
                    });
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
 * Allows to delete a specific department from the database using its id
 */

router.delete(`${VERSION}/department/:id`, validateToken, (req, res) => {
    const { id } = req.params;
    Department.findOne({ where: { id: id } })
        .then((data) => {
            if (data) {
                Department.destroy({ where: { id: id } })
                    .then(() => {
                        City.findAll({ where: { department_id: null } })
                            .then((data) => {
                                data.forEach(({ id }) => {
                                    City.destroy(({ where: { id: id } }))
                                        .then(() => {
                                            console.log("Cities deleted successfully.");
                                        })
                                        .catch((err) => {
                                            res.status(500).json({
                                                error: `A problem has occurred with the server: ${err}.`,
                                                status: 500
                                            });
                                        });
                                });
                            })
                            .catch((err) => {
                                res.status(500).json({
                                    error: `A problem has occurred with the server: ${err}.`,
                                    status: 500
                                });
                            });
                        res.json({
                            message: 'Department deleted successfully.',
                            status: 200
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            error: `A problem has occurred with the server: ${err}.`,
                            status: 500
                        });
                    });
            } else {
                res.status(404).json({
                    error: 'Department not found.',
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
 * Get cities from a department by its id / id = id_city
 */

router.get(`${VERSION}/department/:id/city`, validateToken, (req, res) => {
    const { id } = req.params;
    Department.findOne({
        where: { id: id },
    })
        .then((data) => {
            const { id } = data.dataValues;
            City.findAll({
                where: { department_id: id },
                attributes: { exclude: ['department_id'] },
            })
                .then((data) => {
                    data ? res.json(data) : res.status(404).json({
                        error: 'City not found.',
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