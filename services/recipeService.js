const Cita = require("../models/Citas.js");
const Receta = require("../models/Recetas.js");
const Paciente = require("../models/Pacientes.js");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Medico = require("../models/Medicos.js");
const Usuario = require("../models/Usuarios.js");
const RecetaMedicamento = require("../models/RecetasMedicamentos.js");
const Medicamento = require("../models/Medicamentos.js");
const RecetaTratamiento = require("../models/RecetasTratamientos.js");
const Tratamiento = require("../models/Tratamientos.js");
const RecetaServicio = require("../models/RecetasServicios.js");
const Servicio = require("../models/Servicios.js");
const Especialidad = require("../models/Especialidades.js");

const fetchMedicines = async () =>
  await Medicamento.findAll({
    attributes: ["id", "nombre"],
  });

const fetchTreatments = async () =>
  await Tratamiento.findAll({
    attributes: ["id", "descripcion"],
  });

const fetchServices = async () =>
  await Servicio.findAll({
    attributes: ["id", "nombre"],
  });

const fetchDataRecipe = async (id) => {
  const recipeAppointment = await Cita.findByPk(id, {
    attributes: { exclude: ["id", "id_horario", "status", "nss"] },
    include: [
      {
        model: Receta,
        attributes: ["id", "diagnostico"],
      },
      {
        model: Paciente,
        attributes: ["nss"],
        include: {
          model: Usuario,
          attributes: ["nombre", "ap_paterno", "ap_materno"],
        },
      },
      {
        model: HorarioConsultorio,
        attributes: ["fecha_hora_inicio", "fecha_hora_final"],
        include: {
          model: Medico,
          attributes: ["no_empleado", "consultorio"],
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
    ],
  });

  if (!recipeAppointment) return null;

  const {
    Receta: { id: idRecipe },
  } = recipeAppointment;

  const recetaServicios = await RecetaServicio.findAll({
    attributes: ["cantidad_servicios"],
    where: {
      id_receta: idRecipe,
    },
    include: {
      model: Servicio,
      attributes: ["nombre", "costo"],
    },
  });

  const recetaTratamientos = await RecetaTratamiento.findAll({
    attributes: ["duracion"],
    where: {
      id_receta: idRecipe,
    },
    include: {
      model: Tratamiento,
      attributes: ["descripcion"],
    },
  });

  const recetaMedicamentos = await RecetaMedicamento.findAll({
    attributes: ["cantidad_medicamento"],
    where: {
      id_receta: idRecipe,
    },
    include: {
      model: Medicamento,
      attributes: ["nombre", "descripcion", "costo"],
    },
  });

  const costoTotalMedicamentos = recetaMedicamentos.reduce(
    (total, { cantidad_medicamento, Medicamento: { costo } }) =>
      total + costo * cantidad_medicamento,
    0
  );

  const costoTotalServicios = recetaServicios.reduce(
    (total, { cantidad_servicios, Servicio: { costo } }) =>
      total + costo * cantidad_servicios,
    0
  );

  return {
    recipeAppointment,
    recetaMedicamentos,
    recetaTratamientos,
    recetaServicios,
    costoTotalMedicamentos,
    costoTotalServicios,
  };
};

module.exports = {
  fetchDataRecipe,
  fetchMedicines,
  fetchTreatments,
  fetchServices,
};
