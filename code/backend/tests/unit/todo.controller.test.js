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

    /**
     * TC_U002: Modification d'un Todo
     */
    test('[200] TC_U002: Devrait modifier un todo avec succès', async () => {
        // Arrange
        req.params.id = 1;
        req.body = { text: 'Updated Task', completed: true };
        
        const existingTodo = {
            id: 1,
            text: 'Old Task',
            completed: false,
            user_id: 1,
            save: jest.fn().mockResolvedValue(true) 
        };

        mockTodoModel.findOne.mockResolvedValue(existingTodo);

        // Act
        await TodoController.editTodo(req, res);

        // Assert
        expect(mockTodoModel.findOne).toHaveBeenCalledWith({ where: { id: 1, user_id: 1 } });
        expect(existingTodo.text).toBe('Updated Task');
        expect(existingTodo.completed).toBe(true);
        expect(existingTodo.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(existingTodo);
    });

    test('[404] TC_U002: Devrait renvoyer 404 si le todo à modifier est introuvable', async () => {
        // Arrange
        req.params.id = 999;
        mockTodoModel.findOne.mockResolvedValue(null);

        // Act
        await TodoController.editTodo(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
    });

    /**
     * TC_U003: Suppression d'un Todo
     */
    test('[200] TC_U003: Devrait supprimer un todo avec succès', async () => {
        // Arrange
        req.params.id = 1;
        mockTodoModel.destroy.mockResolvedValue(1);

        // Act
        await TodoController.deleteTodo(req, res); 

        // Assert
        expect(mockTodoModel.destroy).toHaveBeenCalledWith({ where: { id: 1, user_id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });
