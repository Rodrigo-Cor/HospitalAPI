const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const Usuario = require("../models/Usuarios.js");
const Consultorio = require("../models/Consultorios.js");
const Receta = require('../models/Recetas');
const Tratamiento = require('../models/Tratamientos');
const RecetaTratamiento = require('../models/RecetasTratamientos');
const Paciente = require("../models/Pacientes.js");
const Medicamento = require("../models/Medicamentos.js");
const RecetaMedicamento = require("../models/RecetasMedicamentos.js");
const Servicio = require("../models/Servicios.js");
const RecetaServicio = require("../models/RecetasServicios.js");
const Especialidad = require("../models/Especialidades.js");
const sequelize = require("../utils/database.util");

const { Sequelize } = require("sequelize");

const recetaController = {};

const fetchCitaReceta = async (idCita) => {
  const recipeAppointment = await Cita.findByPk(idCita, {
    include: [
      {
        model: Receta,
        attributes: ["id"],
      },
      {
        model: Paciente,
        attributes: ["nss"],
        include: {
          model: Usuario,
          attributes: ["nombre", "ap_paterno", "ap_materno"]
        }
      },
      {
        model: HorarioConsultorio,
        attributes: ["fecha_hora_inicio", "fecha_hora_final"],
      },
    ]
  });

  /*
  include: {
              model: Medico,
              attributes: ["no_empleado", "consultorio"],
              include: {
                model: Usuario,
                attributes: ["nombre", "ap_paterno", "ap_materno"]
              }
            }
  */
  return recipeAppointment;
  if (!recipeAppointment) return null;

  const { Recetum: { id: idRecipe } } = recipeAppointment;
  return idRecipe;

  const recetaServicios = await RecetaServicio.findAll({

  });

  const recetaTratamientos = await RecetaTratamiento.findAll({
    attributes: {
      exclude: ["id", "id_tratamientos", "id_receta"],
    },
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
    (total, { cantidad_medicamento, Medicamento: { costo } }) => total + costo * cantidad_medicamento, 0);

  const costoTotalServicios = recetaServicios.reduce(
    (total, { cantidad_servicio, Servicio: { costo } }) => total + costo * cantidad_servicio, 0);
  /*
    const dataReceta = [
      ...recetaMedicamentos.map((recetaMedicamento) => ({
        nombre: recetaMedicamento.medicamento.nombre,
        descripcion: recetaMedicamento.medicamento.descripcion,
        costo: recetaMedicamento.medicamento.costo,
        cantidad: recetaMedicamento.cantidad_medicamento,
      })),
      ...recetaServicios.map((recetaServicio) => ({
        nombre: recetaServicio.servicio.nombre,
        descripcion: recetaServicio.servicio.descripcion,
        costo: recetaServicio.servicio.costo,
        cantidad: recetaServicio.cantidad_servicios,
      })),
      {
        costoTotalMedicamentos,
        costoTotalServicios,
      },
    ];
  */
  return dataReceta;
};


recetaController.getRecetaByIDCita = async (req, res) => {
  try {
    const { id_cita } = req.body; //6 y 13
    const receta = await fetchCitaReceta(id_cita);

    return res.json(receta);

    /*
    const {
      recetaCitaPacienteUsuario,
      recetaCitaBase,
      recetaMedicamentos,
      recetaTratamientos,
      recetaServicios,
    } = await fetchCitaReceta(id_cita);

    const transformedRecetaCitaPacienteUsuario = recetaCitaPacienteUsuario.map((item) => ({
      id_horario: item.Cita.id_horario,
      nss: item.Cita.Paciente.nss,
      correo_paciente: item.Cita.Paciente.correo,
      telefono_paciente: item.Cita.Paciente.telefono,
      nombre_paciente: item.Cita.Paciente.Usuario.nombre +
        " " + item.Cita.Paciente.Usuario.ap_paterno +
        " " + item.Cita.Paciente.Usuario.ap_materno,
    }));

    const transformedRecetaCitaBase = recetaCitaBase.map((item) => ({
      nombre_medico:
        item.Cita.HorarioConsultorio.Consultorio.Medico.Usuario.nombre +
        " " +
        item.Cita.HorarioConsultorio.Consultorio.Medico.Usuario.ap_paterno +
        " " +
        item.Cita.HorarioConsultorio.Consultorio.Medico.Usuario.ap_materno,
      consultorio: item.Cita.HorarioConsultorio.Consultorio.consultorio,
      no_empleado: item.Cita.HorarioConsultorio.Consultorio.Medico.no_empleado,
      telefono_medico: item.Cita.HorarioConsultorio.Consultorio.Medico.telefono,
      correo_medico: item.Cita.HorarioConsultorio.Consultorio.Medico.correo,
      especialidad:
        item.Cita.HorarioConsultorio.Consultorio.Medico.Especialidad.especialidad,
      fecha_hora_inicio: item.Cita.HorarioConsultorio.fecha_hora_inicio,
      fecha_hora_final: item.Cita.HorarioConsultorio.fecha_hora_final,
    }));

    const transformedRecetaMedicamentos = recetaMedicamentos.map((item) => ({
      medicamento: {
        nombre: item.Medicamento.nombre,
        descripcion: item.Medicamento.descripcion,
        costo: item.Medicamento.costo,
      },
    }));

    const transformedRecetaTratamientos = recetaTratamientos.map((item) => ({
      tratamiento: {
        descripcion: item.Tratamiento.descripcion,
      },
    }));

    const transformedRecetaServicios = recetaServicios.map((item) => ({
      servicio: {
        nombre: item.Servicio.nombre,
        descripcion: item.Servicio.descripcion,
        costo: item.Servicio.costo,
      },
    }));

    const costoTotalMedicamentos = recetaMedicamentos.reduce((total, medicamento) => total + medicamento.Medicamento.costo, 0);
    const costoTotalServicios = recetaServicios.reduce((total, servicio) => total + servicio.Servicio.costo, 0);
    const costoTotalGeneral = costoTotalMedicamentos + costoTotalServicios;

    return res.json({
      ...transformedRecetaCitaPacienteUsuario[0],
      ...transformedRecetaCitaBase[0],
      recetaMedicamentos: transformedRecetaMedicamentos,
      recetaTratamientos: transformedRecetaTratamientos,
      recetaServicios: transformedRecetaServicios,
      costoTotalMedicamentos,
      costoTotalServicios,
      costoTotalGeneral,
    });
    */
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

recetaController.makeReceta = async (req, res) => {
  try {
    const { id_cita, medicamentos, tratamientos, servicios } = req.body;

    const newRecipe = await Receta.create({
      id_cita,
    });

    const { id: id_recipe } = newRecipe;

    await Promise.all(medicamentos.map(async ({ id, cantidad }) => RecetaMedicamento.create({
      id_receta: id_recipe,
      id_medicamento: id,
      cantidad_medicamento: cantidad,
    })
    ));

    await Promise.all(tratamientos.map(async (id) => RecetaTratamiento.create({
      id_receta: id_recipe,
      id_tratamiento: id,
    })
    ));

    await Promise.all(servicios.map(async ({ id, cantidad }) => RecetaServicio.create({
      id_receta: id_recipe,
      id_servicio: id,
      cantidad_servicios: cantidad,
    })
    ));

    return res.status(201).json({ message: "Receta creada" });
  } catch (error) {
    return res.status(500).json({ mensaje: error });
  }
};



module.exports = recetaController;
