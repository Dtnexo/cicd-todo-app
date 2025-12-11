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

 
});
