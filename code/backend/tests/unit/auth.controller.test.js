const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

// Mock Configuration Keys BEFORE importing controller
jest.mock('../../config/keys', () => ({
    JWT_SECRET: 'test_secret_key',
    JWT_PUBLIC: 'test_public_key'
}));

const AuthController = require('../../controllers/auth.controller');

// Mocks
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController Unit Tests - Login', () => {
    let req, res, mockUser;

    beforeEach(() => {
        jest.clearAllMocks();

        mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'hashed_password',
            get: jest.fn().mockReturnValue({ 
                id: 1, 
                email: 'test@example.com', 
                username: 'TestUser' 
            })
        };

        req = {
            body: {
                email: 'test@example.com',
                password: 'password123' 
            },
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
    });

    /**
     * TC_U001: Authentification
     */
    test('[404] Devrait renvoyer 404 si l’utilisateur n’existe pas', async () => {
        // Arrange
        req.app.locals.models.User.findOne.mockResolvedValue(null);

        // Act
        await AuthController.loginUser(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Ce compte n'existe pas !" });
    });

    test('[400] Devrait renvoyer 400 si le mot de passe est incorrect', async () => {
        // Arrange
        req.app.locals.models.User.findOne.mockResolvedValue(mockUser);
        bcrypt.compareSync.mockReturnValue(false);

        // Act
        await AuthController.loginUser(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mauvais email ou mot de passe!' });
    });


    test('[200] Devrait renvoyer 200 et un jeton si la connexion réussit', async () => {
        // Arrange
        req.app.locals.models.User.findOne.mockResolvedValue(mockUser);
        bcrypt.compareSync.mockReturnValue(true); 
        jsonwebtoken.sign.mockReturnValue('fake_jwt_token');

        // Act
        await AuthController.loginUser(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            user: {
                id: 1,
                email: 'test@example.com',
                username: 'TestUser'
            },
            token: 'fake_jwt_token'
        });
        
        expect(jsonwebtoken.sign).toHaveBeenCalledWith(
            {}, 
            'test_secret_key', 
            expect.objectContaining({ subject: '1' })
        );
    });

    test('[400] Devrait gérer les erreurs de base de données', async () => {
        // Arrange
        req.app.locals.models.User.findOne.mockRejectedValue(new Error('DB Connection Failed'));
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Act
        await AuthController.loginUser(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(null);

        consoleSpy.mockRestore();
    });
});

