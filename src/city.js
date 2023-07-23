// Dependencies

const router = require('express').Router();
const { PORT, SERVER, USER, VERSION, PASSWORD, DB_NAME } = process.env;
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(`mysql://${USER}:${PASSWORD}@${SERVER}:${PORT}/${DB_NAME}`);

// Models

const city = require('./models/city');
const City = city(sequelize, Sequelize);
const department = require('./models/department');
const Department = department(sequelize, Sequelize);
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
 * Gets all cities from the database
 */

router.get(`${VERSION}/city`, validateToken, (req, res) => {
    City.findAll({
        attributes: { exclude: ['department_id'] },
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
 * Endpoint to create a new city in the database
 */

router.post(`${VERSION}/city/new`, validateToken, (req, res) => {
    const { name, department_id } = req.body;
    City.create({
        name,
        department_id
    })
        .then((data) => {
            const { id } = data.dataValues;
            City.findOne({ where: { id: id } })
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
 * Allows to get a specific city from the database using its id
 */

router.get(`${VERSION}/city/:id`, validateToken, (req, res) => {
    const { id } = req.params;
    City.findOne({
        where: { id: id },
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
});

/**
 * Allows to update a specific city in the database
 */

router.put(`${VERSION}/city/:id`, validateToken, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    City.update({
        name
    }, { where: { id: id } })
        .then(() => {
            City.findOne({ where: { id: id } })
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
 * Allows to delete a specific city from the database
 */

router.delete(`${VERSION}/city/:id`, validateToken, (req, res) => {
    const { id } = req.params;
    City.findOne({ where: { id: id } })
        .then((data) => {
            if (data) {
                City.destroy({ where: { id: id } })
                    .then(() => {
                        res.json({
                            message: 'City deleted successfully.',
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
                    error: 'City not found.',
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