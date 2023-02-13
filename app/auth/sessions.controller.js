//imports
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//variable zone
const User = db.usuarios;
const saltRounds = 10;
const TOKEN_SECRET = "secretKey";
const blacklist = [];

exports.auth = async (req, res) => {
  // Capture the input fields
  let username = req.body.username;
  let password = req.body.password;

  // Ensure the input fields exists and are not empty
  if (username && password) {
    // If the account exists
    User.find({
      nombre: username,
    }).then((data) => {
      console.log(data);
      if (data.length == 1) {
        bcrypt.compare(password, data[0].password, function (err, result) {
          if (err) {
            console.log("Error:", err);
          } else if (result) {
            console.log("Passwords match");

            // crear token
            const token = jwt.sign(
              // datos de carga útil
              {
                nombre: username,
                loggedin: true,
                role: data[0].admin,
              },
              TOKEN_SECRET,{expiresIn: '1y'}
            );

            res.header("auth-token", token).json({ datos: { token } });

            // Redirect to home page
            //res.redirect("/login/home");
            res.end();
          } else {
            res.send("Usuario y/o Contraseña Incorrecta");
          }
          // res.redirect("/login.html");
        });
      } else {
        res.status(401).send("Usuario No encontado");
      }
      //res.end();
    });
  } else {
    res.send("Por favor ingresa Usuario y Contraseña!");
    res.end();
  }
};

exports.home = (req, res) => {
  // If the user is loggedin
  if (req.session.loggedin) {
    // Output username
    res.send(
      "Te has logueado satisfactoriamente;  " + req.session.username + "!"
    );
  } else {
    // Not logged in
    res.status(401).send("¡Inicia sesión para ver esta página!");
  }
  res.end();
};

exports.logOut = (req, res) => {
  // If the user is logged in
  if (!req.session.loggedin) {
    res
      .status(401)
      .send("no puedes cerrar sesion debido a que no estas logueado!");
  } else {
    // Not logged in
    console.log(req.session.username, "se esta desonectando");
    req.session.destroy((err) => {
      res.redirect("/"); // will always fire after session is destroyed
      //res.end("has cerrado sesion satisfactoriamente!");
      res.end();
    });
  }
};
