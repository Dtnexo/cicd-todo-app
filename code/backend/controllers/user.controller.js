const bcrypt = require('bcrypt');

const cleanUser = (user) => {
  // eslint-disable-next-line no-unused-vars
  const { password, ...cleanedUser } = user.get({ plain: true });
  return cleanedUser;
};

const UserController = {
  createUser: async (req, res) => {
    const { email, password } = req.body;
    const { User } = req.app.locals.models;

    try {
      const result = await User.create({
        email: email.toLowerCase(),
        password: await bcrypt.hash(password, 8)
      });
      return res.status(201).json({ user: cleanUser(result) });
    } catch (error) {
      if (error && error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Un compte avec cet email exist déjà !' });
      }
      console.error('ADD USER: ', error);
      return res.status(409).json({ message: "Erreur lors de l'inscription !" });
    }
  },
  getUser: async (req, res) => {
    const user_id = req.sub;
    const { User } = req.app.locals.models;

    await User.findOne({
      where: { id: user_id },
      attributes: { exclude: ['id', 'password'] }
    })
      .then((result) => {
        if (result) {
          return res.status(200).json({ user: result });
        } else {
          return res.status(404);
        }
      })
      .catch((error) => {
        console.error('GET USER: ', error);
        return res.status(500);
      });
  },
  editUser: async (req, res) => {
    const user_id = req.sub;
    const query = { id: user_id };
    const data = req.body;
    const { User } = req.app.locals.models;

    const user = await User.findOne({ where: query });
    if (user) {
      user.name = data.name ? data.name : null;
      user.address = data.address ? data.address : null;
      
      if (data.zip && isNaN(data.zip)) {
        return res.status(400).json({ message: "Le code postal doit être un nombre." });
      }
      user.zip = data.zip ? data.zip : null;
      user.location = data.location ? data.location : null;
      await user
        .save()
        .then((result) => {
          return res.status(200).json({ user: cleanUser(result) });
        })
        .catch((error) => {
          console.error('UPDATE USER: ', error);
          return res.status(500);
        });
    } else {
      return res.status(404);
    }
  },
  deleteCurrentUser: async (req, res) => {
    const user_id = req.sub;
    const query = { id: user_id };
    const { User } = req.app.locals.models;

    await User.destroy({
      where: query
    })
      .then(() => {
        return res.status(200).json({ id: user_id });
      })
      .catch((error) => {
        console.error('DELETE USER: ', error);
        return res.status(500);
      });
  }
};

module.exports = UserController;
