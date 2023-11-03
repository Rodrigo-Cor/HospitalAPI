const crypto = require("crypto-js");

const Medico = require("../models/Medicos.js");
const Paciente = require("../models/Pacientes.js");
const Cita = require("../models/Citas.js");
const Usuario = require("../models/Usuarios.js");
const Consultorio = require("../models/Consultorios.js");
const sequelize = require("../utils/database.util");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");

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

const fetchAppointmentInfo = async (consultorio) =>
  await Cita.findAll({
    attributes: ["nss", "id_horario", "id"],
    include: {
      model: HorarioConsultorio,
      where: {
        consultorio: consultorio,
        disponible: false,
      },
      attributes: ["fecha_hora_inicio", "fecha_hora_final"],
      order: [["fecha_hora_inicio", "ASC"]],
    },
  });

const fetchPatientInfo = async (nssPatients) =>
  await Paciente.findAll({
    where: {
      nss: nssPatients,
    },
    attributes: ["nss"],
    include: {
      model: Usuario,
      attributes: ["nombre", "ap_paterno", "ap_materno"],
    },
  });

medicoController.showAppointment = async (req, res) => {
  try {
    const { consultorio } = req.body;

    const appointmentsInfo = await fetchAppointmentInfo(consultorio);

    const nssPatients = Array.from(
      new Set(appointmentsInfo.map(({ nss }) => nss))
    );

    const patientsInfo = await fetchPatientInfo(nssPatients);

    const patientsMap = {};
    patientsInfo.forEach(
      ({ nss, Usuario: { nombre, ap_paterno, ap_materno } }) => {
        patientsMap[nss] = { nombre, ap_paterno, ap_materno };
      }
    );

    const appointmentsInfoPatient = appointmentsInfo.map((appointment) => {
      const {
        id,
        nss,
        id_horario,
        HorariosConsultorio: { fecha_hora_inicio, fecha_hora_final },
      } = appointment;
      const { nombre, ap_paterno, ap_materno } = patientsMap[nss];

      return {
        id,
        nss,
        paciente: nombre + " " + ap_paterno + " " + ap_materno,
        fecha_hora_inicio,
        fecha_hora_final,
        id_horario,
      };
    });

    return res.json(appointmentsInfoPatient);
  } catch (error) {
    console.log("Error al obtener citas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

module.exports = medicoController;
