import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../../service/role.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import the Router

interface Permission {
  id: number;
  name: string;
}

@Component({
  selector: 'app-ajout-role',
  templateUrl: './ajout-role.component.html',
  styleUrls: ['./ajout-role.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
})
export class AjoutRoleComponent implements OnInit {

  roleForm: FormGroup;
  allPermissions: Permission[] = [];
  selectedPermissions: Permission[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private roleService: RoleService,
    private fb: FormBuilder,
    private router: Router // Inject the Router service
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
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
    if (this.roleForm.valid) {
      const newRole = {
        name: this.roleForm.get('name')?.value,
        permissions: this.selectedPermissions.map(p => ({ id: p.id, name: p.name })),
      };

      this.roleService.createRole(newRole).subscribe(
        (response) => {
          console.log('Role created successfully:', response);
          this.successMessage = 'Rôle créé avec succès!';
          this.errorMessage = '';
          this.roleForm.reset();
          this.selectedPermissions = [];
          this.router.navigate(['/roles/list']); // Navigate to the specified path
        },
        (error) => {
          console.error('Error creating role:', error);
          this.successMessage = '';
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          }
          else {
            this.errorMessage = 'Erreur lors de la création du rôle.';
          }
        }
      );
    } else {
      this.errorMessage = 'Veuillez remplir le nom du rôle.';
      this.successMessage = '';
    }
  }
}
