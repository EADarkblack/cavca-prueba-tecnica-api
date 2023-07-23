module.exports = (sequelize, {DataTypes}) => {
    return sequelize.define('insurance', {
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
        percentage_to_insure: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        min_to_insure: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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