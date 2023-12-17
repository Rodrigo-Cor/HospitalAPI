const crypto = require("crypto-js");

const Medico = require("../models/Medicos.js");
const Paciente = require("../models/Pacientes.js");
const Cita = require("../models/Citas.js");
const Usuario = require("../models/Usuarios.js");
const Consultorio = require("../models/Consultorios.js");
const sequelize = require("../utils/database.util");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Especialidad = require("../models/Especialidades.js");

const { fetchAppointmentsDoctor } = require("../services/doctorService.js");

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

    const especialidadId = await Especialidad.findOne({
      where: {
        especialidad: especialidad,
      },
      attributes: ["id"],
    });

    if (!especialidadId) {
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
        especialidad: especialidadId.id,
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

    const appointmentsDoctor = await fetchAppointmentsDoctor(no_empleado);
    //return res.send(appointmentsDoctor);
    const appointmentsInformationDoctor = appointmentsDoctor.map(
      ({
        nss,
        id: id_cita,
        status,
        HorarioConsultorio: { fecha_hora_inicio, fecha_hora_final },
        Paciente: {
          Usuario: { nombre, ap_paterno, ap_materno },
        },
        Receta,
      }) => ({
        id_cita,
        nss,
        paciente: nombre + " " + ap_paterno + " " + ap_materno,
        fecha_hora_inicio,
        fecha_hora_final,
        status,
        id_receta: Receta?.id || null,
        diagnostico: Receta?.diagnostico || null,
      })
    );
    return res.json(appointmentsInformationDoctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = medicoController;
