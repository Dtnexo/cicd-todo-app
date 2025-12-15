describe('Navigation', () => {
  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.visit('/');
  });

  it('je peux naviguer entre les pages publiques', () => {
    // Je clique sur le lien vers l’accueil (logo ou lien principal)
    cy.get('a[href="/"]').first().click();

    // Si je ne suis pas connecté, je suis redirigé vers la page de login
    cy.url().should('eq', Cypress.config().baseUrl + '/login');
  });

  it('je peux activer et désactiver le mode sombre', () => {
    // Par défaut, le mode clair est actif
    cy.get('html').should('not.have.class', 'dark');

    // J’active le mode sombre
    cy.get('#theme-toggle').click();
    cy.get('html').should('have.class', 'dark');

    // Je repasse en mode clair
    cy.get('#theme-toggle').click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('je peux accéder aux routes protégées uniquement en étant connecté', () => {
    // J’essaie d’accéder au profil sans être connecté
    cy.visit('/profile');

    // Je dois être redirigé vers la page de connexion
    cy.url().should('include', '/login');

    // Je vérifie que le menu profil n’est pas visible
    cy.visit('/');
    cy.get('.profile-menu').should('not.exist');

    // Je crée un utilisateur via l’API
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'nav@test.com',
      password: 'Password123!',
      name: 'Nav User'
    });

    // Je me connecte avec cet utilisateur
    cy.visit('/login');
    cy.get('input[name="email"]').type('nav@test.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Une fois connecté, le menu profil doit être visible
    cy.get('.profile-menu').should('exist');
  });
});
