import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ajouter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './ajouter.component.html',
  standalone: true,
  styleUrls: ['./ajouter.component.scss']
})
export class AjouterComponent implements OnInit {
  blacklistForm: FormGroup;  // <-- renommer ici
  loading = false;
private apiUrl = "http://localhost:8086/blacklist";
blacklistFournisseur(fournisseur: any): Observable<any> {
  return this.http.post(this.apiUrl, fournisseur, { withCredentials: true });
}
  constructor(private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.blacklistForm = this.fb.group({
      denomination: ['', Validators.required],
      activite: ['', Validators.required],
      structureAyantDemandeExclusion: ['', Validators.required],
      dateExclusion: [new Date().toISOString().substring(0, 10), Validators.required],
      motifs: ['', Validators.required],
      duree: [null, [Validators.required, Validators.min(1)]],
    });

  }


  ngOnInit(): void {}

  ajouterFournisseur(): void {
    if (this.blacklistForm.valid) {
      const fournisseurData = this.blacklistForm.value;
      this.loading = true;

      this.blacklistFournisseur(fournisseurData).subscribe({
        next: (data) => {
          console.log('Fournisseur blacklisté avec succès:', data);
          this.router.navigate(['/base/fournisseurs-blacklistes']);
        },
        error: (error) => {
          console.error("Erreur lors du blacklist:", error);
          this.loading = false;
        }
      });
    } else {
      console.log('Formulaire invalide', this.blacklistForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['/base/fournisseurs-blacklistes']);
  }
}
