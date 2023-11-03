const crypto = require("crypto-js");

const Medico = require("../models/Medicos.js");
const Paciente = require("../models/Pacientes.js");
const Cita = require("../models/Citas.js");
const Usuario = require("../models/Usuarios.js");
const Consultorio = require("../models/Consultorios.js");
const sequelize = require("../utils/database.util");

const medicoController = {};

const hashPassword = (password) => {
  try {
    return crypto.SHA256(password).toString();
  } catch (error) {
    console.log(error);
  }
};

medicoController.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      no_empleado,
      correo,
      especialidad,
      consultorio,
      telefono,
      nombre,
      ap_paterno,
      ap_materno,
      password,
    } = req.body;

    await Usuario.create(
      {
        correo: correo,
        tipo_usuario: "Medico",
        nombre: nombre,
        ap_paterno: ap_paterno,
        ap_materno: ap_materno,
        password: hashPassword(password),
      },
      { transaction: t }
    );

    await Medico.create(
      {
        no_empleado: no_empleado,
        correo: correo,
        especialidad: especialidad,
        consultorio: consultorio,
        telefono: telefono,
      },
      { transaction: t }
    );

    await Consultorio.update(
      { disponible: 0 },
      {
        where: { consultorio: consultorio },
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Médico dado de alta" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

medicoController.showAppointment = async (req, res) => {
  try {
    const { no_empleado } = req.body;

    const citas_medico = await Cita.findAll({
      where: {
        no_empleado: no_empleado,
      },
      order: [["fecha_hora_inicio", "ASC"]],
      attributes: ["id", "fecha_hora_inicio", "fecha_hora_final", "nss"],
    });

    const nssPacientesUnicos = Array.from(
      new Set(citas_medico.map(({ nss }) => nss))
    );

    const pacientes = await Paciente.findAll({
      where: {
        nss: nssPacientesUnicos,
      },
      attributes: ["nss"],
      include: {
        model: Usuario,
        attributes: ["nombre", "ap_paterno", "ap_materno"],
      },
    });

    const pacientesMap = {};
    pacientes.forEach(
      ({ nss, Usuario: { nombre, ap_paterno, ap_materno } }) => {
        pacientesMap[nss] = { nombre, ap_paterno, ap_materno };
      }
    );

    const citasFormateadas = citas_medico.map((cita) => {
      const { id, fecha_hora_inicio, fecha_hora_final, nss } = cita;
      const { nombre, ap_paterno, ap_materno } = pacientesMap[nss];

      return {
        id,
        nss,
        paciente: nombre + " " + ap_paterno + " " + ap_materno,
        fecha_hora_inicio,
        fecha_hora_final,
      };
    });

    return res.json(citasFormateadas);
  } catch (error) {
    console.log("Error al obtener citas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

module.exports = medicoController;
