const UserController = require('../../controllers/user.controller');
const bcrypt = require('bcrypt');

jest.mock('bcrypt');

// Utilitaire pour mocker req & res
const mockRequest = (body = {}, params = {}, sub = null) => ({
  body,
  params,
  sub,
  app: {
    locals: {
      models: {
        User: {}
      }
    }
  }
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  let req;
  let res;
  let User;

  beforeEach(() => {
    res = mockResponse();

    // Mock du modèle Sequelize User
    User = {
      create: jest.fn(),
      findOne: jest.fn(),
      destroy: jest.fn()
    };

    req = mockRequest();
    req.app.locals.models.User = User;

    jest.clearAllMocks();
  });

  // CREATE USER
  describe('createUser', () => {
    test('devrait créer un utilisateur et retourner 201 + user nettoyé', async () => {
      // Arrange
      req.body = { email: 'Test@Test.com', password: 'pass123' };
      bcrypt.hash.mockResolvedValue('hashedPass');

      const fakeUser = {
        get: () => ({ email: 'test@test.com', password: 'hashedPass' })
      };
      User.create.mockResolvedValue(fakeUser);

      // Act
      await UserController.createUser(req, res);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'hashedPass'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: { email: 'test@test.com' }
      });
    });

    test("devrait retourner 409 si l'email existe déjà", async () => {
      // Arrange
      const error = new Error();
      error.name = 'SequelizeUniqueConstraintError';
      User.create.mockRejectedValue(error);

      req.body = { email: 'a@a.com', password: '123' };

      // Act
      await UserController.createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Un compte avec cet email exist déjà !'
      });
    });

    test("devrait retourner 409 si l'email existe déjà", async () => {
      // Arrange
      const error = new Error();
      error.name = 'SequelizeUniqueConstraintError';
      User.create.mockRejectedValue(error);

      req.body = { email: 'a@a.com', password: '123' };

      // Act
      await UserController.createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Un compte avec cet email exist déjà !'
      });
    });

    test('devrait retourner 409 en cas de création impossible', async () => {
      // Arrange
      User.create.mockRejectedValue(new Error());

      req.body = { email: 'a@a.com', password: '123' };

      // Act
      await UserController.createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de l'inscription !"
      });
    });
  });

  // GET USER
  describe('getUser', () => {
    test('devrait retourner 200 + user si trouvé', async () => {
      // Arrange
      req.sub = 1;

      const fakeUser = { id: 1, email: 'test@test.com' };
      User.findOne.mockResolvedValue(fakeUser);

      // Act
      await UserController.getUser(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        attributes: { exclude: ['id', 'password'] }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
    });

    test('devrait retourner 404 si introuvable', async () => {
      // Arrange
      req.sub = 2;
      User.findOne.mockResolvedValue(null);

      // Act
      await UserController.getUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('devrait retourner 500 en cas de crash', async () => {
      // Arrange
      req.sub = 2;
      User.findOne.mockRejectedValue(new Error());

      // Act
      await UserController.getUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // EDIT USER
  describe('editUser', () => {
    test('devrait mettre à jour un user et renvoyer 200', async () => {
      // Arrange
      req.sub = 1;
      req.body = { name: 'John', address: 'Rue X' };

      const fakeUser = {
        name: null,
        address: null,
        zip: null,
        location: null,

        save: jest.fn().mockResolvedValue({
          get: () => ({
            email: 'test@test.com',
            name: 'John',
            address: 'Rue X'
          })
        })
      };

      User.findOne.mockResolvedValue(fakeUser);

      // Act
      await UserController.editUser(req, res);

      // Assert
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { email: 'test@test.com', name: 'John', address: 'Rue X' }
      });
    });

    test('devrait rejeter un zip non numérique avec 400', async () => {
      // Arrange
      req.sub = 1;
      req.body = { zip: 'pasUnNombre' };

      const fakeUser = {
        name: null,
        address: null,
        zip: null,
        location: null,
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(fakeUser);

      // Act
      await UserController.editUser(req, res);

      // Assert
      expect(fakeUser.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Le code postal doit être un nombre.'
      });
    });

    test('devrait retourner 404 si user non trouvé', async () => {
      req.sub = 10;
      User.findOne.mockResolvedValue(null);

      await UserController.editUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('devrait retourner 500 en cas de crash en sauvegarde', async () => {
      req.sub = 1;

      const fakeUser = {
        save: jest.fn().mockRejectedValue(new Error())
      };

      User.findOne.mockResolvedValue(fakeUser);

      await UserController.editUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // DELETE USER
  describe('deleteCurrentUser', () => {
    test('devrait supprimer un user et renvoyer 200', async () => {
      req.sub = 3;
      User.destroy.mockResolvedValue(1);

      await UserController.deleteCurrentUser(req, res);

      expect(User.destroy).toHaveBeenCalledWith({
        where: { id: 3 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 3 });
    });

    test('devrait retourner 500 en cas de crash', async () => {
      req.sub = 3;
      User.destroy.mockRejectedValue(new Error());

      await UserController.deleteCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
