const crypto = require("crypto-js");

const sequelize = require("../utils/database.util");
const Paciente = require("../models/Pacientes.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Consultorio = require("../models/Consultorios.js");
const Especialidad = require("../models/Especialidades.js");

const { isOnTime } = require("../utils/appointment.util.js");
const { fetchAppointmentsPatient } = require("../services/patientService.js");

const pacienteController = {};

const hashPassword = (password) => crypto.SHA256(password).toString();

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

    const user = await Usuario.findByPk(correo);

    if (user) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    await Usuario.create(
      {
        correo: correo,
        tipo_usuario: 1,
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
    const appointmentsPatient = await fetchAppointmentsPatient(nss);

    const appointmentsInfoPatient = appointmentsPatient.map(
      ({
        id,
        status,
        HorarioConsultorio: {
          fecha_hora_inicio,
          fecha_hora_final,
          Medico: {
            consultorio,
            Especialidad: { especialidad },
            Usuario: { nombre, ap_paterno, ap_materno },
          },
        },
      }) => ({
        id,
        medico: nombre + " " + ap_paterno + " " + ap_materno,
        consultorio,
        especialidad,
        fecha_hora_inicio,
        fecha_hora_final,
        onTime: isOnTime(fecha_hora_inicio),
        status,
      })
    );
    return res.send(appointmentsInfoPatient);
  } catch (error) {
    return res.status(500).send({ message: error.message });
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
