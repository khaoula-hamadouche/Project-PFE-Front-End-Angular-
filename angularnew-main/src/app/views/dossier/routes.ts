import { Routes } from '@angular/router';
import {baseGuard} from "../../guards/base.guard";
import {FileLinkRendererComponent} from "./file-link-renderer/file-link-renderer.component";
import {DossierFilesComponent} from "./dossier-files/dossier-files.component";
export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'dossier'
    },
    children: [
      {
        path: 'ajouter-dossier',
        loadComponent: () => import('./ajouter-dossier/ajouter-dossier.component').then(m => m.AjouterDossierComponent),

      },
      {
        path: 'edit-dossier/:numeroDossier',
        loadComponent: () => import('./edit-dossier/edit-dossier.component').then(m => m.EditDossierComponent),

      },

      {
        path: 'dossier',
        loadComponent: () => import('./dossier/dossier.component').then(m => m.DossierComponent),

      },
      {
        path: 'file',
        loadComponent: () => import('./file-link-renderer/file-link-renderer.component').then(m => m.FileLinkRendererComponent),

      },
      {
        path: 'dossiers/:id/fichiers',
        loadComponent: () => import('./dossier-files/dossier-files.component').then(m => m.DossierFilesComponent),

      },
      {
        path: 'Avenant',
        loadComponent: () => import('./avenant/avenant.component').then(m => m.AvenantComponent),

      },
      {
        path: 'Attribution',
        loadComponent: () => import('./attribution/attribution.component').then(m => m.AttributionComponent),

      },
      {
        path: 'Lancement',
        loadComponent: () => import('./lancement/lancement.component').then(m => m.LancementComponent),

      },
      {
        path: 'Gre a Gre',
        loadComponent: () => import('./gre-a-gre/gre-a-gre.component').then(m => m.GreAGreComponent),

      },
      {
        path: 'Recours',
        loadComponent: () => import('./recours/recours.component').then(m => m.RecoursComponent),

      },
      {
        path: 'dossier Avenant',
        loadComponent: () => import('./avenant-type/avenant-type.component').then(m => m.AvenantTypeComponent),

      },
      {
        path: 'dossier Attribution',
        loadComponent: () => import('./attribution-type/attribution-type.component').then(m => m.AttributionTypeComponent),

      },
      {
        path: 'dossier Lancement',
        loadComponent: () => import('./lancement-type/lancement-type.component').then(m => m.LancementTypeComponent),

      },
      {
        path: 'dossier Gre a Gre',
        loadComponent: () => import('./gre-a-gre-type/gre-a-gre-type.component').then(m => m.GreAGreTypeComponent),

      },
      {
        path: 'dossier Recours',
        loadComponent: () => import('./recours-type/recours-type.component').then(m => m.RecoursTypeComponent),

      }
    ]
  }
];
