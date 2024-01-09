const Receta = require("../models/Recetas");
const RecetaTratamiento = require("../models/RecetasTratamientos");
const RecetaMedicamento = require("../models/RecetasMedicamentos.js");
const RecetaServicio = require("../models/RecetasServicios.js");
const {
  fetchDataRecipe,
  fetchMedicines,
  fetchTreatments,
  fetchServices,
} = require("../services/recipeService.js");

const recetaController = {};

recetaController.createRecipe = async (req, res) => {
  try {
    const { id_cita, medicamentos, tratamientos, servicios, diagnostico } =
      req.body;

    const newRecipe = await Receta.create({
      id_cita,
      diagnostico,
    });

    const { id: id_recipe } = newRecipe;

    await Promise.all(
      medicamentos.map(async ({ id, cantidad }) =>
        RecetaMedicamento.create({
          id_receta: id_recipe,
          id_medicamento: id,
          cantidad_medicamento: cantidad,
        })
      )
    );

    await Promise.all(
      tratamientos.map(async ({ id, duracion }) =>
        RecetaTratamiento.create({
          id_receta: id_recipe,
          id_tratamiento: id,
          duracion,
        })
      )
    );

    await Promise.all(
      servicios.map(async ({ id, cantidad }) =>
        RecetaServicio.create({
          id_receta: id_recipe,
          id_servicio: id,
          cantidad_servicios: cantidad,
        })
      )
    );

    return res.status(201).json({ message: "Receta creada" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ mensaje: error.message });
  }
};

recetaController.getDataRecipe = async (req, res) => {
  try {
    const { id } = req.body;
    const recipeDataAppointment = await fetchDataRecipe(id);

    if (!recipeDataAppointment)
      return res
        .status(404)
        .json({ message: "No hay receta asociada a esa cita" });

    const {
      recipeAppointment,
      recetaMedicamentos,
      recetaTratamientos,
      recetaServicios,
      costoTotalMedicamentos,
      costoTotalServicios,
    } = recipeDataAppointment;

    const dataRecipeTreatments =
      recetaTratamientos?.map(({ duracion, Tratamiento: { descripcion } }) => ({
        duracion,
        descripcion,
      })) || [];

    const dataRecipeServices =
      recetaServicios?.map(
        ({ cantidad_servicios, Servicio: { nombre, costo } }) => ({
          cantidad_servicios,
          nombre,
          costo,
        })
      ) || [];

    const dataRecipeMedicine =
      recetaMedicamentos?.map(
        ({
          cantidad_medicamento,
          Medicamento: { nombre, descripcion, costo },
        }) => ({
          cantidad_medicamento,
          nombre,
          descripcion,
          costo,
        })
      ) || [];

    const {
      Receta: { id: recipeId, diagnostico },
      Paciente: {
        nss,
        Usuario: { nombre, ap_paterno, ap_materno },
      },
      HorarioConsultorio: {
        fecha_hora_inicio,
        fecha_hora_final,
        Medico: {
          no_empleado,
          consultorio,
          Usuario: {
            nombre: nombreMedico,
            ap_paterno: ap_paternoMedico,
            ap_materno: ap_maternoMedico,
          },
          Especialidad: { especialidad },
        },
      },
    } = recipeAppointment;

    const dataRecipe = {
      recipeId,
      diagnostico,
      nss,
      patient: nombre + " " + ap_paterno + " " + ap_materno,
      fecha_hora_inicio,
      fecha_hora_final,
      no_empleado,
      consultorio,
      doctor: nombreMedico + " " + ap_paternoMedico + " " + ap_maternoMedico,
      especialidad,
    };

    return res.json({
      dataRecipe,
      dataRecipeMedicine,
      costoTotalMedicamentos,
      dataRecipeServices,
      costoTotalServicios,
      dataRecipeTreatments,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

recetaController.getMedicines = async (req, res) => {
  try {
    const allMedicines = await fetchMedicines();
    return res.send(allMedicines);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

recetaController.getTreatments = async (req, res) => {
  try {
    const allTreatments = await fetchTreatments();
    return res.send(allTreatments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

recetaController.getServices = async (req, res) => {
  try {
    const allServices = await fetchServices();
    return res.send(allServices);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = recetaController;
