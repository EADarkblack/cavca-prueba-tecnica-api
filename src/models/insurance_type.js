module.exports = (sequelize, {DataTypes}) => {
    return sequelize.define('insurance_type', {
        name : {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'Name must contain at least one character.'
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