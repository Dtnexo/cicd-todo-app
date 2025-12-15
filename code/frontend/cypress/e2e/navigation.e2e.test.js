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
    cy.get('.profile-menu').should('exist');
  });
});
