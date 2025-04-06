// src/app/components/role-edit/role-edit.component.ts (Create a new component for editing)
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../service/role.service';

interface Permission {
  id: number;
  name: string;
}

@Component({
  selector: 'app-role-edit',
  template: `
    <div class="container mt-5">
      <h2>Modifier le Rôle</h2>
      <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label for="name" class="form-label">Nom du Rôle:</label>
          <input type="text" class="form-control" id="name" formControlName="name">
          <div *ngIf="editForm.get('name')?.invalid && (editForm.get('name')?.dirty || editForm.get('name')?.touched)"
               class="text-danger">
            <div *ngIf="editForm.get('name')?.errors?.['required']">
              Le nom du rôle est obligatoire.
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Permissions:</label>
          <div class="list-group">
            <button
              type="button"
              class="list-group-item list-group-item-action"
              *ngFor="let permission of allPermissions"
              (click)="togglePermission(permission)"
              [class.active]="isSelected(permission)"
            >
              {{ permission.name }}
            </button>
          </div>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>

        <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid">
          Enregistrer les Modifications
        </button>
        <button type="button" class="btn btn-secondary ms-2" (click)="goBack()">
          Annuler
        </button>
      </form>
    </div>
  `,
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit {
  roleId: number | null = null;
  editForm: FormGroup;
  allPermissions: Permission[] = [];
  selectedPermissions: Permission[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  currentRole: any; // To store the role data being edited

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.roleId = +params['id']; // Get the role ID from the route
      if (this.roleId) {
        this.loadRoleDetails(this.roleId);
        this.loadPermissions();
      }
    });
  }

  loadRoleDetails(id: number): void {
    this.roleService.getRoleById(id).subscribe(
      (data) => {
        this.currentRole = data;
        this.editForm.patchValue({ name: data.name });
        this.selectedPermissions = [...data.permissions]; // Initialize selected permissions
      },
      (error) => {
        console.error('Error loading role details:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du rôle.';
      }
    );
  }

  loadPermissions(): void {
    this.roleService.getAllPermissions().subscribe(
      (permissions: Permission[]) => {
        this.allPermissions = permissions;
      },
      (error) => {
        console.error('Error loading permissions:', error);
        this.errorMessage = 'Erreur lors du chargement des permissions.';
      }
    );
  }

  togglePermission(permission: Permission): void {
    const index = this.selectedPermissions.findIndex((p) => p.id === permission.id);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
    } else {
      this.selectedPermissions.push(permission);
    }
  }

  isSelected(permission: Permission): boolean {
    return this.selectedPermissions.some((p) => p.id === permission.id);
  }

  onSubmit(): void {
    if (this.editForm.valid && this.roleId) {
      const updatedRole = {
        name: this.editForm.get('name')?.value,
        permissions: this.selectedPermissions.map(p => ({ id: p.id })),
      };

      this.roleService.updateRole(this.roleId, updatedRole).subscribe(
        (response) => {
          console.log('Role updated successfully:', response);
          this.successMessage = 'Rôle mis à jour avec succès!';
          this.errorMessage = '';
          // Optionally navigate back to the list
          this.router.navigate(['/roles/edit']); // Adjust the navigation path as needed
        },
        (error) => {
          console.error('Error updating role:', error);
          this.errorMessage = error.message || 'Erreur lors de la mise à jour du rôle.';
          this.successMessage = '';
        }
      );
    } else {
      this.errorMessage = 'Veuillez remplir le nom du rôle.';
      this.successMessage = '';
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']); // Adjust the navigation path as needed
  }
}
