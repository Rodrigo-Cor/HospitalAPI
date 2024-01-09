const Cita = require("../models/Citas.js");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Servicio = require("../models/Servicios.js");

const fetchConsultaCost = async (nombre) => {
  const servicio = await Servicio.findOne({
    where: {
      nombre: nombre,
    },
    attributes: ["costo"],
  });
  return servicio?.costo || 1000;
};

const isOnTime = (date) => {
  const today = new Date();

  const dateAppointment = new Date(date);
  dateAppointment.setHours(dateAppointment.getHours() - 48);

  return today < dateAppointment;
};

const checkAppointmentAvailability = async ({ nss, fecha_hora_inicio }) => {
  const oneAppointment = await Cita.findOne({
    where: {
      nss: nss,
      status: 1,
    },
    include: {
      model: HorarioConsultorio,
      where: {
        fecha_hora_inicio: fecha_hora_inicio,
      },
    },
  });
  return oneAppointment ? false : true;
};

module.exports = { fetchConsultaCost, isOnTime, checkAppointmentAvailability };
