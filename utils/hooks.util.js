const sequelize = require("./database.util");
const { Sequelize } = require("sequelize");
const Bitacora = require("../models/Bitacoras");

const getServerUser = async () => {
  const currenteUser = await sequelize.query("SELECT SUSER_NAME() AS usuario", {
    type: Sequelize.QueryTypes.SELECT,
  });

  const server = await sequelize.query("SELECT @@SERVERNAME AS servidor", {
    type: Sequelize.QueryTypes.SELECT,
  });
  return {
    user: currenteUser[0].usuario,
    server: server[0].servidor,
  };
};

const hookInsertDeleteAfter = async ({ PK, type, user, server, table }) => {
  console.log(PK, type, user, server, table);
  await Bitacora.create({
    tabla: table,
    operacion: type,
    usuario: user,
    servidor: server,
    PK: PK,
  });
};

const getPreviousCurrentValues = ({ table }) => {
  return {
    previousValues: table.previous(),
    currentValues: table.dataValues,
  };
};

module.exports = {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
};
