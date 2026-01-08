describe('Gestion du profil', () => {
  const user = {
    email: 'profile@test.com',
    password: 'Password123!',
    name: 'Nom original'
  };

  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Je crée un utilisateur via l’API
    cy.request('POST', 'http://localhost:3000/api/user', user);
    
    // Je me connecte
    cy.visit('/login');
    cy.get('input[name="email"]').clear().type(user.email);
    cy.get('input[name="password"]').clear().type(user.password);
    cy.get('button[type="submit"]').click();
    
    // Je vais sur la page profil
    cy.get('.profile-menu button').click();
    cy.contains('Mon Profil').click();
    cy.url().should('include', '/profile');
  });

  it('mes informations utilisateur actuelles sont affichées', () => {
    cy.get('p').should('contain', user.email);
  });

  it('je peux modifier les informations de mon profil', () => {
    const newName = 'Nom modifié';
    const newAddress = '123 Test St';
    const newZip = '1234';
    const newLocation = 'Ville test';

    cy.get('input[name="name"]').clear().type(newName);
    cy.get('input[name="address"]').clear().type(newAddress);
    cy.get('input[name="zip"]').clear().type(newZip);
    cy.get('input[name="location"]').clear().type(newLocation);

    cy.contains('button', 'Modifier').click();

    // Un message de succès doit s’afficher
    cy.contains('Succès!').should('be.visible');

    // Je recharge la page pour vérifier la persistance
    cy.reload();
    cy.get('input[name="name"]').should('have.value', newName);
    cy.get('input[name="address"]').should('have.value', newAddress);
  });

  it('je peux supprimer mon compte utilisateur', () => {
    cy.contains('Supprimer votre compte').click();
    
    // La fenêtre de confirmation doit apparaître
    cy.contains(
      'La suppression de votre compte supprime aussi tous vos todo. Êtes-vous certain ?'
    ).should('be.visible');

    cy.get('button').contains('Confirmer').click();
    
    // Je suis déconnecté et redirigé vers la page de login
    cy.url().should('eq', Cypress.config().baseUrl + '/login');
    cy.get('.profile-menu').should('not.exist');

    // Une nouvelle tentative de connexion doit échouer
    cy.visit('/login');
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button[type="submit"]').click();
    cy.contains("Ce compte n'existe pas !").should('exist');
  });
});
