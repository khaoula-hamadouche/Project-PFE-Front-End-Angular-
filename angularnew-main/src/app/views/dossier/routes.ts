import { Routes } from '@angular/router';
import {baseGuard} from "../../guards/base.guard";
import {FileLinkRendererComponent} from "./file-link-renderer/file-link-renderer.component";
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

      }
    ]
  }
];
