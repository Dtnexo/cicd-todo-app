describe('User E2E', () => {
  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should create a new account', () => {
    cy.visit('/register');
    const uniqueEmail = `user_${Date.now()}@e2e.com`;
    
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmation"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Login to verify account creation
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.get('.profile-menu').should('exist');
  });

  it('should fail to create an account if email already exists', () => {
    const email = 'dupe@e2e.com';
    // Seed user
    cy.request('POST', 'http://localhost:3000/api/user', {
      email,
      password: 'Password123!',
      name: 'Existing User'
    });

    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmation"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.contains('An error occurred').should('be.visible');
  });

  it('should view current user profile', () => {
    // Setup: Create and Login
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'profile@e2e.com',
      password: 'Password123!',
      name: 'Profile User'
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type('profile@e2e.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.visit('/profile');
    cy.get('p').contains('profile@e2e.com');
  });

  it('should update user profile', () => {
    // Setup: Create and Login
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'update@e2e.com',
      password: 'Password123!',
      name: 'Update User'
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type('update@e2e.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.visit('/profile');
    
    cy.get('input[name="name"]').clear().type('Updated Name');
    cy.get('input[name="address"]').clear().type('123 Cypress St');
    cy.get('input[name="zip"]').clear().type('1235');
    cy.get('input[name="location"]').clear().type('Lausanne');
    
    cy.contains("Modifier").click();

    cy.contains("Succès! Profile updated.").should('be.visible');
    
    // Verify persistence
    cy.reload();
    cy.get('input[name="name"]').should('have.value', 'Updated Name');
    cy.get('input[name="address"]').should('have.value', '123 Cypress St');
    cy.get('input[name="zip"]').should('have.value', '1235');
    cy.get('input[name="location"]').should('have.value', 'Lausanne');
  });

  it("should delete user account", () => {
    // Setup: Create and Login
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'delete@e2e.com',
      password: 'Password123!',
      name: 'Delete User'
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type('delete@e2e.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.visit('/profile');
    
    cy.get('a').contains("Supprimer votre compte").click();
    cy.get('button').contains("Confirmer").click();

    // Verify redirected to login or home and cannot login
    cy.visit('/login');
    cy.get('input[name="email"]').type('delete@e2e.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    cy.contains("Ce compte n'existe pas !").should('be.visible');
  });
});
