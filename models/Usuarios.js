const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const TipoUsuario = require("./TipoUsuarios");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");
const Bitacora = require("./Bitacoras");

const Usuario = sequelize.define(
  "Usuario",
  {
    correo: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    tipo_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "TipoUsuario",
        key: "tipo_usuario",
      },
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ap_paterno: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ap_materno: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "usuarios",
    hooks: {
      afterCreate: async (usuario, options) => {
        const correo = usuario.dataValues["correo"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: correo,
          type: "INSERT",
          user,
          server,
          table: "usuarios",
        });
      },
      afterUpdate: async (usuario, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: usuario,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (field === "fecha_fin") {
            newValue = new Date(newValue).toISOString();
          }
          
          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "usuarios",
              operacion: "UPDATE",
              campo: field,
              valor: previousValue,
              valor_nuevo: newValue,
              usuario: user,
              servidor: server,
              PK: currentValues["correo"],
            });
          }
        }
      },
      afterDestroy: async (usuario, options) => {
        const correo = usuario.dataValues["correo"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: correo,
          type: "DELETE",
          user,
          server,
          table: "usuarios",
        });
      },
    },
  }
);

Usuario.hasOne(TipoUsuario, {
  foreignKey: "tipo_usuario",
  sourceKey: "tipo_usuario",
  targetKey: "tipo_usuario",
});

module.exports = Usuario;
