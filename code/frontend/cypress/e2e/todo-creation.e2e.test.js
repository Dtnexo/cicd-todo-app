describe('Création de tâches', () => {
  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Je crée un utilisateur et je me connecte
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'todo@test.com',
      password: 'Password123!',
      name: 'Todo User'
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type('todo@test.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.get('.profile-menu').should('exist');
  });

  it('une erreur de validation s’affiche si le formulaire est vide', () => {
    cy.contains('Ajouter la tâche').click();
    cy.contains('Veuillez renseigner tous les champs').should('be.visible');
  });

  it('je peux créer une nouvelle tâche correctement', () => {
    const todoText = 'New E2E Todo';
    const todoDate = '25/12/2025';

    // Je saisis le contenu de la tâche
    cy.get('.tiptap div[contenteditable]').type(todoText);
    
    // Je saisis la date
    cy.get('input[name="date"]').type(`${todoDate}{enter}`, { force: true });

    // Je valide la création
    cy.contains('Ajouter la tâche').click();

    // La tâche doit apparaître dans la liste
    cy.get('ul[role="list"]').should('contain', todoText);
  });
});
