const crypto = require("crypto-js");

const Medico = require("../models/Medicos.js");
const Paciente = require("../models/Pacientes.js");
const Cita = require("../models/Citas.js");
const Usuario = require("../models/Usuarios.js");
const Consultorio = require("../models/Consultorios.js");
const sequelize = require("../utils/database.util");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Especialidad = require("../models/Especialidades.js");

const medicoController = {};

const hashPassword = (password) => crypto.SHA256(password).toString();

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

    const disponible = await Consultorio.findOne({
      where: {
        consultorio: consultorio,
        disponible: true,
      },
    });

    if (!disponible) {
      return res.status(400).json({ message: "Consultorio ocupado" });
    }

    const especialidadID = await Especialidad.findOne({
      where: {
        especialidad: especialidad,
      },
      attributes: ["id"],
    });

    if (!especialidadID) {
      return res.status(400).json({ message: "Especialidad no encontrada" });
    }

    await Usuario.create(
      {
        correo: correo,
        tipo_usuario: 2,
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
        especialidad: especialidadID.id,
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

const fetchAppointmentDoctorInfo = async (consultorio) =>
  await Cita.findAll({
    attributes: ["nss", "id_horario", "id", "status"],
    include: [
      {
        model: HorarioConsultorio,
        where: {
          consultorio: consultorio,
          disponible: false,
        },
        attributes: ["fecha_hora_inicio", "fecha_hora_final"],
      },
      {
        model: Paciente,
        attributes: {
          exclude: ["nss", "metodo_pago", "telefono"],
        },
        include: {
          model: Usuario,
          attributes: ["nombre", "ap_paterno", "ap_materno"],
        },
      },
    ],
    order: [[HorarioConsultorio, "consultorio", "ASC"]],
  });

medicoController.showAppointment = async (req, res) => {
  try {
    const { consultorio } = req.body;

    const appointmentsInfo = await fetchAppointmentDoctorInfo(consultorio);

    const appointmentsInfoPatient = appointmentsInfo.map(
      ({
        nss,
        id,
        id_horario,
        status,
        HorarioConsultorio: { fecha_hora_inicio, fecha_hora_final },
        Paciente: {
          Usuario: { nombre, ap_paterno, ap_materno },
        },
      }) => {
        const paciente = nombre + " " + ap_paterno + " " + ap_materno;
        return {
          id,
          nss,
          paciente: paciente,
          fecha_hora_inicio,
          fecha_hora_final,
          id_horario,
          status,
        };
      }
    );

    return res.json(appointmentsInfoPatient);
  } catch (error) {
    console.log("Error al obtener citas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

module.exports = medicoController;
