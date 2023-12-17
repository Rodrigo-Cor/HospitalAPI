const Medico = require("../models/Medicos");
const Usuario = require("../models/Usuarios");
const Especialidad = require("../models/Especialidades");
const HorarioConsultorio = require("../models/HorariosConsultorios");
const Cita = require("../models/Citas");
const Paciente = require("../models/Pacientes");

const { Sequelize } = require("sequelize");
const Consultorio = require("../models/Consultorios");

const fetchDoctorsSchedulesAvailable = async () => {
  const today = new Date();
  const hoursToday = today.getUTCHours();
  const date72HoursAfter = new Date(today);
  date72HoursAfter.setUTCHours(hoursToday + 72);

  return await Medico.findAll({
    attributes: ["no_empleado", "especialidad", "consultorio"],
    include: [
      {
        model: Especialidad,
        attributes: ["especialidad"],
      },
      {
        model: Usuario,
        attributes: ["nombre", "ap_paterno", "ap_materno"],
        where: {
          fecha_fin: {
            [Sequelize.Op.is]: null,
          },
        },
      },
      {
        model: HorarioConsultorio,
        where: {
          disponible: true,
          fecha_hora_inicio: {
            [Sequelize.Op.gte]: date72HoursAfter,
          },
        },
        attributes: {
          exclude: [
            "fecha_hora_inicio",
            "fecha_hora_final",
            "disponible",
            "no_empleado",
          ],
        },
      },
    ],
    order: [
      [Especialidad, "especialidad", "ASC"],
      ["consultorio", "ASC"],
    ],
  });
};

const fetchEmailAndSchedulesPatient = async (nss) => {
  const { correo } = await Paciente.findByPk(nss, {
    attributes: ["correo"],
  });

  const citas = await Cita.findAll({
    where: {
      nss: nss,
      status: 1,
    },
    attributes: ["id_horario", "id"],
  });

  return { correo, citas };
};

const fetchEmailAndAppointmentsDoctor = async (no_empleado) => {
  const {
    correo,
    Consultorio: { consultorio },
  } = await Medico.findByPk(no_empleado, {
    attributes: ["correo"],
    include: {
      model: Consultorio,
      attributes: ["consultorio"],
    },
  });

  const citas = await Cita.findAll({
    attributes: ["id_horario", "id"],
    where: {
      status: 1,
    },
    include: {
      model: HorarioConsultorio,
      attributes: {
        exclude: [
          "fecha_hora_inicio",
          "fecha_hora_final",
          "disponible",
          "no_empleado",
        ],
      },
      where: {
        no_empleado: no_empleado,
      },
    },
  });

  return { correo, citas, consultorio };
};

const fetchAppointmentsPatientNoCancel = async (nss) => {
  const twoDaysAfter = new Date();
  twoDaysAfter.setHours(twoDaysAfter.getHours() + 48);

  const dataAppointments = await Cita.findAll({
    attributes: ["id_horario", "nss"],
    where: {
      nss: nss,
      status: 1,
    },
    include: [
      {
        model: HorarioConsultorio,
        attributes: ["fecha_hora_inicio", "fecha_hora_final", "no_empleado"],
        where: {
          fecha_hora_inicio: { [Sequelize.Op.lte]: twoDaysAfter },
        },
        include: {
          model: Medico,
          attributes: ["especialidad", "correo", "consultorio"],
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
      {
        model: Paciente,
        attributes: ["correo", "metodo_pago"],
        include: {
          model: Usuario,
          attributes: ["nombre", "ap_paterno", "ap_materno"],
        },
      },
    ],
  });
  return dataAppointments;
};

const fetchAppointmentsToday = async () => {
  const timeStart = new Date();
  const timeEnd = new Date();
  timeStart.setHours(7, 0, 0, 0);
  timeEnd.setHours(20, 0, 0, 0);

  const appointments = await Cita.findAll({
    attributes: ["id", "nss"],
    where: {
      status: 1,
    },
    include: [
      {
        model: HorarioConsultorio,
        attributes: ["fecha_hora_inicio", "fecha_hora_final", "no_empleado"],
        where: {
          fecha_hora_inicio: {
            [Sequelize.Op.and]: [
              { [Sequelize.Op.lte]: timeEnd },
              { [Sequelize.Op.gte]: timeStart },
            ],
          },
        },
        include: {
          model: Medico,
          attributes: ["especialidad", "correo", "consultorio"],
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
      {
        model: Paciente,
        attributes: ["correo"],
        include: {
          model: Usuario,
          attributes: ["nombre", "ap_paterno", "ap_materno"],
        },
      },
    ],
  });
  return appointments;
};

module.exports = {
  fetchDoctorsSchedulesAvailable,
  fetchEmailAndSchedulesPatient,
  fetchEmailAndAppointmentsDoctor,
  fetchAppointmentsPatientNoCancel,
  fetchAppointmentsToday,
};
