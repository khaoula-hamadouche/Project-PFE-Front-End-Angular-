
import { INavData } from '@coreui/angular';
import { StorageService } from '../../service/storage-service/storage.service';

export function getNavItems(storageService: StorageService): INavData[] {
  const permissions = storageService.getPermissions(); // Récupère les permissions de l'utilisateur

  const navItems: INavData[] = [
    {
      name: 'Accueil',
      url: '/dashboard',
      iconComponent: { name: 'cil-speedometer' },
    },
    {
      title: true,
      name: 'Menu'
    }
  ];

  // Gestion des utilisateurs
  if (permissions.includes('GETALLUSER') || permissions.includes('AJOUTERUSER')) {
    const userMenu: INavData = {
      name: 'Utilisateurs',
      url: '/base',
      iconComponent: { name: 'cil-puzzle' },
      children: [],
    };

    if (permissions.includes('GETALLUSER')) {
      userMenu.children!.push({
        name: 'Gestion des Utilisateurs',
        url: '/base/users',
        icon: 'nav-icon-bullet'
      });
    }


    if (userMenu.children!.length > 0) {
      navItems.push(userMenu);
    }
  }

  // Gestion des rôles
  if (permissions.includes('GETALLROLE') || permissions.includes('AJOUTERROLE') || permissions.includes('MODIFERROLE')) {
    const roleMenu: INavData = {
      name: 'Rôles',
      url: '/roles',
      iconComponent: { name: 'cil-people' },
      children: [],
    };

    if (permissions.includes('GETALLROLE')) {
      roleMenu.children!.push({
        name: 'Gestion des rôles',
        url: '/roles/list',
        icon: 'nav-icon-bullet'
      });
    }


    if (roleMenu.children!.length > 0) {
      navItems.push(roleMenu);
    }
  }




  // Gestion des rôles
  if (permissions.includes('SENDEMAIL') ) {
    const roleMenu: INavData = {
      name: 'E-mails',
      url: '/mails',
      iconComponent: { name: 'cil-envelope-open' },
      children: [],
    };

    if (permissions.includes('SENDEMAIL')) {
      roleMenu.children!.push({
        name: 'Envoyer un e-mail',
        url: '/mails/send',
        icon: 'nav-icon-bullet'
      });
    }
    if (permissions.includes('SEEEMAIL')) {
      roleMenu.children!.push({
        name: 'Voirs les emails ',
        url: '/mails/all',
        icon: 'nav-icon-bullet'
      });
    }
    if (permissions.includes('SEEEMAIL')) {
      roleMenu.children!.push({
        name: 'Voirs les emails Envoyes ',
        url: '/mails/sent',
        icon: 'nav-icon-bullet'
      });
    }

    if (permissions.includes('SEEEMAIL')) {
      roleMenu.children!.push({
        name: 'Boite de reception ',
        url: '/mails/received',
        icon: 'nav-icon-bullet'
      });
    }



    if (roleMenu.children!.length > 0) {
      navItems.push(roleMenu);
    }
  }


// Gestion des dossier
  if (permissions.includes('GETALLDOSSIER') || permissions.includes('AJOUTERDOSSIER')) {
    const dossierMenu: INavData = {
      name: 'Dossier CME',
      url: '/dossier',
      iconComponent: { name: 'cil-description' },
      children: [],
    };
    if (permissions.includes('AJOUTERDOSSIER')) {
      dossierMenu.children!.push({
        name: 'Ajouter un dossier',
        url: '/dossier/ajouter-dossier',
        icon: 'nav-icon-bullet'
      });
    }
    if (permissions.includes('GETDOSSIERBYUSER')) {
      dossierMenu.children!.push({
        name: 'Attribution',
        url: '/dossier/dossier Attribution',
        icon: 'nav-icon-bullet'
      });}
      if (permissions.includes('GETDOSSIERBYUSER')) {
        dossierMenu.children!.push({
          name: 'LANCEMENT',
          url: '/dossier/dossier Lancement',
          icon: 'nav-icon-bullet'
        });
    }
    if (permissions.includes('GETDOSSIERBYUSER')) {
      dossierMenu.children!.push({
        name: 'AVENANT',
        url: '/dossier/dossier Avenant',
        icon: 'nav-icon-bullet'
      });
    }
    if (permissions.includes('GETDOSSIERBYUSER')) {
      dossierMenu.children!.push({
        name: 'Gre a Gre',
        url: '/dossier/dossier Gre a Gre',
        icon: 'nav-icon-bullet'
      });
    }
    if (permissions.includes('GETDOSSIERBYUSER')) {
      dossierMenu.children!.push({
        name: 'RECOURS',
        url: '/dossier/dossier Recours',
        icon: 'nav-icon-bullet'
      });
    }

    if (permissions.includes('GETALLDOSSIER')) {
      const gestionDossiers: INavData = {
        name: 'Gestion des Dossiers',
        url: '/dossier', // Peut être vide ou générique
        icon: 'nav-icon-folder',
        children: [
          {
            name: 'Dossier Avenant',
            url: '/dossier/Avenant',
            icon: 'nav-icon-bullet'
          },
          {
            name: 'Dossier Attribution',
            url: '/dossier/Attribution',
            icon: 'nav-icon-bullet'
          },
          {
            name: 'Dossier Recours',
            url: '/dossier/Recours',
            icon: 'nav-icon-bullet'
          },
          {
            name: 'Dossier Gre à Gre',
            url: '/dossier/Gre a Gre',
            icon: 'nav-icon-bullet'
          },
          {
            name: 'Dossier Lancement',
            url: '/dossier/Lancement',
            icon: 'nav-icon-bullet'
          }
        ]
      };

      dossierMenu.children!.push(gestionDossiers);
    }



    if (dossierMenu.children!.length > 0) {
      navItems.push(dossierMenu);
    }
  }


  const roleMenu: INavData = {
    name: 'Dossier',
    url: '/dossiers/create',
    iconComponent: { name: 'cil-people' },
    children: [],
  };

  return navItems;
}
