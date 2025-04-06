import { AfterViewInit, Component, Renderer2 } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AgGridAngular } from "ag-grid-angular";

import {
  ClientSideRowModelModule,
  ColDef,

  GridReadyEvent,
  ModuleRegistry,
  NumberFilterModule,
  PaginationNumberFormatterParams,
  TextFilterModule,
  ValidationModule,
  PaginationModule,

  NumberEditorModule,
  TextEditorModule,
  ColumnAutoSizeModule,
} from "ag-grid-community";
ModuleRegistry.registerModules([
  ColumnAutoSizeModule,
  NumberEditorModule,
  TextEditorModule,
  TextFilterModule,
  NumberFilterModule,
  PaginationModule,
  ClientSideRowModelModule,
  ValidationModule /* Development Only */,
]);


import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TableDirective, TextColorDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { UserService } from "../service/user.service";
import { StorageService } from "../service/storage-service/storage.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-ag-grid',
  standalone: true,
  imports: [AgGridAngular , CommonModule, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule],
  templateUrl: './ag-grid.component.html',
  styleUrls: ['./ag-grid.component.scss'],
})
export class AgGridComponent implements AfterViewInit {
  rowData: any[] = []; // Données pour le tableau
  columnDefs: ColDef[] = [
    { headerName: 'Numéro', field: 'numeroDossier', sortable: true, filter: true },
    { headerName: 'Objet', field: 'objet', sortable: true, filter: true },
    { headerName: 'Type', field: 'type', sortable: true, filter: true },
    { headerName: 'Budget', field: 'budget', sortable: true, filter: true },
    { headerName: 'Date de création', field: 'dateCreation', sortable: true, filter: true },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        return `
          <button class="btn btn-sm btn-primary edit-btn" data-id="${params.data.numeroDossier}">Modifier</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${params.data.numeroDossier}">Supprimer</button>
        `;
      },
      width: 200,
      cellStyle: { textAlign: 'center' }
    }
  ];


  defaultColDef = { flex: 1, minWidth: 100, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  addActionListeners() {
    const table = document.querySelector('ag-grid-angular');
    if (table) {
      this.renderer.listen(table, 'click', (event: Event) => {
        const target = event.target as HTMLElement;
        const userId = target.getAttribute('data-id');

        if (userId) {
          const numericUserId = Number(userId);
          if (isNaN(numericUserId)) {
            console.error("ID utilisateur invalide :", userId);
            return;
          }

          if (target.classList.contains('edit-btn')) {
            this.editUser(numericUserId);
          } else if (target.classList.contains('delete-btn')) {
            this.deleteUser(numericUserId);
          }
        }
      });
    }
  }

  // Mettre à jour un utilisateur
  editUser(userId: number): void {
    console.log(`Navigation vers edit-user/${userId}`);
    this.router.navigate(['/base/edit-user', userId]);
  }

  // Supprimer un utilisateur
  deleteUser(userId: number) {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
    if (!confirmation) return;

    console.log(`Tentative de suppression de l'utilisateur avec ID: ${userId}`);

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        console.log("Utilisateur supprimé avec succès !");
        alert("Utilisateur supprimé avec succès !");
        this.getUsers(); // Recharger la liste des utilisateurs
      },
      error: (err) => {
        console.error("Erreur lors de la suppression de l'utilisateur", err);
        alert("Erreur lors de la suppression de l'utilisateur. Consultez la console.");
      }
    });
  }

  getUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.rowData = data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles.map((r: any) => r.name).join(', ') // Convertir les rôles en texte
        }));
        console.log("Données des utilisateurs chargées :", this.rowData);
      },
      error: (err) => console.error("Erreur lors de la récupération des utilisateurs", err)
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  // Optimisation pour *ngFor
  trackById(index: number, user: any): number {
    return user.id;
  }
}
