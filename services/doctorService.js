const Cita = require("../models/Citas.js");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Paciente = require("../models/Pacientes.js");
const Usuario = require("../models/Usuarios.js");
const Receta = require("../models/Recetas.js");
const RecetaMedicamento = require("../models/RecetasMedicamentos.js");
const Medicamento = require("../models/Medicamentos.js");

const fetchAppointmentsDoctor = async (no_empleado) =>
  await Cita.findAll({
    attributes: ["nss", "id", "status"],
    include: [
      {
        model: HorarioConsultorio,
        where: {
          no_empleado: no_empleado,
        },
        attributes: ["fecha_hora_inicio", "fecha_hora_final"],
      },
      {
        model: Paciente,
        attributes: {
          exclude: ["nss", "metodo_pago", "telefono"],
        },
        include: {
          model: Usuario,
          attributes: ["nombre", "ap_paterno", "ap_materno"],
        },
      },
      {
        model: Receta,
        attributes: ["id"],
      },
    ],
    order: [[HorarioConsultorio, "fecha_hora_inicio", "ASC"]],
  });

module.exports = { fetchAppointmentsDoctor };
