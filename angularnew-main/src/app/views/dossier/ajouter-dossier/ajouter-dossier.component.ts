import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DossierService } from '../../../service/dossier.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import {Router} from "@angular/router";

@Component({
  selector: 'app-ajouter-dossier',
  templateUrl: './ajouter-dossier.component.html',
  styleUrls: ['./ajouter-dossier.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule
  ]
})
export class AjouterDossierComponent implements OnInit {
  dossierForm!: FormGroup;
  passations: string[] = [];
  fichiersRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['Dossier de la consultation', 'Lettre d’opportunité', 'Fiche de validation'],
    APPEL_OFFRE_ATTRIBUTION: ['Rapport d’attribution', 'Contrat', 'Avis d’attribution'],
    GRE_A_GRE: ['Lettre d’engagement', 'Rapport circonstancié', 'Contrat'],
    AVENANT: ['Dossier de la consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Rapport circonstancié', 'Contrat'],
    RECOURS: ['Justificatif de recours', 'Rapport d’analyse', 'Décision finale']
  };
  selectedFichiers: string[] = [];

  constructor(private fb: FormBuilder, private dossierService: DossierService ,private router: Router) {}

  ngOnInit(): void {
    this.dossierForm = this.fb.group({
      numeroDossier: ['', Validators.required],
      intitule: ['', Validators.required],
      typePassation: ['', Validators.required],
      fichiers: this.fb.array([])
    });

    this.dossierService.getPassations().subscribe({
      next: (data) => this.passations = data,
      error: (err) => console.error('Erreur de récupération des passations', err)
    });
  }

  onTypePassationChange(type: string) {
    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.clear();
    this.selectedFichiers = this.fichiersRequis[type] || [];

    this.selectedFichiers.forEach(() => {
      fichiersArray.push(this.fb.control(null));
    });
  }

  ajouterFichierSupplementaire() {
    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.push(this.fb.control(null));
    this.selectedFichiers.push("Autre fichier " + (this.selectedFichiers.length + 1));
  }

  onFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
      fichiersArray.at(index).setValue(file);
    }
  }

  onSubmit() {
    if (this.dossierForm.invalid) {
      alert("Veuillez remplir tous les champs requis !");
      return;
    }

    const formData = new FormData();
    formData.append("numeroDossier", this.dossierForm.value.numeroDossier);
    formData.append("intitule", this.dossierForm.value.intitule);
    formData.append("typePassation", this.dossierForm.value.typePassation);

    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.controls.forEach((control, index) => {
      const file = control.value;
      if (file) {
        formData.append("files", file);
        formData.append("fileNames", this.selectedFichiers[index]);
      }
    });

    console.log("📤 Données envoyées :", Array.from((formData as any).entries()));

    this.dossierService.ajouterDossier(formData).subscribe({
      next: () => {
        alert("✅ Dossier ajouté avec succès !");
        this.dossierForm.reset();
        this.selectedFichiers = [];
        this.router.navigate(['/dossier/file']); // Redirige vers dossier/file
      },
      error: (err) => {
        console.error("❌ Erreur lors de l'ajout du dossier", err);
        alert("❌ Une erreur est survenue lors de l'ajout du dossier.");
      }
    });
  }
}
