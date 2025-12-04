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

  // -----------------------------------------------
  // CREATE USER
  // -----------------------------------------------
  describe('createUser', () => {
    it('devrait créer un utilisateur et retourner 201 + user nettoyé', async () => {
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

    it("devrait retourner 409 si l'email existe déjà", async () => {
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

    it('devrait retourner 409 en cas de création impossible', async () => {
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
});
