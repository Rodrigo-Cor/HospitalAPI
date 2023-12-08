const crypto = require("crypto-js");
const { Sequelize } = require("sequelize");

const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Consultorio = require("../models/Consultorios.js");
const Recepcionista = require("../models/Recepcionistas.js");
const Usuario = require("../models/Usuarios.js");
const Cita = require("../models/Citas.js");
const Paciente = require("../models/Pacientes.js");
const Medico = require("../models/Medicos.js");
const Especialidad = require("../models/Especialidades.js");

const sequelize = require("../utils/database.util");
const { fetchConsultaCost } = require("../utils/appointment.util.js");

const recepcionistaController = {};

const hashPassword = (password) => crypto.SHA256(password).toString();

const fetchActiveUsers = async () => {
  const activeUsers = await Usuario.findAll({
    where: {
      fecha_fin: {
        [Sequelize.Op.is]: null,
      },
    },
  });
};

const fetchEmailAndSchedules = async (nss) => {
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

recepcionistaController.deletePatient = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { nss } = req.body;
    const { correo, citas } = await fetchEmailAndSchedules(nss);

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
      },
      { transaction: t }
    );

    await Cita.destroy(
      {
        where: {
          id: idCitas,
        },
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

const fetchEmailAndAppointments = async (no_empleado) => {
  const citas = await Medico.findByPk(no_empleado, {
    attributes: {
      exclude: ["no_empleado", "especialidad", "telefono"],
    },
    include: {
      model: Consultorio,
      attributes: {
        exclude: ["disponible", "id"],
      },
      include: {
        model: HorarioConsultorio,
        attributes: {
          exclude: [
            "consultorio",
            "disponible",
            "fecha_hora_inicio",
            "fecha_hora_final",
          ],
        },
        include: {
          model: Cita,
          attributes: {
            exclude: ["status", "nss", "id_horario"],
          },
          where: {
            status: 1,
          },
        },
      },
    },
  });

  return { citas };
};

recepcionistaController.deleteDoctor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { no_empleado } = req.body;
    const {
      citas: {
        correo,
        consultorio,
        Consultorio: { HorarioConsultorios },
      },
    } = await fetchEmailAndAppointments(no_empleado);

    const idHorarios = HorarioConsultorios.map(({ id }) => id);
    const idCitas = HorarioConsultorios.map((citas) => citas.Cita["id"]);

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

const fetchScheduledAppointments = async (nss) => {
  const twoDaysAfter = new Date();
  twoDaysAfter.setHours(twoDaysAfter.getHours() + 48);

  const appointmentsData = await Cita.findAll({
    attributes: ["id_horario", "status"],
    where: {
      nss: nss,
      status: 1,
    },
    include: [
      {
        model: HorarioConsultorio,
        attributes: ["fecha_hora_inicio", "consultorio"],
        where: {
          fecha_hora_inicio: { [Sequelize.Op.lte]: twoDaysAfter },
        },
        include: {
          model: Consultorio,
          attributes: ["consultorio"],
          include: {
            model: Medico,
            attributes: ["especialidad", "correo"],
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
  return appointmentsData;
};

recepcionistaController.getScheduledAppointments = async (req, res) => {
  try {
    const { nss } = req.body;
    const nssExisting = await Paciente.findByPk(nss);
    if (!nssExisting) return res.status(400).json([]);

    const sheduledAppointments = await fetchScheduledAppointments(nss);
    if (sheduledAppointments.length === 0) return res.json([-1]);

    const {
      metodo_pago,
      Usuario: { nombre, ap_paterno, ap_materno },
    } = sheduledAppointments[0].Paciente;
    const paciente = nombre + " " + ap_paterno + " " + ap_materno;
    let costoTotal = 0;

    const dataSheduledAppointmets = await Promise.all(
      sheduledAppointments.map(
        async ({
          id_horario,
          HorarioConsultorio: {
            fecha_hora_inicio,
            Consultorio: {
              Medico: {
                Especialidad: { especialidad },
                Usuario: {
                  nombre: nombreMedico,
                  ap_paterno: paternoMedico,
                  ap_materno: maternoMedico,
                },
              },
            },
          },
        }) => {
          const costo =
            (await fetchConsultaCost(
              "Consulta " + especialidad.toLowerCase()
            )) * 0.5;
          costoTotal += costo;
          const medico =
            nombreMedico + " " + paternoMedico + " " + maternoMedico;
          return {
            id_horario,
            fecha_hora_inicio,
            medico,
            costo,
          };
        }
      )
    );

    return res.json([
      [...dataSheduledAppointmets],
      { paciente, metodo_pago, costoTotal },
    ]);
  } catch (error) {
    console.log(error);
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

recepcionistaController.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { no_empleado, correo, nombre, ap_paterno, ap_materno, password } =
      req.body;

    await Usuario.create(
      {
        correo: correo,
        tipo_usuario: "Recepcionista",
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

recepcionistaController.setSchedule = async (req, res) => {
  try {
    const { consultorio, fecha_hora_inicio, fecha_hora_final } = req.body;

    const horarioExistente = await HorarioConsultorio.findOne({
      where: {
        consultorio: consultorio,
        fecha_hora_inicio: fecha_hora_inicio,
        fecha_hora_final: fecha_hora_final,
      },
    });

    if (!horarioExistente) {
      await HorarioConsultorio.create({
        consultorio: consultorio,
        fecha_hora_inicio: fecha_hora_inicio,
        fecha_hora_final: fecha_hora_final,
      });
      return res.status(201).json({ message: "Horario dado de alta" });
    } else {
      return res.status(400).json({ message: "Horario ya existente" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

recepcionistaController.getAppointmentsToday = async (req, res) => {
  try {
    const timeStart = new Date();
    const timeEnd = new Date();
    timeStart.setHours(7, 0, 0, 0);
    timeEnd.setHours(20, 0, 0, 0);

    const citas = await Cita.findAll({
      where: {
        status: 1,
      },
      include: {
        model: HorarioConsultorio,
        where: {
          fecha_hora_inicio: {
            [Sequelize.Op.and]: [
              { [Sequelize.Op.lte]: timeEnd },
              { [Sequelize.Op.gte]: timeStart },
            ],
          },
        },
      },
    });

    return res.json(citas);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = recepcionistaController;
