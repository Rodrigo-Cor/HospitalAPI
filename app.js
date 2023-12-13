require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const usersRouter = require("./routes/users");
const pacientesRouter = require("./routes/pacientes");
const medicosRouter = require("./routes/medicos");
const recepcionistaRouter = require("./routes/recepcionistas");
const citasRouter = require("./routes/citas");
const recetasRouter = require("./routes/recetas");

const app = express();

app.set("port", process.env.PORT || 4000);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/users", usersRouter);
app.use("/pacientes", pacientesRouter);
app.use("/medicos", medicosRouter);
app.use("/recepcionistas", recepcionistaRouter);
app.use("/citas", citasRouter);
app.use("/recetas",recetasRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

module.exports = app;
