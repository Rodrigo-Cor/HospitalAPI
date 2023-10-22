require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const usersRouter = require("./routes/users");
const pacientesRouter = require("./routes/pacientes");
const medicosRouter = require("./routes/medicos");
const recepcionistaRouter = require("./routes/recepcionistas");
const citasRouter = require("./routes/citas");

const app = express();

app.set("port", process.env.PORT || 3000);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/users", usersRouter);
app.use("/pacientes", pacientesRouter);
app.use("/medicos", medicosRouter);
app.use("/recepcionistas", recepcionistaRouter);
app.use("/citas", citasRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
