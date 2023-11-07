const crypto = require("crypto-js");

const Paciente = require("../models/Pacientes.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");

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
  const auxDate = new Date(date);
  auxDate.setHours(auxDate.getHours() - 24);
  return new Date(auxDate) > oneDayAgo;
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

const fetchAppointmentsPatients = async (nss) => {
  return await Cita.findAll({
    where: {
      nss: nss,
    },
    attributes: ["id", "id_horario", "status"],
    include: {
      model: HorarioConsultorio,
      attributes: ["fecha_hora_inicio", "fecha_hora_final", "consultorio"],
      order: [["fecha_hora_inicio", "ASC"]],
    },
  });
};

const fetchDoctorsWithConsultorios = async (consultoriosUnicos) => {
  return await Medico.findAll({
    where: {
      consultorio: consultoriosUnicos,
    },
    attributes: ["especialidad", "consultorio"],
    include: {
      model: Usuario,
      attributes: ["nombre", "ap_paterno", "ap_materno"],
    },
  });
};

pacienteController.showAppointment = async (req, res) => {
  try {
    const { nss } = req.body;

    const appointmentsPatient = await fetchAppointmentsPatients(nss);

    const consultoriosUnicos = Array.from(
      new Set(
        appointmentsPatient.map(
          ({ HorariosConsultorio: { consultorio } }) => consultorio
        )
      )
    );

    const doctorsInfo = await fetchDoctorsWithConsultorios(consultoriosUnicos);

    const medicosMap = {};
    doctorsInfo.forEach(
      ({
        consultorio,
        especialidad,
        Usuario: { nombre, ap_paterno, ap_materno },
      }) => {
        medicosMap[consultorio] = {
          consultorio,
          especialidad,
          nombre,
          ap_paterno,
          ap_materno,
        };
      }
    );

    const appointmentsInfoPatient = appointmentsPatient.map((appointment) => {
      const {
        id,
        id_horario,
        status,
        HorariosConsultorio: {
          consultorio,
          fecha_hora_inicio,
          fecha_hora_final,
        },
      } = appointment;

      const { especialidad, nombre, ap_paterno, ap_materno } =
        medicosMap[consultorio];
      return {
        id,
        id_horario,
        medico: nombre + " " + ap_paterno + " " + ap_materno,
        consultorio,
        especialidad,
        fecha_hora_inicio,
        fecha_hora_final,
        onTime: isOnTime(fecha_hora_inicio),
        status,
      };
    });

    return res.json(appointmentsInfoPatient);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

pacienteController.deleteAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, id_horario } = req.body;
    await Cita.update(
      {
        status: 2,
      },
      {
        where: {
          id: id,
        },
      },
      { transaction: t }
    );

    await HorarioConsultorio.update(
      {
        disponible: 1,
      },
      {
        where: {
          id: id_horario,
        },
      },
      { transaction: t }
    );
    await t.commit();
    return res.json({ message: "Se ha cancelado su cita" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

module.exports = pacienteController;
