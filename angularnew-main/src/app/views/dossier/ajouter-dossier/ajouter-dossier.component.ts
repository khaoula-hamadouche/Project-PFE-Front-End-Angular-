import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DossierService } from '../../../service/dossier.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import {MatDivider} from "@angular/material/divider";
import {MatList, MatListItem} from "@angular/material/list";
import {MatLine} from "@angular/material/core";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

interface FichierSupplementaire {
  nom: string;
  file: File | null;
}

@Component({
  selector: 'app-ajouter-dossier',
  templateUrl: './ajouter-dossier.component.html',
  styleUrls: ['./ajouter-dossier.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatDivider,
    MatList,
    MatListItem,
    MatLine,
    MatProgressSpinner
  ],
})
export class AjouterDossierComponent implements OnInit {
  dossierForm!: FormGroup;
  passations: string[] = [];
  selectedFichiers: string[] = [];
  fichiersSupplementaires: FichierSupplementaire[] = [];
  isFichierVisible: boolean = false;

  fichiersRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['Dossier de la consultation', 'Lettre d’opportunité', 'Fiche de validation','Fiche analytique'],
    Consultation_Prestataire_de_Lancement:[ 'Dossier de consultation','Lettre d’opportunité', 'Fiche de validation','Fiche analytique'],
    Consultation_Procurement_de_Lancement:['Dossier de consultation','Lettre d’opportunité', 'Fiche de validation','Fiche analytique'],
    APPEL_OFFRE_ATTRIBUTION: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière','PV Adhoc','Situation SAP','PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Prestataire_dAttribution: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière','PV Adhoc','Situation SAP','PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Procurement_dAttribution: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière','PV Adhoc','Situation SAP','PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    GRE_A_GRE: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation','Rapport circonstancié'],
    AVENANT: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Rapport circonstancié', 'Contrat'],
    RECOURS: ['Dossier de consultation', 'Lettre d’opportunité', 'Cahier des charges','Offre']
  };

  DonneeRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['montantEstime', 'budgetEstime', 'dureeContrat','dureeRealisation'],
    Consultation_Prestataire_de_Lancement:['montantEstime', 'budgetEstime', 'dureeContrat','dureeRealisation'],
    Consultation_Procurement_de_Lancement:['montantEstime', 'budgetEstime', 'dureeContrat','dureeRealisation'],
    APPEL_OFFRE_ATTRIBUTION: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'fournisseurEtranger', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'],
    Consultation_Prestataire_dAttribution:  ['nomFournisseur', 'montantContrat', 'dureeContrat', 'fournisseurEtranger', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'],
    Consultation_Procurement_dAttribution: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'fournisseurEtranger', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'],
    GRE_A_GRE: ['montantEstime', 'budgetEstime', 'dureeContrat','dureeRealisation'],
    AVENANT: ['numeroContrat', 'dateSignatureContrat', 'dureeContrat', 'dateExpirationContrat', 'montantContrat', 'objetAvenant', 'montantAvenant', 'dureeAvenant'],
  };

  champLabels: { [key: string]: string } = {
    fournisseurEtranger: 'Fournisseur Étranger',
    fournisseurEtrangerInstallationPermanente: "Installation Permanente à l'Étranger",
    originePaysNonDoubleImposition: 'Origine - Pays sans Double Imposition',
    montantEstime: 'Montant Estimé',
    budgetEstime: 'Budget Estimé',
    dureeContrat: 'Durée du Contrat',
    dureeRealisation: 'Durée de Réalisation',
    nomFournisseur: 'Nom du Fournisseur',
    montantContrat: 'Montant du Contrat',
    numeroContrat: 'Numéro du Contrat',
    dateSignatureContrat: 'Date de Signature',
    dateExpirationContrat: 'Date d’Expiration',
    objetAvenant: 'Objet de l’Avenant',
    montantAvenant: 'Montant de l’Avenant',
    dureeAvenant: 'Durée de l’Avenant'
  };

  constructor(private fb: FormBuilder, private dossierService: DossierService, private router: Router) {}

  ngOnInit(): void {
    this.dossierForm = this.fb.group({
      numeroDossier: ['', Validators.required],
      intitule: ['', Validators.required],
      typePassation: ['', Validators.required],
      fichiers: this.fb.array([]),
      nomFichierSuppl: [''] // Add form control for nomFichierSuppl
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

    if (this.selectedFichiers.length === 0) {
      console.log(`Aucun fichier requis pour ce type de passation: ${type}`);
    }

    this.selectedFichiers.forEach(() => {
      fichiersArray.push(this.fb.control(null));
    });

    const anciensChamps = Object.keys(this.dossierForm.controls).filter(
      champ => !['numeroDossier', 'intitule', 'typePassation', 'fichiers', 'nomFichierSuppl'].includes(champ)
    );
    anciensChamps.forEach(champ => this.dossierForm.removeControl(champ));

    const champsSpecifiques = this.DonneeRequis[type] || [];
    if (champsSpecifiques.length === 0) {
      console.log(`Aucun champ requis pour ce type de passation: ${type}`);
    }

    champsSpecifiques.forEach(champ => {
      const isCheck = this.isCheckbox(champ);
      this.dossierForm.addControl(champ, this.fb.control(isCheck ? false : '', Validators.required));
    });
  }


  isCheckbox(champ: string): boolean {
    return ['fournisseurEtranger', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'].includes(champ);
  }


  ajouterFichierSupplementaire() {
    const nomFichier = this.dossierForm.get('nomFichierSuppl')?.value;
    if (nomFichier && nomFichier.trim() !== '') {
      this.fichiersSupplementaires = [...this.fichiersSupplementaires, { nom: nomFichier.trim(), file: null }];
      this.dossierForm.patchValue({ nomFichierSuppl: '' });

      // Add a new control to the 'fichiers' FormArray for the new file
      const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
      fichiersArray.push(this.fb.control(null));
    } else {
      alert('Veuillez entrer un nom pour le fichier supplémentaire.');
    }
  }

  onFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file && index < this.selectedFichiers.length) {
      const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
      fichiersArray.at(index).setValue(file);
    } else if (file && index >= this.selectedFichiers.length && index - this.selectedFichiers.length < this.fichiersSupplementaires.length) {
      this.fichiersSupplementaires[index - this.selectedFichiers.length].file = file;
    }
  }

  isSubmitting = false;

  onSubmit(): void {
    if (this.dossierForm.invalid) return;

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('numeroDossier', this.dossierForm.value.numeroDossier);
    formData.append('intitule', this.dossierForm.value.intitule);
    formData.append('typePassation', this.dossierForm.value.typePassation);

    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.controls.forEach((control, index) => {
      const file = control.value;
      if (file && index < this.selectedFichiers.length) {
        formData.append('files', file);
        formData.append('fileNames', this.selectedFichiers[index]);
      }
    });

    // Ajout des fichiers supplémentaires
    this.fichiersSupplementaires.forEach(fichier => {
      if (fichier.file) {
        formData.append('files', fichier.file);
        formData.append('fileNames', fichier.nom);
      }
    });

    // Ajout des champs spécifiques au type sélectionné
    const champsSpecifiques = this.DonneeRequis[this.dossierForm.value.typePassation] || [];
    champsSpecifiques.forEach(key => {
      const value = this.dossierForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    this.dossierService.ajouterDossier(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/dossiers']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur lors de l’ajout du dossier', err);
        alert('Erreur lors de l’envoi du dossier.');
      }
    });
  }

  formatNumeroDossier(value: string | null): string {
    if (!value) {
      return '';
    }
    // Appliquer un format à la valeur, par exemple un format simple avec un préfixe
    const format = '2025/DOS/';
    let numero = value.replace(format, ''); // Supprime le préfixe, si déjà présent
    numero = numero.padStart(3, '0'); // Ajouter des zéros si nécessaire
    return format + numero; // Retourner le format complet
  }

  }



