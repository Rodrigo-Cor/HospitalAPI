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

userController.getInformation = async (req, res) => {
  const { correo, typeUser } = req.body;
  try {
    const userModels = {
      patient: Paciente,
      doctor: Medico,
      recepcionist: Recepcionista,
    };

    const userModel = userModels[typeUser];
    const user = (
      await userModel.findOne({
        where: {
          correo: correo,
        },
        attributes: { exclude: ["correo"] },
        include: [
          {
            model: Usuario,
            attributes: {
              exclude: ["correo", "tipo_usuario", "password", "fecha_fin"],
            },
          },
        ],
      })
    ).toJSON();

    const {
      Usuario: { nombre, ap_paterno, ap_materno },
    } = user;
    user.nombreCompleto = nombre + " " + ap_paterno + " " + ap_materno;
    delete user.Usuario;

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

userController.deletePatient = async (req, res) => {
  const { nss } = req.body;
  const t = await sequelize.transaction();
  try {
    const patient = await Paciente.findByPk(nss);
    //console.log(JSON.parse(JSON.stringify(patient)));

    await Paciente.destroy({
      where: {
        nss: nss,
      },
      transaction: t,
      individualHooks: true,
    });

    await Usuario.destroy({
      where: {
        correo: patient.correo,
      },
      transaction: t,
      individualHooks: true,
    });

    await t.commit();
    return res.json({ message: "Paciente eliminado del sistema" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ message: "Ocurrio un error" });
  }
};

userController.modifyPassword = async (req, res) => {
  const { correo } = req.body;
  try {
    const user = await Usuario.findByPk(correo);

    const newPassword = hashPassword(user.password);
    await Usuario.update(
      {
        password: newPassword,
      },
      {
        where: {
          correo: correo,
        },
        individualHooks: true,
      }
    );
    return res.json({ message: "Contraseña modificada" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ocurrio un error" });
  }
};

userController.loginUser = async (req, res) => {
  const { correo, password } = req.body;
  try {
    const hashingPassword = hashPassword(password);

    const user = await Usuario.findByPk(correo, {
      attributes: ["password", "fecha_fin"],
    });

    if (!user) {
      return res.status(400).json({ message: "Registrate por favor" });
    }

    const isMatch = user.password === hashingPassword;

    if (user.fecha_fin) {
      return res.status(401).json({ message: "Usuario inactivo" });
    } else if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    return res.json({ message: "Usuario loggueado" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = userController;
