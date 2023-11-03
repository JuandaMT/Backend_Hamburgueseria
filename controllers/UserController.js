const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config/keys.js");
const bcrypt = require("bcrypt");

const UserController = {
  async register(req, res, next) {
    try {
      const user = await User.create(req.body);
      res.status(201).send({ message: "Usuario registrado con éxito", user });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res) {
    /* NO SE SI FUNCIONA */
    /* ESTE CÓDIGO DEBERIA DE COMPROBAR QUE EL USUARIO Y CONTRASEÑA COINCIDE */
    /*   try {
      const user = await User.findOne({ email: req.body.email });

      if (user) {
        // Comprobar la contraseña proporcionada por el usuario con la contraseña almacenada
        const isPasswordValid = await bcrypt.compare(
          req.body.password,
          user.password
        );

        if (isPasswordValid) {
          const token = jwt.sign({ _id: user._id }, jwt_secret);
          if (user.tokens.length > 4) user.tokens.shift();
          user.tokens.push(token);
          await user.save();
          res.send({ message: "Bienvenid@ " + user.name, token });
        } else {
          // Contraseña incorrecta
          res.status(401).send({ message: "Contraseña incorrecta" });
        }
      } else {
        // Usuario no encontrado
        res.status(404).send({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error(error);
    }
  }, */
    try {
      const user = await User.findOne({
        email: req.body.email,
      });
      const token = jwt.sign({ _id: user._id }, jwt_secret);
      if (user.tokens.length > 4) user.tokens.shift();
      user.tokens.push(token);
      await user.save();
      res.send({ message: "Bienvenid@ " + user.name, token });
    } catch (error) {
      console.error(error);
    }
  },
  async logout(req, res) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { tokens: req.headers.authorization },
      });
      res.send({ message: "Desconectado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Hubo un problema al intentar desconectar al usuario",
      });
    }
  },
  async getInfo(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate("orderIds")
        .populate({
          path: "orderIds",
          populate: {
            path: "productIds",
          },
        })
        .populate("wishList");
      res.send(user);
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = UserController;
