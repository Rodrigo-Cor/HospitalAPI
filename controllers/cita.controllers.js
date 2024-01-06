"use strict";

const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Cita = require("../models/Citas.js");

const sequelize = require("../utils/database.util");
const {
  fetchConsultaCost,
  checkAppointmentAvailability,
} = require("../utils/appointment.util.js");

const {
  fetchDoctorsSchedulesAvailable,
} = require("../services/appointmentService.js");

const { Sequelize } = require("sequelize");

const citaController = {};

citaController.getDoctors = async (req, res) => {
  try {
    const doctorsSchedulesAvailable = await fetchDoctorsSchedulesAvailable();
    //return res.send(doctorsWithConsultorios);

    if (!doctorsSchedulesAvailable.length) {
      return res.json([]);
    }

    let existingSpecialties = [];

    const specialtiesCost = await Promise.all(
      doctorsSchedulesAvailable.map(
        async ({ Especialidad: { especialidad } }) => {
          if (!existingSpecialties.includes(especialidad)) {
            existingSpecialties.push(especialidad);
            const costo = await fetchConsultaCost("Consulta " + especialidad);
            return { especialidad, costo };
          } else {
            return null;
          }
        }
      )
    );

    const filteredSpecialtiesCost = specialtiesCost.filter(
      (specialityCost) => specialityCost !== null
    );

    const availableDoctors = doctorsSchedulesAvailable.map(
      ({
        no_empleado,
        Especialidad: { especialidad },
        consultorio,
        Usuario: { nombre, ap_paterno, ap_materno },
      }) => ({
        no_empleado,
        especialidad,
        nombreCompleto: nombre + " " + ap_paterno + " " + ap_materno,
        consultorio,
      })
    );

    return res.json({
      availableDoctors,
      specialtiesCost: filteredSpecialtiesCost,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener doctores" });
  }
};

citaController.getAppointmentsDays = async (req, res) => {
  try {
    const { no_empleado } = req.body;

    const today = new Date();
    const hoursToday = today.getUTCHours();
    const date72HoursAfter = new Date(today);
    date72HoursAfter.setUTCHours(hoursToday + 72);

    const appointmentAvailable = await HorarioConsultorio.findAll({
      attributes: ["fecha_hora_inicio", "fecha_hora_final", "id"],
      where: {
        disponible: true,
        no_empleado: no_empleado,
        fecha_hora_inicio: {
          [Sequelize.Op.gte]: date72HoursAfter,
        },
      },
      order: [["fecha_hora_inicio", "ASC"]],
    });

    return res.send(appointmentAvailable);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

citaController.getAppointmentModify = async (req, res) => {
  try {
    const { no_empleado, id_horario } = req.body;

    const today = new Date();
    const hoursToday = today.getUTCHours();
    const date72HoursAfter = new Date(today);
    date72HoursAfter.setUTCHours(hoursToday + 72);

    const appointmentAvailable = await HorarioConsultorio.findAll({
      attributes: ["fecha_hora_inicio", "fecha_hora_final", "id"],
      where: {
        disponible: true,
        no_empleado: no_empleado,
        fecha_hora_inicio: {
          [Sequelize.Op.gte]: date72HoursAfter,
        },
        id: {
          [Sequelize.Op.ne]: id_horario,
        },
      },
      order: [["fecha_hora_inicio", "ASC"]],
    });

    return res.send(appointmentAvailable);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

citaController.scheduleAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nss, id_horario, fecha_hora_inicio } = req.body;

    if (!checkAppointmentAvailability({ nss, fecha_hora_inicio })) {
      return res
        .status(400)
        .json({ message: "Ya tienes una cita agendada a esa misma hora" });
    }

    const citaExisting = await Cita.findOne({
      where: {
        nss: nss,
        id_horario: id_horario,
        status: 2,
      },
      attributes: ["id"],
    });

    if (!citaExisting) {
      await Cita.create(
        {
          id_horario: id_horario,
          nss: nss,
          status: 1,
        },
        { transaction: t }
      );
    } else {
      await Cita.update(
        {
          status: 1,
        },
        {
          where: {
            id: citaExisting.id,
          },
        },
        { transaction: t }
      );
    }

    await HorarioConsultorio.update(
      {
        disponible: 0,
      },
      {
        where: {
          id: id_horario,
        },
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

citaController.modifyAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_horario, newHorarioId } = req.body;

    const availableSchedule = await HorarioConsultorio.findOne({
      where: {
        id: newHorarioId,
        disponible: 1,
      },
    });

    if (!availableSchedule) {
      return res.status(400).json({
        message: "El nuevo horario seleccionado ya no está disponible",
      });
    }

    const citaExisting = await Cita.findOne({
      where: {
        id_horario: id_horario,
        status: 1,
      },
      attributes: ["id", "id_horario"],
    });

    await HorarioConsultorio.update(
      {
        disponible: 1,
      },
      {
        where: {
          id: citaExisting.id_horario,
        },
      },
      { transaction: t }
    );

    await citaExisting.update(
      {
        id_horario: newHorarioId,
      },
      { transaction: t }
    );

    await HorarioConsultorio.update(
      {
        disponible: 0,
      },
      {
        where: {
          id: newHorarioId,
        },
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Cita modificada" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

module.exports = citaController;
