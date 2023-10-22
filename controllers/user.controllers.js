const crypto = require("crypto-js");

const Usuario = require("../models/Usuarios.js");
const sequelize = require("../utils/database.util");

const userController = {};

const hashPassword = (password) => {
  try {
    return crypto.SHA256(password).toString();
  } catch (error) {
    console.log(error);
  }
};

userController.obtenerUsuarios = async (req, res) => {
    try {
      const usuarios = await Usuario.findAll();
      return res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  };
  
userController.verifyUser = async (req, res) => {
  const { nombre } = req.body;
  try {
    const Usuario = await Usuario.findOne({ where: { nombre: nombre } });
    if (Usuario) return res.status(400).json({ message: "El usuario ya existe" });

    return res.json({ message: "Usuario disponible" });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

userController.getConnection = async (req, res) => {
  try {
    console.log(process.env.HOST);
    console.log(process.env.DATABASE);
    console.log(process.env.Usuario);
    console.log(process.env.PASSWORD);
    await sequelize.authenticate();
    
    return res.json({ message: "Conexión exitosa" });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

userController.loginUser = async (req, res) => {
  const { correo, password } = req.body;
  try {
    const user = await Usuario.findOne({ where: { correo: correo } });
    
    if (!user) {
      return res.status(400).json({ message: "Registrate por favor" });
    }

    const isMatch = user.password === hashPassword(password); 
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
    
    return res.status(200).end();
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = userController;
