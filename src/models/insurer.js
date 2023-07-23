module.exports = (sequelize, {DataTypes}) => {
    return sequelize.define('insurer', {
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
        nit : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 255],
                    msg: 'NIT must contain at least five characters.'
                }
            }
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
        available: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },{
        freezeTableName: true,
    })
}