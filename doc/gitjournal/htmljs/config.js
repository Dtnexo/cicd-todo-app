/*
Il y a trois modes de fonctionnement possible de gitjournal:
1. Utiliser un seul repo, toujours le même. 
   Pour cela, il suffit de configurer la constante `defaultRepoUrl`.
   Si on ne spécifie pas d'utilisateurs Git, seuls les commits du propriétaire du repo sont pris
2. Avoir plusieurs repos que l'on veut suivre. 
   Pour cela, il faut configurer le tableau `repos`.
   Le nom qui apparaîtra dans la liste déroulante est le nom du repo, sauf si un alias est précisé. 
   Il est également possible de spécifier la liste des contributeurs (utilisateurs Git) que l'on veut voir apparaître dans le journal.
3. Si aucune des deux options précédente n'a été configurée: on a un simple champ texte de saisie de l'URL du repos pour lequel on veut faire le journal. 
   Dans ce cas, les commits pris en considération sont également ceux du propriétaire du Reto.
*/

const repos = "https://github.com/Dtnexo/cicd-todo-app";
  //{ url: "https://github.com/Evinne8/Plot-Those-Lines-P_FUN-" },
 // { alias: "cicd-todo-app", url: "https://github.com/Dtnexo/cicd-todo-app" },
  /*{ url: "https://github.com/bill/myApp" },
  { url: "https://github.com/ETML-INF/escape" , users: ["JDalton", "JackD"]}*/

const journalStartDate = "2025-11-13";
