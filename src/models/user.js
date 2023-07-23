module.exports = (sequelize, {DataTypes}) => {
    return sequelize.define('user', {
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
        is_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [8, 200],
                    msg: 'Password must contain at least eigth characters.'
                }
            }
        }
    }, {
        freezeTableName: true
    })
}