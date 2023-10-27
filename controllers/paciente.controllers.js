const crypto = require("crypto-js");
const Paciente = require("../models/Pacientes.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");

const sequelize = require("../utils/database.util");

const pacienteController = {};

const hashPassword = (password) => {
  try {
    return crypto.SHA256(password).toString();
  } catch (error) {
    console.log(error);
  }
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
};

const isOnTime = (date) => {
  const oneDayAgo = new Date();
  date.setHours(date.getHours() - 24);
  return new Date(date) > oneDayAgo;
};

pacienteController.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      nss,
      correo,
      telefono,
      nombre,
      ap_paterno,
      ap_materno,
      password,
      metodo_pago,
    } = req.body;

    await Usuario.create(
      {
        correo: correo,
        tipo_usuario: "Paciente",
        nombre: nombre,
        ap_paterno: ap_paterno,
        ap_materno: ap_materno,
        password: hashPassword(password),
      },
      { transaction: t }
    );

    await Paciente.create(
      {
        nss: nss,
        correo: correo,
        telefono: telefono,
        metodo_pago: metodo_pago,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Paciente dado de alta" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

pacienteController.showAppointment = async (req, res) => {
  try {
    const { nss } = req.body;

    const citas_paciente = await Cita.findAll({
      where: {
        nss: nss,
      },
    });

    const noEmpleadosUnicos = Array.from(
      new Set(citas_paciente.map((cita) => cita.no_empleado))
    );

    const medicos = await Medico.findAll({
      where: {
        no_empleado: noEmpleadosUnicos,
      },
      attributes: ["no_empleado", "consultorio", "especialidad"],
      include: {
        model: Usuario,
        attributes: ["nombre", "ap_paterno", "ap_materno"],
      },
    });

    const medicosMap = {};
    medicos.forEach((medico) => {
      medicosMap[medico.no_empleado] = medico;
    });

    const citasFormateadas = citas_paciente.map((cita) => {
      const { id, fecha_hora_inicio, fecha_hora_final, no_empleado } = cita;

      const medico = medicosMap[no_empleado];
      const { nombre, ap_paterno, ap_materno } = medico.Usuario;

      return {
        id,
        medico: nombre + " " + ap_paterno + " " + ap_materno,
        fecha_hora_inicio: fecha_hora_inicio,
        fecha_hora_final: fecha_hora_final,
        onTime: isOnTime(fecha_hora_inicio),
      };
    });

    return res.json(citasFormateadas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = pacienteController;
