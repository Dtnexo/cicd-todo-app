const TodoController = require('../../controllers/todo.controller');
const { Sequelize } = require('sequelize');

// Mock Sequelize to avoid DB connection issues and support literal
jest.mock('sequelize', () => {
    const ActualSequelize = jest.requireActual('sequelize');
    return {
        ...ActualSequelize,
        Sequelize: {
            ...ActualSequelize.Sequelize,
            literal: jest.fn().mockImplementation((val) => val)
        }
    };
});

describe('TodoController Unit Tests', () => {
    let req, res, mockTodoModel;

    beforeEach(() => {
        jest.clearAllMocks();

        mockTodoModel = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            destroy: jest.fn()
        };
        
        req = {
            sub: 1,
            body: {},
            params: {},
            query: {},
            app: {
                locals: {
                    models: {
                        Todo: mockTodoModel
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
     * TC_U001: Création d'un Todo
     */
    test('[201] TC_U001: Devrait créer un todo avec succès', async () => {
        // Arrange
        req.body = { text: 'New Task', date: '2025-12-01' };
        const createdTodo = { id: 1, text: 'New Task', completed: false, user_id: 1 };
        mockTodoModel.create.mockResolvedValue(createdTodo);

        // Act
        await TodoController.createTodo(req, res);

        // Assert
        expect(mockTodoModel.create).toHaveBeenCalledWith({
            text: 'New Task',
            date: '2025-12-01',
            completed: false,
            user_id: 1
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdTodo);
    });

