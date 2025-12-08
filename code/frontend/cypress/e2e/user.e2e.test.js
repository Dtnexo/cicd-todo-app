describe('User E2E', () => {
  beforeEach(() => {
    cy.task('clearDB');
    // Login before each test
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'user@e2e.com',
      password: 'Password123!',
      name: 'User E2E'
    });
    
    // Visit login and log in via UI to set cookies/localStorage
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@e2e.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.get('.profile-menu').should('exist');
  });

  it('should view current user profile', () => {
    cy.visit('/profile'); // Adjust path if needed
    
    cy.get('p').contains('user@e2e.com');
  });

  it('should update user profile', () => {
    cy.visit('/profile');
    
    cy.get('input[name="name"]').clear().type('Updated Name');
    cy.get('input[name="address"]').clear().type('123 Cypress St');
    cy.get('input[name="zip"]').clear().type('1235');
    cy.get('input[name="location"]').clear().type('Lausanne');
    
    cy.contains(/modifier|update/i).click();

    cy.contains(/succès|updated/i).should('be.visible');
    
    // Verify persistence
    cy.reload();
    cy.get('input[name="name"]').should('have.value', 'Updated Name');
    cy.get('input[name="address"]').should('have.value', '123 Cypress St');
    cy.get('input[name="zip"]').should('have.value', '1235');
    cy.get('input[name="location"]').should('have.value', 'Lausanne');
  });

  it('should delete user profile', () => {
    cy.visit('/profile');
    
    cy.get('a').contains("Supprimer votre compte").click();
    cy.get('button').contains("Confirmer").click();

    cy.visit('/login');
    cy.get('input[name="email"]').type('user@e2e.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    cy.get('.profile-menu').should('not.exist');
  });
});
