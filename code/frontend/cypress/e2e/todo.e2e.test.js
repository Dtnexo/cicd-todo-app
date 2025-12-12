describe('Todo E2E', () => {
  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Seed User
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'todo@e2e.com',
      password: 'Password123!',
      name: 'Todo User'
    });

    // Login
    cy.visit('/login');
    cy.get('input[name="email"]').type('todo@e2e.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete
    cy.get('.profile-menu').should('exist');
  });

  it('should create a todo', () => {
    const todoText = 'Test Todo';
    cy.get('.tiptap div[contenteditable]').type(todoText);
    
    // Datepicker interaction: ensure we trigger the update
    cy.get('input[name="date"]').type('25/12/2025{enter}', {force: true}); 

    cy.contains("Ajouter la tâche").click();

    // Verify it appears in the list specifically
    cy.get('ul[role="list"]').should('contain', todoText);
  });
/*
  it('should list and search todos', () => {
    // Create 2 todos
    const todo1 = 'Buy Milk';
    const todo2 = 'Walk Dog';
    
    // Todo 1
    cy.get('.tiptap div[contenteditable]').type(todo1);
    cy.get('input[name="date"]').type('25/12/2025{enter}', {force: true});
    cy.contains("Ajouter la tâche").click();
    cy.get('ul[role="list"]').should('contain', todo1); 
    cy.get('.tiptap div[contenteditable]').clear();
    
    // Todo 2
    cy.get('.tiptap div[contenteditable]').type(todo2);
    cy.get('input[name="date"]').type('26/12/2025{enter}', {force: true});
    cy.contains("Ajouter la tâche").click();
    cy.get('ul[role="list"]').should('contain', todo2);

    // Search for Todo 1
    cy.get('input[placeholder="Rechercher ..."]').type('Milk');
    
    // Wait for filter
    cy.get('ul[role="list"]').should('contain', todo1);
    cy.get('ul[role="list"]').should('contain', todo2);

    // Clear search
    cy.get('button.close-button').click();
    cy.get('ul[role="list"]').should('contain', todo1);
    cy.get('ul[role="list"]').should('not.contain', todo2);
  });
  */
  it('should update state of a todo', () => {
    // Create todo
    cy.get('.tiptap div[contenteditable]').type('Update Todo');
    cy.get('input[name="date"]').type('25/12/2025{enter}', {force: true});
    cy.contains("Ajouter la tâche").click();
    cy.get('ul[role="list"]').should('contain', 'Update Todo');

    // Toggle it
    cy.contains('Update Todo').get('div[class="text-gray-600 dark:text-gray-700 text-center font-bold w-8 border-box whitespace-nowrap select-none pl-1 pr-1 ml-[8px] mr-[15px]"]').click();

    // Verify border color change (red for done) matches class in TodoItem
    cy.contains('Update Todo').get('div[class="text-gray-600 dark:text-gray-700 text-center font-bold w-8 border-box whitespace-nowrap select-none pl-1 pr-1 ml-[8px] mr-[15px]"]').should('contain','Done');
  });

  it('should delete a todo', () => {
    cy.get('.tiptap div[contenteditable]').type('Delete Todo');
    cy.get('input[name="date"]').type('25/12/2025{enter}', {force: true});
    cy.contains("Ajouter la tâche").click();
    cy.get('.tiptap div[contenteditable]').clear();
    cy.get('ul[role="list"]').should('contain', 'Delete Todo');

    // Find the trash icon
    cy.get('svg[class="h-5 w-5 stroke-gray-600 dark:stroke-white hover:stroke-black cursor-pointer"]').click();

    cy.contains('Delete Todo').should('not.exist');
  });
});
