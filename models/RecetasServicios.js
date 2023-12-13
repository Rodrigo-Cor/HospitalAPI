const { DataTypes } = require("sequelize");
const Receta = require("./Recetas");
const Medicamento = require("./Medicamentos");
const Servicio = require("./Servicios");
const sequelize = require("../utils/database.util");

const RecetaServicio = sequelize.define(
    "RecetaServicio",
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
        id_servicio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Servicios",
                key: "id",
            },
        },
        cantidad_servicios: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
    },
    {
        timestamps: false,
        tableName: "recetas_servicios",
    }
);

RecetaServicio.hasOne(Servicio, {
    foreignKey: "id",
    sourceKey: "id_servicio",
    targetKey: "id",
});


module.exports = RecetaServicio;