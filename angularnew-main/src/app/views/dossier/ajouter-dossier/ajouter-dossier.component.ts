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
import { MatDivider } from "@angular/material/divider";
import { MatList, MatListItem } from "@angular/material/list";
import { MatLine } from "@angular/material/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

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
  typeFournisseurs: string[] = ['Local', 'Étranger'];
  selectedFichiers: string[] = [];
  fichiersSupplementaires: FichierSupplementaire[] = [];
  isFichierVisible: boolean = false;
  nomFournisseur = '';
  isBlacklisted: boolean | null = null;

  fichiersRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['Dossier de la consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique', 'DST', 'Visa budgetaire'],
    Consultation_Prestataire_de_Lancement: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique', 'DST', 'Visa budgetaire'],
    Consultation_Procurement_de_Lancement: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique', 'DST', 'Visa budgetaire'],
    APPEL_OFFRE_ATTRIBUTION: ['Projet de Contrat', 'PVPNR', 'VISA Lancement CME', 'Avis d’attribution', 'Décision de commission adhoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Prestataire_dAttribution: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'Situation SAP', 'PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Procurement_dAttribution: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'Situation SAP', 'PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    GRE_A_GRE: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Rapport circonstancié'],
    AVENANT: ['Lettre d’opportunité', 'Rapport circonstancié', 'Contrat'],
    RECOURS: ['Dossier de consultation', 'Lettre d’opportunité', 'Cahier des charges', 'Offre']
  };

  DonneeRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['numeroContrat', 'typologiemarche', 'Garantie', 'montantEstime', 'budgetEstime', 'delaiRealisation'],
    Consultation_Prestataire_de_Lancement: ['typologiemarche', 'Garantie', 'montantEstime', 'budgetEstime', 'delaiRealisation'],
    Consultation_Procurement_de_Lancement: ['typologiemarche', 'Garantie', 'montantEstime', 'budgetEstime', 'delaiRealisation'],
    APPEL_OFFRE_ATTRIBUTION: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'delaiRealisation', 'typologidemarche', 'garantie', 'experiencefournisseur', 'nombredeprojetssimilaires', 'notationinterne', 'chiffreaffaire', 'situationfiscale', 'fournisseurblacklist', 'typeFournisseur'],
    Consultation_Prestataire_dAttribution: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'delaiRealisation', 'typologidemarche', 'garantie', 'experiencefournisseur', 'nombredeprojetssimilaires', 'notationinterne', 'chiffreaffaire', 'situationfiscale', 'fournisseurblacklist', 'typeFournisseur'],
    Consultation_Procurement_dAttribution: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'delaiRealisation', 'typologidemarche', 'garantie', 'experiencefournisseur', 'nombredeprojetssimilaires', 'notationinterne', 'chiffreaffaire', 'situationfiscale', 'fournisseurblacklist', 'typeFournisseur'],
    GRE_A_GRE: ['montantEstime', 'budgetEstime', 'dureeContrat', 'delaiRealisation'],
    AVENANT: ['numeroContrat', 'dateSignatureContrat', 'dureeContrat', 'dateExpirationContrat', 'montantContrat', 'objetAvenant', 'montantAvenant', 'dureeAvenant']
  };

  champLabels: { [key: string]: string } = {
    fournisseurEtranger: 'Fournisseur Étranger',
    fournisseurEtrangerInstallationPermanente: "Installation Permanente à l'Étranger",
    originePaysNonDoubleImposition: 'Origine - Pays sans Double Imposition',
    budgetEstime: 'budgetEstime',
    nombredeprojetssimilaires: 'nombre de projets similaires',
    notationinterne: 'Notation interne',
    Garantie: 'Garantie',
    delaiRealisation: 'Delai Realisation',
    typologiemarche: 'Typologie Marche',
    chiffreaffaire: 'chiffre affaire',
    situationfiscale: 'situation fiscale',
    fournisseurblacklist: 'fournisseur blacklist',
    typeFournisseur: 'Type de Fournisseur',
    montantEstime: 'Montant Estimé',
    dureeContrat: 'Durée du Contrat',
    dureeRealisation: 'Durée de Réalisation',
    nomFournisseur: 'Nom du Fournisseur',
    montantContrat: 'Montant du Contrat',
    numeroContrat: 'Numéro du Contrat',
    dateSignatureContrat: 'Date de Signature',
    dateExpirationContrat: 'Date d’Expiration',
    objetAvenant: 'Objet de l’Avenant',
    montantAvenant: 'Montant de l’Avenant',
    dureeAvenant: 'Durée de l’Avenant',
    experiencefournisseur: 'experiencefournisseur',
    fournisseurEtrangerDetails: 'Détails Fournisseur Étranger' // Bien que non utilisé directement dans DonneeRequis
  };

  constructor(private fb: FormBuilder, private dossierService: DossierService, private router: Router) { }

  ngOnInit(): void {
    this.dossierForm = this.fb.group({
      numeroDossier: ['', Validators.required],
      intitule: ['', Validators.required],
      typePassation: ['', Validators.required],
      typeFournisseur: ['Local'], // Valeur par défaut
      fichiers: this.fb.array([]),
      nomFichierSuppl: [''],
      installationPermanente: [false],
      originePays: [false]
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

    const anciensChamps = Object.keys(this.dossierForm.controls).filter(
      champ => !['numeroDossier', 'intitule', 'typePassation', 'fichiers', 'nomFichierSuppl', 'typeFournisseur', 'installationPermanente', 'originePays'].includes(champ)
    );
    anciensChamps.forEach(champ => this.dossierForm.removeControl(champ));

    const champsSpecifiques = this.DonneeRequis[type] || [];
    champsSpecifiques.forEach(champ => {
      const validatorsArray = [Validators.required];
      this.dossierForm.addControl(champ, this.fb.control('', validatorsArray));
    });
  }

  onTypeFournisseurChange(typeFournisseur: string) {
    // Vous pouvez ajouter ici une logique supplémentaire si nécessaire en fonction du type de fournisseur.
    if (typeFournisseur === 'Local') {
      this.dossierForm.patchValue({ installationPermanente: false, originePays: false });
      this.dossierForm.get('installationPermanente')?.clearValidators();
      this.dossierForm.get('originePays')?.clearValidators();
    } else if (typeFournisseur === 'Étranger') {
      this.dossierForm.get('installationPermanente')?.setValidators([Validators.required]);
      this.dossierForm.get('originePays')?.setValidators([Validators.required]);
    }
    this.dossierForm.get('installationPermanente')?.updateValueAndValidity();
    this.dossierForm.get('originePays')?.updateValueAndValidity();
  }

  ajouterFichierSupplementaire() {
    const nomFichier = this.dossierForm.get('nomFichierSuppl')?.value;
    if (nomFichier && nomFichier.trim() !== '') {
      this.fichiersSupplementaires = [...this.fichiersSupplementaires, { nom: nomFichier.trim(), file: null }];
      this.dossierForm.patchValue({ nomFichierSuppl: '' });
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
    formData.append('typeFournisseur', this.dossierForm.value.typeFournisseur);

    if (this.dossierForm.value.typeFournisseur === 'Étranger') {
      formData.append('fournisseurEtrangerInstallationPermanente', this.dossierForm.value.installationPermanente ? 'true' : 'false');
      formData.append('originePaysNonDoubleImposition', this.dossierForm.value.originePays ? 'true' : 'false');
    }

    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.controls.forEach((control, index) => {
      const file = control.value;
      if (file && index < this.selectedFichiers.length) {
        formData.append('files', file);
        formData.append('fileNames', this.selectedFichiers[index]);
      }
    });

    this.fichiersSupplementaires.forEach(fichier => {
      if (fichier.file) {
        formData.append('files', fichier.file);
        formData.append('fileNames', fichier.nom);
      }
    });

    const champsSpecifiques = Object.keys(this.dossierForm.controls).filter(key => !['numeroDossier', 'intitule', 'typePassation', 'typeFournisseur', 'fichiers', 'nomFichierSuppl', 'installationPermanente', 'originePays'].includes(key));
    champsSpecifiques.forEach(key => {
      const value = this.dossierForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    this.dossierService.ajouterDossier(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Le dossier a été ajouté avec succès !');
        this.router.navigate(['/dossiers']);
        this.dossierForm.reset();
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
    const format = '2025/DOS/';
    let numero = value.replace(format, '');
    numero = numero.padStart(3, '0');
    return format + numero;
  }
}
