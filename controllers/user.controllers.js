const crypto = require("crypto-js");

const Usuario = require("../models/Usuarios.js");
const Paciente = require("../models/Pacientes.js");
const Medico = require("../models/Medicos.js");
const Recepcionista = require("../models/Recepcionistas.js");
const sequelize = require("../utils/database.util");

const userController = {};

const hashPassword = (password) => {
  try {
    return crypto.SHA256(password).toString();
  } catch (error) {
    console.log(error);
  }
};

userController.getConnection = async (req, res) => {
  try {
    console.log(process.env.HOST);
    console.log(process.env.DATABASE);
    console.log(process.env.Usuario);
    console.log(process.env.PASSWORD);
    await sequelize.authenticate();

    return res.json({ message: "Conexión exitosa" });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

userController.loginUser = async (req, res) => {
  const { correo, password, typeUser } = req.body;
  try {
    const user = await Usuario.findOne({
      where: { correo: correo },
      attributes: ["nombre", "ap_paterno", "ap_materno", "password", "fecha_fin"],
    });

    if (!user) {
      return res.status(400).json({ message: "Registrate por favor" });
    }

    const isMatch = user.password === hashPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

  //Falta implementar la validación de la fecha. En el proximo commit lo hago    

    if (typeUser === "patient") {
      const dataUser = await Paciente.findOne({
        where: { correo: correo },
        attributes: { exclude: ["correo"] },
      });

      delete user.dataValues.password;

      return res.json({ ...user.dataValues, ...dataUser.dataValues });
    } else if (typeUser === "doctor") {
      const dataUser = await Medico.findOne({
        where: { correo: correo },
        attributes: { exclude: ["correo"] },
      });

      delete user.dataValues.password;

      return res.json({ ...user.dataValues, ...dataUser.dataValues });
    } else {
      const dataUser = await Recepcionista.findOne({
        where: { correo: correo },
        attributes: { exclude: ["correo"] },
      });

      delete user.dataValues.password;

      return res.json({ ...user.dataValues, ...dataUser.dataValues });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = userController;
