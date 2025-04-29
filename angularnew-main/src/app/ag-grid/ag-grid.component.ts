import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DossierService } from '../service/dossier.service';
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
export class AgGridComponent implements OnInit {
  dossierForm!: FormGroup;
  passations: string[] = [];
  selectedFichiers: string[] = [];

  // Fichiers requis selon type de passation
  fichiersRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['Dossier de la consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique', 'DST', 'Visa budgetaire'],
    Consultation_Prestataire_de_Lancement: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique', 'DST', 'Visa budgetaire'],
    Consultation_Procurement_de_Lancement: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique', 'DST', 'Visa budgetaire'],
    APPEL_OFFRE_ATTRIBUTION: ['Projet de Contrat', 'PVPNR', 'VISA Lancement CME', 'Avis d’attribution', 'Décision de commission adhoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Prestataire_ATTRIBUTION: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'Situation SAP', 'PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Procurement_ATTRIBUTION: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'Situation SAP', 'PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    GRE_A_GRE: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Rapport circonstancié'],
    AVENANT: ['Lettre d’opportunité', 'Rapport circonstancié', 'Contrat'],
    RECOURS: ['Dossier de consultation', 'Lettre d’opportunité', 'Cahier des charges', 'Offre']
  };

  // Champs requis dynamiques
  DonneeRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['typologiemarche', 'Garantie', 'montantEstime', 'budgetEstime', 'delaiRealisation'],
    Consultation_Prestataire_de_Lancement: ['typologiemarche', 'Garantie', 'montantEstime', 'budgetEstime', 'delaiRealisation'],
    Consultation_Procurement_de_Lancement: ['typologiemarche', 'Garantie', 'montantEstime', 'budgetEstime', 'delaiRealisation'],
    APPEL_OFFRE_ATTRIBUTION: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'delaiRealisation', 'experiencefournisseur', 'nombredeprojetssimilaires', 'notationinterne', 'chiffreaffaire', 'situationfiscale', 'fournisseurblacklist', 'typeFournisseur', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'],
    Consultation_Prestataire_ATTRIBUTION: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'delaiRealisation', 'experiencefournisseur', 'nombredeprojetssimilaires', 'notationinterne', 'chiffreaffaire', 'situationfiscale', 'fournisseurblacklist', 'typeFournisseur', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'],
    Consultation_Procurement_ATTRIBUTION: ['nomFournisseur', 'montantContrat', 'dureeContrat', 'delaiRealisation', 'experiencefournisseur', 'nombredeprojetssimilaires', 'notationinterne', 'chiffreaffaire', 'situationfiscale', 'fournisseurblacklist', 'typeFournisseur', 'fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'],
    GRE_A_GRE: ['montantEstime', 'budgetEstime', 'dureeContrat', 'delaiRealisation'],
    AVENANT: ['numeroContrat', 'dateSignatureContrat', 'dureeContrat', 'dateExpirationContrat', 'montantContrat', 'objetAvenant', 'montantAvenant', 'dureeAvenant']
  };

  // Libellés des champs
  champLabels: { [key: string]: string } = {
    fournisseurEtranger: 'Fournisseur Étranger',
    fournisseurEtrangerInstallationPermanente: "Installation Permanente à l'Étranger",
    originePaysNonDoubleImposition: 'Origine - Pays sans Double Imposition',
    montantEstime: 'Montant Estimé',
    dureeContrat: 'Durée du Contrat',
    nomFournisseur: 'Nom du Fournisseur'
    // Ajoute plus si nécessaire
  };

  constructor(
    private fb: FormBuilder,
    private dossierService: DossierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dossierForm = this.fb.group({
      numeroDossier: ['', Validators.required],
      intitule: ['', Validators.required],
      typePassation: ['', Validators.required],
      fichiers: this.fb.array([])
    });

    this.dossierService.getPassations().subscribe({
      next: (data) => this.passations = data,
      error: (err) => console.error('Erreur lors de la récupération des passations :', err)
    });
  }

  get fichiers(): FormArray {
    return this.dossierForm.get('fichiers') as FormArray;
  }

  // 🔁 Quand le type de passation change
  onTypePassationChange(type: string): void {
    this.fichiers.clear();
    this.selectedFichiers = this.fichiersRequis[type] || [];

    this.selectedFichiers.forEach(() => {
      this.fichiers.push(this.fb.control(null));
    });

    // Supprimer anciens champs dynamiques
    Object.keys(this.dossierForm.controls).forEach(champ => {
      if (!['numeroDossier', 'intitule', 'typePassation', 'fichiers'].includes(champ)) {
        this.dossierForm.removeControl(champ);
      }
    });

    // Ajouter les champs spécifiques
    (this.DonneeRequis[type] || []).forEach(champ => {
      const isCheckbox = ['fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'].includes(champ);
      this.dossierForm.addControl(champ, this.fb.control(isCheckbox ? false : '', Validators.required));
    });

    // Cas spécial pour fichier groupement
    if (type.includes('ATTRIBUTION')) {
      this.dossierForm.addControl('typeFournisseur', this.fb.control('', Validators.required));
    }
  }

  // 🧠 Utilitaires
  isCheckbox(champ: string): boolean {
    return ['fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'].includes(champ);
  }

  isFournisseurEtrangerSelected(): boolean {
    return this.dossierForm.value.typeFournisseur === 'etranger';
  }

  isGroupementSelected(): boolean {
    return this.dossierForm.value.typeFournisseur === 'groupement';
  }

  ajouterFichierSupplementaire(): void {
    this.fichiers.push(this.fb.control(null));
    this.selectedFichiers.push("Autre fichier " + (this.selectedFichiers.length + 1));
  }

  onFileSelect(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.fichiers.at(index).setValue(file);
    }
  }

  onPvGroupementSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.dossierForm.addControl('pvGroupement', this.fb.control(file, Validators.required));
    }
  }

  // 🚀 Soumission
  onSubmit(): void {
    if (this.dossierForm.invalid) {
      alert("❌ Veuillez remplir tous les champs requis !");
      return;
    }

    const formData = new FormData();
    const { numeroDossier, intitule, typePassation } = this.dossierForm.value;

    formData.append("numeroDossier", numeroDossier);
    formData.append("intitule", intitule);
    formData.append("typePassation", typePassation);

    this.fichiers.controls.forEach((control, index) => {
      const file = control.value;
      if (file) {
        formData.append("files", file);
        formData.append("fileNames", this.selectedFichiers[index]);
      }
    });

    (this.DonneeRequis[typePassation] || []).forEach(champ => {
      formData.append(champ, this.dossierForm.value[champ]);
    });

    if (this.isGroupementSelected()) {
      const pvFile = this.dossierForm.get('pvGroupement')?.value;
      if (pvFile) {
        formData.append('pvGroupement', pvFile);
      }
    }

    // 📤 Envoi
    this.dossierService.ajouterDossier(formData).subscribe({
      next: () => {
        alert("✅ Dossier ajouté avec succès !");
        this.dossierForm.reset();
        this.selectedFichiers = [];
        this.router.navigate(['/dossier']);
      },
      error: (err) => {
        console.error("❌ Erreur lors de l'ajout du dossier :", err);
        alert("Erreur serveur, veuillez réessayer.");
      }
    });
  }
}
