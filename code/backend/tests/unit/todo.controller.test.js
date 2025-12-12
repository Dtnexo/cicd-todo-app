const TodoController = require('../../controllers/todo.controller');

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

    /**
     * TC_U004: Rechercher un todo
     */
    test('[200] TC_U004: Devrait rechercher un todo avec succès', async () => {
        // Arrange
        req.query.q = 'Meeting';
        const searchResults = [
            { id: 1, text: 'Meeting with team', date: '2025-12-01' }
        ];
        mockTodoModel.findAll.mockResolvedValue(searchResults);

        // Act
        await TodoController.getSearchTodo(req, res);

        // Assert
        expect(mockTodoModel.findAll).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.arrayContaining([
                { user_id: 1 },
                expect.anything()
            ])
        }));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(searchResults);
    });

    /**
     * TC_U005: Obtenir tous les todos du user
     */
    test('[200] TC_U005: Devrait obtenir tous les todos', async () => {
        // Arrange
        const userTodos = [
            { id: 1, text: 'Task 1' },
            { id: 2, text: 'Task 2' }
        ];
        mockTodoModel.findAll.mockResolvedValue(userTodos);

        // Act
        await TodoController.getAllTodo(req, res);

        // Assert
        expect(mockTodoModel.findAll).toHaveBeenCalledWith({
            where: { user_id: 1 },
            order: [['date', 'ASC']],
            attributes: { exclude: ['user_id'] }
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(userTodos);
    });
});
