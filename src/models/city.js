module.exports = (sequelize, {DataTypes}) => {
    return sequelize.define('city', {
        name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [1, 100],
                    msg: 'City must contain at least one characters.'
                }
            }
        }
    },{
        freezeTableName: true,
    })
}