module.exports = (sequelize, {DataTypes}) => {
    return sequelize.define('department', {
        name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [1, 100],
                    msg: 'Department must contain at least one characters.'
                }
            }
        }
    },{
        freezeTableName: true,
    })
}