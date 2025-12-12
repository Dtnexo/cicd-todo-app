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

    // Toggle it by finding the "To Do" label within the specific list item
    cy.contains('li', 'Update Todo')
      .find('div')
      .contains('To Do')
      .click({ force: true });

    // Verify change to "Done" within the same list item
    cy.contains('li', 'Update Todo')
      .should('contain', 'Done');
  });

  it('should delete a todo', () => {
    cy.get('.tiptap div[contenteditable]').type('Delete Todo');
    cy.get('input[name="date"]').type('25/12/2025{enter}', {force: true});
    cy.contains("Ajouter la tâche").click();
    cy.get('.tiptap div[contenteditable]').clear();
    cy.get('ul[role="list"]').should('contain', 'Delete Todo');

    // Find the trash icon within the specific list item
    cy.contains('li', 'Delete Todo')
      .find('svg.cursor-pointer') // The trash icon has cursor-pointer class
      .click();

    cy.contains('Delete Todo').should('not.exist');
  });
});
