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

    test('[500] Devrait gérer une erreur lors de la création', async () => {
        req.body = { text: 'New Task', date: '2025-12-01' };
        mockTodoModel.create.mockRejectedValue(new Error('DB Error'));

        await TodoController.createTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
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

    test('[500] Devrait gérer une erreur lors de la suppression', async () => {
        req.params.id = 1;
        mockTodoModel.destroy.mockRejectedValue(new Error('DB Error'));

        await TodoController.deleteTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
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

    test('[404] Devrait retourner 404 si la recherche ne donne rien', async () => {
        req.query.q = 'NonExistent';
        mockTodoModel.findAll.mockResolvedValue(null);

        await TodoController.getSearchTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('[500] Devrait gérer une erreur lors de la recherche', async () => {
        req.query.q = 'Error';
        mockTodoModel.findAll.mockRejectedValue(new Error('DB Error'));

        await TodoController.getSearchTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
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

    test('[404] Devrait retourner 404 si aucun todo n\'est trouvé', async () => {
        mockTodoModel.findAll.mockResolvedValue(null);

        await TodoController.getAllTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('[500] Devrait gérer une erreur lors de la récupération', async () => {
        mockTodoModel.findAll.mockRejectedValue(new Error('DB Error'));

        await TodoController.getAllTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    /**
     * TC_U002: Modifier un Todo
     */
    test('[200] TC_U002: Devrait modifier un todo avec succès (tous champs)', async () => {
        req.params.id = 1;
        req.body = { completed: true, text: 'Updated', date: '2026-01-01' };
        
        const mockTodo = {
            id: 1,
            text: 'Original',
            completed: false,
            date: '2025-12-01',
            save: jest.fn().mockResolvedValue(true)
        };
        mockTodoModel.findOne.mockResolvedValue(mockTodo);

        await TodoController.editTodo(req, res);

        expect(mockTodo.completed).toBe(true);
        expect(mockTodo.text).toBe('Updated');
        expect(mockTodo.date).toBe('2026-01-01');
        expect(mockTodo.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTodo);
    });

    test('[200] Devrait préserver les valeurs si non fournies', async () => {
        req.params.id = 1;
        req.body = {};
        
        const mockTodo = {
            id: 1,
            text: 'Original',
            completed: true,
            date: '2025-12-01',
            save: jest.fn().mockResolvedValue(true)
        };
        mockTodoModel.findOne.mockResolvedValue(mockTodo);

        await TodoController.editTodo(req, res);

        expect(mockTodo.text).toBe('Original');
        expect(mockTodo.date).toBe('2025-12-01');
        expect(mockTodo.completed).toBe(false); 
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('[404] Devrait retourner 404 si le todo à modifier n\'existe pas', async () => {
        req.params.id = 999;
        mockTodoModel.findOne.mockResolvedValue(null);

        await TodoController.editTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('[500] Devrait gérer une erreur lors de la modification', async () => {
        req.params.id = 1;
        const mockTodo = {
            save: jest.fn().mockRejectedValue(new Error('DB Error'))
        };
        mockTodoModel.findOne.mockResolvedValue(mockTodo);

        await TodoController.editTodo(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
