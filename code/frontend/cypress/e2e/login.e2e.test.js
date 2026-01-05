describe('Flux de connexion et déconnexion', () => {
  const user = {
    email: 'login@test.com',
    password: 'Password123!',
    name: 'Utilisateur Login'
  };

  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Je crée un utilisateur avant chaque test
    cy.visit('/register');
    cy.url().should('include', '/register');
    cy.get('input[name="email"]').clear().type(user.email);
    cy.get('input[name="password"]').clear().type(user.password);
    cy.get('input[name="confirmation"]').clear().type(user.password);
    cy.get('button[type="submit"]').click();
    cy.visit('/login');
  });

  it('je peux me connecter avec des identifiants valides', () => {
    cy.get('input[name="email"]').clear().type(user.email);
    cy.get('input[name="password"]').clear().type(user.password);
    cy.get('button[type="submit"]').click();

    // Je vérifie que je suis bien redirigé et connecté
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('.profile-menu').should('exist');
  });

  it('la connexion échoue avec des identifiants invalides', () => {
    cy.get('input[name="email"]').clear().type(user.email);
    cy.get('input[name="password"]').clear().type('WrongPassword');
    cy.get('button[type="submit"]').click();
    
    // Un message d’erreur doit s’afficher
    cy.get('p span').should('be.visible'); 
  });

  it('je peux me déconnecter correctement', () => {
    // Je me connecte d’abord
    cy.get('input[name="email"]').clear().type(user.email);
    cy.get('input[name="password"]').clear().type(user.password);
    cy.get('button[type="submit"]').click();
    cy.get('.profile-menu').should('exist');

    // Je lance la déconnexion
    cy.get('.profile-menu button').click();
    cy.contains('a', 'Déconnexion').click();

    // Je vérifie que je suis bien déconnecté
    cy.get('.profile-menu').should('not.exist');
    cy.location('pathname').should('eq', '/login');
  });
});
