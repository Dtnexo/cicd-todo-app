describe('Gestion des tâches', () => {
  const todo1 = 'Buy Groceries';
  const todo2 = 'Walk the Dog';

  beforeEach(() => {
    cy.task('clearDB');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Je crée un utilisateur
    cy.request('POST', 'http://localhost:3000/api/user', {
      email: 'manage@test.com',
      password: 'Password123!',
      name: 'Manager'
    });

    // Je me connecte
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.get('input[name="email"]').type('manage@test.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    // Je crée deux tâches via l’interface pour garantir l’état
    cy.get('.tiptap div[contenteditable]').type(todo1);
    cy.get('input[name="date"]').type('01/01/2026{enter}', { force: true });
    cy.contains('Ajouter la tâche').click();
    cy.get('.tiptap div[contenteditable]').clear();
    
    cy.get('.tiptap div[contenteditable]').type(todo2);
    cy.get('input[name="date"]').type('02/01/2026{enter}', { force: true });
    cy.contains('Ajouter la tâche').click();
  });

  it('je peux rechercher et filtrer les tâches', () => {
    cy.get('ul[role="list"]').should('contain', todo1).and('contain', todo2);

    // Je filtre avec la recherche
    cy.get('input[placeholder="Rechercher ..."]').type('Groceries');
    
    // Seule la tâche correspondante doit rester visible
    cy.get('ul[role="list"]').should('contain', todo1);
    cy.get('ul[role="list"]').should('not.contain', todo2);

    // Je réinitialise la recherche
    cy.get('input[placeholder="Rechercher ..."]').clear();
    cy.get('ul[role="list"]').should('contain', todo1).and('contain', todo2);
  });

  it('je peux changer le statut d’une tâche (À faire ↔ Terminé)', () => {
    // Je bascule le statut de la première tâche
    cy.contains('li', todo1)
      .find('div')
      .contains('To Do')
      .click({ force: true });

    // La tâche doit maintenant être marquée comme terminée
    cy.contains('li', todo1).should('contain', 'Done');

    // Je rebascule le statut
    cy.contains('li', todo1)
      .find('div')
      .contains('Done')
      .click({ force: true });

    // La tâche doit redevenir "À faire"
    cy.contains('li', todo1).should('contain', 'To Do');
  });

  it('je peux supprimer une tâche', () => {
    cy.contains('li', todo1).should('exist');

    // Je clique sur l’icône de suppression
    cy.contains('li', todo1)
      .find('svg.cursor-pointer')
      .click();

    // La tâche doit disparaître de la liste
    cy.contains('li', todo1).should('not.exist');
    cy.contains('li', todo2).should('exist');
  });
});
