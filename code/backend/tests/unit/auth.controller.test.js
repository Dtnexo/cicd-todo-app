jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const AuthController = require('../../controllers/auth.controller');

describe('AuthController.loginUser', () => {
  let req;
  let res;
  let User;

  beforeEach(() => {
    req = {
      body: {},
      app: {
        locals: {
          models: {
            User: {
              findOne: jest.fn()
            }
          }
        }
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User = req.app.locals.models.User;

    jest.clearAllMocks();
  });

  test("devrait renvoyer 404 si l'utilisateur n'existe pas", async () => {
    // Arrange
    req.body.email = 'email@test.com';
    req.body.password = 'password123';

    User.findOne.mockResolvedValue(null);

    // Act
    await AuthController.loginUser(req, res);

    // Assert
    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: 'email@test.com' }
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Ce compte n'existe pas !"
    });
  });

  test('devrait renvoyer 400 si le mot de passe est incorrect', async () => {
    // Arrange
    req.body.email = 'email@test.com';
    req.body.password = 'wrongpassword';

    const fakeUser = {
      id: 1,
      password: 'hashedpass',
      get: jest.fn().mockReturnValue({ id: 1, email: 'email@test.com' })
    };

    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compareSync.mockReturnValue(false);

    // Act
    await AuthController.loginUser(req, res);

    // Assert
    expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongpassword', 'hashedpass');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Mauvais email ou mot de passe!'
    });
  });

  test('devrait renvoyer 200 + token si login valide', async () => {
    // Arrange
    req.body.email = 'email@test.com';
    req.body.password = 'password123';

    // User Sequelize mock
    const fakeUser = {
      id: 1,
      password: 'hashedpass',
      get: jest.fn().mockReturnValue({
        id: 1,
        email: 'email@test.com',
        username: 'didi',
        password: 'hashedpass'
      })
    };

    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compareSync.mockReturnValue(true);

    jsonwebtoken.sign.mockReturnValue('faketoken123');

    // Act
    await AuthController.loginUser(req, res);

    // Assert
    expect(jsonwebtoken.sign).toHaveBeenCalledWith(
      {},
      expect.any(String),
      expect.objectContaining({
        subject: '1',
        expiresIn: expect.any(Number),
        algorithm: 'RS256'
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: 1,
        email: 'email@test.com',
        username: 'didi'
      },
      token: 'faketoken123'
    });
  });

  test('devrait renvoyer 400 si une erreur survient', async () => {
    // Arrange
    req.body.email = 'email@test.com';
    req.body.password = 'password123';

    User.findOne.mockRejectedValue(new Error('DB error'));

    console.error = jest.fn(); // éviter spam console

    // Act
    await AuthController.loginUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(null);
  });
});
