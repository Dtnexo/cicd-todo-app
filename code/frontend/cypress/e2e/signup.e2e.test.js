describe('Flux d’inscription', () => {
  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.visit('/register');
  });

  it('les erreurs de validation s’affichent avec des données invalides', () => {
    // Je soumets le formulaire vide pour déclencher les validations
    cy.get('button[type="submit"]').click();
    
    // Le message de champ requis doit s’afficher
    cy.contains('Vous devez renseigner ce champ').should('be.visible');

    // Email invalide
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Format email incorrect').should('be.visible');

    // Mot de passe trop court
    cy.get('input[name="password"]').type('short');
    cy.get('button[type="submit"]').click();
    cy.contains('Le mot de passe doit faire au moins 8 caractères').should('be.visible');

    // Confirmation du mot de passe incorrecte
    cy.get('input[name="password"]').clear().type('ValidPass123!');
    cy.get('input[name="confirmation"]').type('DifferentPass123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Les mots de passe ne correspondent pas').should('be.visible');
  });

  it('je peux créer un nouveau compte avec des informations valides', () => {
    const email = 'newuser@test.com';
    const password = 'Password123!';

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmation"]').type(password);
    
    cy.get('button[type="submit"]').click();

    // Je suis redirigé vers la page de connexion
    cy.url().should('include', '/login');
    cy.contains('Connectez-vous').should('be.visible');
  });

  it('une erreur s’affiche si le compte existe déjà', () => {
    // Je crée un utilisateur existant via l’API
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'existing@test.com',
      password: 'Password123!',
      name: 'Existing User'
    });

    cy.get('input[name="email"]').type('existing@test.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmation"]').type('Password123!');
    
    cy.get('button[type="submit"]').click();

    // Un message d’erreur doit s’afficher
    cy.get('p span').should('contain', 'An error occurred'); 
  });
});
