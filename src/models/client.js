module.exports = (sequelize, {DataTypes}) => {
    return sequelize.define('client', {
        name : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'Name must contain at least one character.'
                }
            }
        },
        last_name : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'Last name must contain at least one character.'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [6, 255],
                    msg: 'Email must contain at least six characters.'
                },
                isEmail: {
                    args: true,
                    msg: 'A valid email address is required.'
                }
            }
        },
        client_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 255],
                    msg: 'Client type must contain at least five characters.'
                }
            }
        },
        dni_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 255],
                    msg: 'Dni type must contain at least five characters.'
                }
            }
        },
        dni_number: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 255],
                    msg: 'Dni number must contain at least five characters.'
                }
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [6, 25],
                    msg: 'Phone must contain at least six characters.'
                }
            }
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [6, 255],
                    msg: 'Address must contain at least six characters.'
                }
            }
        },
        insured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        value_to_insure: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        insured_value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },{
        freezeTableName: true,
    })
}