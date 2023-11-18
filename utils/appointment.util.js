const Servicio = require("../models/Servicios.js");

const fetchConsultaCost = async (especialidad) => {
  const servicio = await Servicio.findOne({
    where: {
      nombre: "Consulta " + especialidad.toLowerCase(),
    },
    attributes: ["costo"],
  });
  return servicio?.costo || 0;
};

const isOnTime = (date) => {
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const dateAppointment = new Date(date);
  return oneDayAgo < dateAppointment;
};

module.exports = {fetchConsultaCost, isOnTime};
