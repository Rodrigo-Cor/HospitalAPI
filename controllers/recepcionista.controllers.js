const crypto = require("crypto-js");

const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Recepcionista = require("../models/Recepcionistas.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");

const sequelize = require("../utils/database.util");

const recepcionistaController = {};

const hashPassword = (password) => {
  try {
    return crypto.SHA256(password).toString();
  } catch (error) {
    console.log(error);
  }
};

recepcionistaController.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { no_empleado, correo, nombre, ap_paterno, ap_materno, password } =
      req.body;

    await Usuario.create(
      {
        correo: correo,
        tipo_usuario: "Recepcionista",
        nombre: nombre,
        ap_paterno: ap_paterno,
        ap_materno: ap_materno,
        password: hashPassword(password),
      },
      { transaction: t }
    );

    await Recepcionista.create(
      {
        no_empleado: no_empleado,
        correo: correo,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Recepionista dado de alta" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.setSchedule = async (req, res) => {
  try {
    const { consultorio, fecha_hora_inicio, fecha_hora_final } = req.body;
    console.log(fecha_hora_inicio);
    console.log(fecha_hora_final);

    await HorarioConsultorio.create({
      consultorio: consultorio,
      fecha_hora_inicio: fecha_hora_inicio,
      fecha_hora_final: fecha_hora_final,
    });

    /*
    const horariosConsultorio = await HorarioConsultorio.findAll({
      where: {
        fecha_hora_inicio: fecha_hora_inicio,
        fecha_hora_final: fecha_hora_final,
      },
    });
    return res.json(horariosConsultorio);
    */

    return res
      .status(201)
      .json({ message: "Horario del consultorio registrado" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.getPatientsPaid = async (req, res) => {
  try {
    const { consultorio } = req.body;

    const citas = await Cita.findAll();

    const citasporCobrar = citas.map((cita) => {
      const timeCheck = new Date(cita.fecha_hora_inicio);
      timeCheck.setHours(cita.fecha_hora_inicio.getHours() - 24);
      console.log(timeCheck);
      return {
        hora_cita: cita.fecha_hora_inicio,
        onTime: timeCheck < new Date() ? "Cobro" : "No cobrar",
      };
    });

    return res.json(citasporCobrar);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = recepcionistaController;
