const crypto = require("crypto-js");
const { Sequelize } = require("sequelize");

const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Consultorio = require("../models/Consultorios.js");
const Recepcionista = require("../models/Recepcionistas.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");
const Paciente = require("../models/Pacientes.js");

const sequelize = require("../utils/database.util");
const { fetchConsultaCost } = require("../utils/appointment.util.js");
const {
  fetchEmailAndSchedulesPatient,
  fetchEmailAndAppointmentsDoctor,
  fetchAppointmentsPatientNoCancel,
  fetchAppointmentsToday,
} = require("../services/appointmentService.js");
const Medico = require("../models/Medicos.js");

const recepcionistaController = {};

const hashPassword = (password) => crypto.SHA256(password).toString();

recepcionistaController.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { no_empleado, correo, nombre, ap_paterno, ap_materno, password } =
      req.body;

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

    await Recepcionista.create(
      {
        no_empleado: no_empleado,
        correo: correo,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Recepcionista dado de alta" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.getScheduledAppointments = async (req, res) => {
  try {
    const { nss } = req.body;

    const { dataAppointments, dataPatient } =
      await fetchAppointmentsPatientNoCancel(nss);

    if (!dataPatient)
      return res.status(400).json({ message: "No existe el paciente" });

    dataPatient.dataValues.nss = nss;

    if (dataAppointments.length === 0)
      return res.json({
        dataSheduledAppointmets: [],
        dataPatientCost: dataPatient,
      });

    let costoTotal = 0;

    const dataSheduledAppointmets = await Promise.all(
      dataAppointments.map(
        async ({
          id_horario,
          HorarioConsultorio: {
            fecha_hora_inicio,
            fecha_hora_final,
            Medico: {
              consultorio,
              Especialidad: { especialidad },
              Usuario: {
                nombre: nombre_medico,
                ap_paterno: paterno_medico,
                ap_materno: materno_medico,
              },
            },
          },
        }) => {
          const costo =
            (await fetchConsultaCost(
              "Consulta " + especialidad.toLowerCase()
            )) * 0.5;
          costoTotal += costo;
          const nameDoctor =
            nombre_medico + " " + paterno_medico + " " + materno_medico;
          return {
            id_horario,
            fecha_hora_inicio,
            fecha_hora_final,
            nameDoctor,
            consultorio,
            costo,
          };
        }
      )
    );

    dataPatient.dataValues.costoTotal = costoTotal;

    return res.json({
      dataSheduledAppointmets,
      dataPatientCost: dataPatient,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.deletePatient = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { nss } = req.body;
    const { correo, citas } = await fetchEmailAndSchedulesPatient(nss);

    const idHorarios = citas.map(({ id_horario }) => id_horario);
    const idCitas = citas.map(({ id }) => id);

    await HorarioConsultorio.update(
      {
        disponible: 1,
      },
      {
        where: {
          id: idHorarios,
        },
        individualHooks: true,
      },
      { transaction: t }
    );

    await Cita.destroy({
      where: {
        id: idCitas,
      },
      transaction: t,
      individualHooks: true,
    });

    await Usuario.update(
      {
        fecha_fin: new Date(),
      },
      {
        where: {
          correo: correo,
        },
        individualHooks: true,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Paciente dado de baja del sistema" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.deleteDoctor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { no_empleado } = req.body;

    const existingDoctor = await Medico.findByPk(no_empleado);

    if (!existingDoctor) {
      return res
        .status(404)
        .json({ message: "El médico no existe", citas: [], nameDoctor: "" });
    }

    const { citas, correo, consultorio, nameDoctor } =
      await fetchEmailAndAppointmentsDoctor(no_empleado);

    if (citas.length > 0) {
      return res.status(400).json({
        message: "El médico tiene citas asignadas",
        citas,
        nameDoctor,
      });
    }

    /*
    const idHorarios = citas.map(({ id }) => id);
    const idCitas = citas.map(({ id_horario }) => id_horario);

    await Cita.destroy({
      where: {
        id: idCitas,
      },
      individualHooks: true,
      transaction: t,
    });

    await HorarioConsultorio.destroy({
      where: {
        id: idHorarios,
      },
      individualHooks: true,
      transaction: t,
    });
    */

    await Consultorio.update(
      {
        disponible: 1,
      },
      {
        where: {
          consultorio: consultorio,
        },
        individualHooks: true,
      },
      { transaction: t }
    );

    await Usuario.update(
      {
        fecha_fin: new Date(),
      },
      {
        where: {
          correo: correo,
        },
        individualHooks: true,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Médico dado de baja del sistema" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.getConsultorios = async (req, res) => {
  try {
    const consultorios = await Consultorio.findAll({
      attributes: ["consultorio"],
    });

    return res.json(consultorios);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.getAppointmentsToday = async (req, res) => {
  try {
    const appointments = await fetchAppointmentsToday();

    const dataAppointmentsToday = appointments.map(
      ({
        id,
        nss,
        status,
        HorarioConsultorio: {
          fecha_hora_inicio,
          fecha_hora_final,
          Medico: {
            consultorio,
            Usuario: {
              nombre: name_doctor,
              ap_paterno: paterno_doctor,
              ap_materno: materno_doctor,
            },
            Especialidad: { especialidad },
          },
        },
        Paciente: {
          Usuario: {
            nombre: name_patient,
            ap_paterno: paterno_patient,
            ap_materno: materno_patient,
          },
        },
        Receta,
        Status: { descripcion },
      }) => ({
        id,
        nss,
        fecha_hora_inicio,
        fecha_hora_final,
        consultorio,
        nameDoctor: name_doctor + " " + paterno_doctor + " " + materno_doctor,
        namePatient:
          name_patient + " " + paterno_patient + " " + materno_patient,
        especialidad,
        receta: Receta?.id || null,
        status,
        descripcion,
      })
    );
    return res.send(dataAppointmentsToday);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    await Cita.update(
      {
        status: status,
      },
      {
        where: {
          id: id,
        },
        individualHooks: true,
      }
    );

    return res.json({ message: "Status actualizado" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.setSchedule = async (req, res) => {
  try {
    const { no_empleado, fecha_hora_inicio, fecha_hora_final } = req.body;

    const horarioExistente = await HorarioConsultorio.findOne({
      where: {
        no_empleado: no_empleado,
        fecha_hora_inicio: fecha_hora_inicio,
        fecha_hora_final: fecha_hora_final,
      },
    });

    if (!horarioExistente) {
      await HorarioConsultorio.create({
        no_empleado: no_empleado,
        fecha_hora_inicio: fecha_hora_inicio,
        fecha_hora_final: fecha_hora_final,
      });
      return res.status(201).json({ message: "Horario dado de alta" });
    } else {
      return res.status(400).json({ message: "Horario ya existente" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.deleteConsultory = async (req, res) => {
  try {
    const { consultorio } = req.body;

    const existingConsultory = await Consultorio.findOne({
      where: {
        consultorio: consultorio,
      },
    });

    if (!existingConsultory) {
      return res.status(404).send({ message: "El consultorio no existe" });
    }

    const doctorConsultory = await Medico.findOne({
      include: [
        {
          model: Consultorio,
          where: {
            consultorio: consultorio,
          },
        },
        {
          model: Usuario,
          where: {
            fecha_fin: {
              [Sequelize.Op.is]: null,
            },
          },
        },
      ],
    });

    if (doctorConsultory) {
      return res.status(400).send({ message: "Consultorio ocupado" });
    }

    await Consultorio.update(
      {
        disponible: 1,
      },
      {
        where: {
          consultorio: consultorio,
        },
        individualHooks: true,
      }
    );

    return res.send({ message: "Consultorio disponible" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = recepcionistaController;
