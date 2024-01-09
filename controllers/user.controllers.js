const crypto = require("crypto-js");

const Usuario = require("../models/Usuarios.js");
const Paciente = require("../models/Pacientes.js");
const Medico = require("../models/Medicos.js");
const Recepcionista = require("../models/Recepcionistas.js");
const Especialidad = require("../models/Especialidades.js");
const sequelize = require("../utils/database.util");
const TipoUsuario = require("../models/TipoUsuarios.js");

const userController = {};

const hashPassword = (password) => crypto.SHA256(password).toString();

userController.getConnection = async (req, res) => {
  try {
    console.log(process.env.HOST);
    console.log(process.env.DATABASE);
    console.log(process.env.Usuario);
    console.log(process.env.PASSWORD);
    await sequelize.authenticate();

    return res.json({ message: "Conexión exitosa" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

userController.loginUser = async (req, res) => {
  const { correo, password } = req.body;
  try {
    const user = await Usuario.findByPk(correo, {
      attributes: ["password", "fecha_fin", "tipo_usuario"],
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const isMatch = user.password === hashPassword(password);

    if (user.fecha_fin) {
      return res.status(401).json({ message: "Usuario dado de baja" });
    } else if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const { tipo_usuario } = (
      await TipoUsuario.findOne({
        where: {
          id: user.tipo_usuario,
        },
      })
    ).toJSON();

    return res.json({ typeUser: tipo_usuario, isLogged: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

userController.getInformation = async (req, res) => {
  const { correo, tipo_usuario } = req.body;
  try {
    const userModels = {
      Paciente: Paciente,
      Medico: Medico,
      Recepcionista: Recepcionista,
    };

    const typeUser = userModels[tipo_usuario];

    let user = {};

    if (tipo_usuario === "Medico") {
      user = (
        await Medico.findOne({
          where: {
            correo: correo,
          },
          attributes: { exclude: ["correo"] },
          include: [
            {
              model: Usuario,
              attributes: {
                exclude: ["correo", "password", "fecha_fin"],
              },
            },
            {
              model: Especialidad,
              attributes: ["especialidad"],
            },
          ],
        })
      ).toJSON();
    } else {
      user = (
        await typeUser.findOne({
          where: {
            correo: correo,
          },
          attributes: { exclude: ["correo"] },
          include: [
            {
              model: Usuario,
              attributes: {
                exclude: ["correo", "password", "fecha_fin"],
              },
            },
          ],
        })
      ).toJSON();
    }

    const {
      Usuario: { nombre, ap_paterno, ap_materno },
    } = user;
    user.nombreCompleto = nombre + " " + ap_paterno + " " + ap_materno;
    delete user.Usuario;

    if (tipo_usuario === "Medico") {
      const {
        Especialidad: { especialidad },
      } = user;
      user.especialidad = especialidad;
      delete user.Especialidad;
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    return res.status(500).json({ message: error });
  }
};

userController.deletePatient = async (req, res) => {
  const { nss } = req.body;
  const t = await sequelize.transaction();
  try {
    const patient = await Paciente.findByPk(nss);

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
    return res.status(500).json({ message: error });
  }
};

module.exports = userController;
