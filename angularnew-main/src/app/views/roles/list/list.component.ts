import { AfterViewInit, Component, Renderer2 } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AgGridAngular } from "ag-grid-angular";
import { RoleService } from "../../../service/role.service";
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
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  standalone: true,
  imports: [AgGridAngular, CommonModule, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule],
})
export class ListComponent implements AfterViewInit {
  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'id', sortable: true, filter: true, lockPosition: "left", cellClass: "locked-col" },
    { headerName: 'Nom du rôle', field: 'name', sortable: true, filter: true },
    {
      headerName: 'Permissions',
      field: 'permissions',
      sortable: true,
      filter: true,
      valueFormatter: (params) => params.value.map((p: any) => p.name).join(', ')
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        return `
            <button class="btn btn-sm btn-primary edit-btn" data-id="${params.data.id}">Modifier</button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${params.data.id}">Supprimer</button>
          `;
      },
      width: 200,
      cellStyle: { textAlign: 'center' },
      lockPosition: "right",
      cellClass: "locked-col"
    }
  ];

  defaultColDef = { flex: 1, minWidth: 100, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  roles: any[] = [];
  rowData: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  roleToDelete: number | null = null;
  deleteConfirmationVisible: boolean = false;

  constructor(private roleService: RoleService, private renderer: Renderer2, private router: Router) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe(
      (data) => {
        this.roles = data;
        this.rowData = data;
      },
      (error) => console.error('Erreur lors du chargement des rôles', error)
    );
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  addActionListeners() {
    const table = document.querySelector('ag-grid-angular');
    if (table) {
      this.renderer.listen(table, 'click', (event: Event) => {
        const target = event.target as HTMLElement;
        const roleId = target.getAttribute('data-id');

        if (roleId) {
          const numericRoleId = Number(roleId);
          if (!isNaN(numericRoleId)) {
            if (target.classList.contains('edit-btn')) {
              this.editRole(numericRoleId);
            } else if (target.classList.contains('delete-btn')) {
              this.confirmDelete(numericRoleId);
            }
          } else {
            console.error("ID de rôle invalide :", roleId);
          }
        }
      });
    }
  }

  editRole(roleId: number): void {
    console.log("Modifier le rôle avec ID :", roleId);
    this.router.navigate(['/roles/edit', roleId]);
  }

  confirmDelete(roleId: number): void {
    this.roleToDelete = roleId;
    this.deleteConfirmationVisible = true;
  }

  cancelDelete(): void {
    this.roleToDelete = null;
    this.deleteConfirmationVisible = false;
  }

  deleteConfirmed(): void {
    if (this.roleToDelete !== null) {
      this.roleService.deleteRole(this.roleToDelete).subscribe(
        (message: string) => {
          console.log('Role deleted:', message);
          this.successMessage = message;
          this.errorMessage = '';
          this.loadRoles();
          this.roleToDelete = null;
          this.deleteConfirmationVisible = false;
        },
        (error) => {
          console.error('Error deleting role:', error);
          this.errorMessage = error.message || 'Erreur lors de la suppression du rôle.';
          this.successMessage = '';
          this.roleToDelete = null;
          this.deleteConfirmationVisible = false;
        }
      );
    }
  }

  hasPermission(role: any, permission: string): boolean {
    return role.permissions.some((p: any) => p.name === permission);
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  trackById(index: number, user: any): number {
    return user.id;
  }
}
