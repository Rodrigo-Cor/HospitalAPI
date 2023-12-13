const { DataTypes } = require("sequelize");
const Receta = require("./Recetas");
const Tratamiento = require("./Tratamientos");
const sequelize = require("../utils/database.util");

const RecetaTratamiento = sequelize.define(
    "RecetaTratamiento",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_receta: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Recetas",
                key: "id",
            },
        },
        id_tratamiento: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Tratamientos",
                key: "id",
            },
        },
    },
    {
        timestamps: false,
        tableName: "recetas_tratamientos",
    }
);

RecetaTratamiento.hasOne(Tratamiento, {
    foreignKey: "id",
    sourceKey: "id_tratamiento",
    targetKey: "id",
});


module.exports = RecetaTratamiento;