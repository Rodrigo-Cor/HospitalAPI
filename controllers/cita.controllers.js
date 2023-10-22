const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const Usuario = require("../models/Usuarios.js");

const sequelize = require("../utils/database.util");

const citaController = {};

citaController.getAppointmentsDays = async (req, res) => {
  try {
    const { consultorio } = req.body;

    const citas_disponibles = await HorarioConsultorio.findAll({
      where: {
        disponible: 1,
        consultorio: consultorio,
      },
    });

    const horario_citas = citas_disponibles.map((cita) => {
      const { id, fecha_hora_inicio, fecha_hora_final } = cita;
      const hora_inicio = new Date(fecha_hora_inicio);
      const hora_final = new Date(fecha_hora_final);
      return {
        id: id,
        fecha: hora_inicio.toISOString().split("T")[0],
        hora_inicio:
          hora_inicio.getHours().toString().padStart(2, "0") +
          ":" +
          hora_inicio.getMinutes().toString().padStart(2, "0"),
        hora_final:
          hora_final.getHours().toString().padStart(2, "0") +
          ":" +
          hora_final.getMinutes().toString().padStart(2, "0"),
      };
    });

    return res.json(horario_citas);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

citaController.getDoctors = async (req, res) => {
  try {
    const { especialidad } = req.body;

    const medicos = await Medico.findAll({
      where: {
        especialidad: especialidad,
      },
    });

    const medicosDisponibles = await Promise.all(
      medicos.map(async (medico) => {
        const { no_empleado, correo, consultorio } = medico;

        const medico_usuario = await Usuario.findOne({
          where: {
            correo: correo,
          },
        });

        const { nombre, ap_paterno, ap_materno } = medico_usuario;

        return {
          no_empleado: no_empleado,
          consultorio: consultorio,
          nombre: nombre,
          ap_paterno: ap_paterno,
          ap_materno: ap_materno,
        };
      })
    );

    return res.json(medicosDisponibles);
  } catch (error) {
    console.error("Error al obtener doctores:", error);
    return res.status(500).json({ message: "Error al obtener doctores" });
  }
};

citaController.scheduleAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { fecha, hora_inicio, hora_final, nss, no_empleado } = req.body;

    const hora_inicioUTC = new Date(fecha + "T" + hora_inicio).toISOString();
    const hora_finalUTC = new Date(fecha + "T" + hora_final).toISOString();

    await Cita.create(
      {
        fecha_hora_inicio: hora_inicioUTC,
        fecha_hora_final: hora_finalUTC,
        nss: nss,
        no_empleado: no_empleado,
      },
      { transaction: t }
    );

    const medico = await Medico.findOne({
      where: {
        no_empleado: no_empleado,
      },
      attributes: ["consultorio"],
    });

    await HorarioConsultorio.update(
      {
        disponible: 0,
      },
      {
        where: {
          consultorio: medico.consultorio,
          fecha_hora_inicio: hora_inicioUTC,
          fecha_hora_final: hora_finalUTC,
        },
        returning: true,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Cita agendada" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

module.exports = citaController;
