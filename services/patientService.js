const Cita = require("../models/Citas");
const HorarioConsultorio = require("../models/HorariosConsultorios");
const Medico = require("../models/Medicos");
const Usuario = require("../models/Usuarios");
const Especialidad = require("../models/Especialidades");

const fetchAppointmentsPatient = async (nss) =>
  await Cita.findAll({
    attributes: ["id", "status", "id_horario"],
    where: {
      nss: nss,
    },
    include: {
      model: HorarioConsultorio,
      attributes: ["fecha_hora_inicio", "fecha_hora_final"],
      include: {
        model: Medico,
        attributes: ["consultorio", "no_empleado"],
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
    order: [
      [HorarioConsultorio, "fecha_hora_inicio", "ASC"],
      [HorarioConsultorio, Medico, "consultorio", "ASC"],
    ],
  });

module.exports = { fetchAppointmentsPatient };
