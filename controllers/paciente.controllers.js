const crypto = require("crypto-js");
const Paciente = require("../models/Pacientes.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const HorarioConsultorio = require("../models/HorariosConsultorios.js");

const sequelize = require("../utils/database.util");

const pacienteController = {};

const hashPassword = (password) => {
  try {
    return crypto.SHA256(password).toString();
  } catch (error) {
    console.log(error);
  }
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
  });
};

const isOnTime = (date) => {
  const oneDayAgo = new Date();
  const auxDate = new Date(date);
  auxDate.setHours(auxDate.getHours() - 24);
  return new Date(auxDate) > oneDayAgo;
};

pacienteController.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      nss,
      correo,
      telefono,
      nombre,
      ap_paterno,
      ap_materno,
      password,
      metodo_pago,
    } = req.body;

    await Usuario.create(
      {
        correo: correo,
        tipo_usuario: "Paciente",
        nombre: nombre,
        ap_paterno: ap_paterno,
        ap_materno: ap_materno,
        password: hashPassword(password),
      },
      { transaction: t }
    );

    await Paciente.create(
      {
        nss: nss,
        correo: correo,
        telefono: telefono,
        metodo_pago: metodo_pago,
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Paciente dado de alta" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

pacienteController.showAppointment = async (req, res) => {
  try {
    const { nss } = req.body;

    const citas_paciente = await Cita.findAll({
      where: {
        nss: nss,
      },
      order: [["fecha_hora_inicio", "ASC"]],
      attributes: [
        "id",
        "fecha_hora_inicio",
        "fecha_hora_final",
        "no_empleado",
        "pagado",
      ],
    });

    console.log(citas_paciente);

    const noEmpleadosUnicos = Array.from(
      new Set(citas_paciente.map(({ no_empleado }) => no_empleado))
    );

    const medicos = await Medico.findAll({
      where: {
        no_empleado: noEmpleadosUnicos,
      },
      attributes: ["no_empleado", "consultorio", "especialidad"],
      include: {
        model: Usuario,
        attributes: ["nombre", "ap_paterno", "ap_materno"],
      },
    });

    const medicosMap = {};
    medicos.forEach(
      ({
        no_empleado,
        consultorio,
        especialidad,
        Usuario: { nombre, ap_paterno, ap_materno },
      }) => {
        medicosMap[no_empleado] = {
          consultorio,
          especialidad,
          nombre,
          ap_paterno,
          ap_materno,
        };
      }
    );

    const citasFormateadas = citas_paciente.map((cita) => {
      const { id, fecha_hora_inicio, fecha_hora_final, no_empleado, pagado } =
        cita;

      console.log(cita);

      const { consultorio, especialidad, nombre, ap_paterno, ap_materno } =
        medicosMap[no_empleado];
      return {
        id,
        medico: nombre + " " + ap_paterno + " " + ap_materno,
        consultorio,
        especialidad,
        fecha_hora_inicio,
        fecha_hora_final,
        onTime: isOnTime(fecha_hora_inicio),
        pagado,
      };
    });

    return res.json(citasFormateadas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

pacienteController.deleteAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, consultorio, fecha_hora_inicio, fecha_hora_final } = req.body;
    console.log(id, consultorio, fecha_hora_inicio, fecha_hora_final);
    await Cita.destroy({
      where: {
        id,
      },
      transaction: t,
    });

    await HorarioConsultorio.update(
      {
        disponible: 1,
      },
      {
        where: {
          consultorio: consultorio,
          fecha_hora_inicio: fecha_hora_inicio,
          fecha_hora_final: fecha_hora_final,
        },
      },
      { transaction: t }
    );
    await t.commit();
    return res.json({ message: "Se ha cancelado su cita" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

module.exports = pacienteController;
