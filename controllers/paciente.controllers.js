const crypto = require("crypto-js");

const Paciente = require("../models/Pacientes.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Consultorio = require("../models/Consultorios.js");
const { isOnTime } = require("../utils/appointment.util.js");

const sequelize = require("../utils/database.util");
const Especialidad = require("../models/Especialidades.js");

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

const fetchAppointmentsPatient = async (nss) =>
  await Cita.findAll({
    attributes: ["id", "id_horario", "status"],
    where: {
      nss: nss,
    },
    include: {
      model: HorarioConsultorio,
      attributes: ["consultorio", "fecha_hora_inicio", "fecha_hora_final"],
      include: {
        model: Consultorio,
        attributes: {
          exclude: ["disponible"],
        },
        include: {
          model: Medico,
          attributes: ["especialidad"],
          include: [
            {
              model: Usuario,
              attributes: ["nombre", "ap_paterno", "ap_materno"],
            },
            {
              model: Especialidad,
              attributes: ["especialidad"],
            },
          ],
        },
      },
    },
    order: [
      [HorarioConsultorio, "fecha_hora_inicio", "ASC"],
      [HorarioConsultorio, "consultorio", "ASC"],
    ],
  });

pacienteController.showAppointment = async (req, res) => {
  try {
    const { nss } = req.body;
    const appointmentsPatient = await fetchAppointmentsPatient(nss);
    const appointmentsInfoPatient = appointmentsPatient.map(
      ({
        id,
        id_horario,
        status,
        HorarioConsultorio: {
          fecha_hora_inicio,
          fecha_hora_final,
          Consultorio: {
            consultorio: consultorio,
            Medico: {
              Especialidad: { especialidad },
              Usuario: {
                nombre: nombre,
                ap_paterno: ap_paterno,
                ap_materno: ap_materno,
              },
            },
          },
        },
      }) => {
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
      }
    );
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
