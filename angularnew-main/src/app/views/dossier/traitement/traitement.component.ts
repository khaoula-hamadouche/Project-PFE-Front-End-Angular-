import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";

@Component({
  selector: 'app-traitement',
  templateUrl: './traitement.component.html',
  styleUrls: ['./traitement.component.css'],
  imports: [
    MatSlideToggleModule,
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCard,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatCardHeader,
    MatGridTile,
    MatGridList,
  ],
})
export class TraitementComponent implements OnInit {
  dossierDetails: any;
  errorMessage: string | null = null;
  infoFormGroup: FormGroup = this._formBuilder.group({});
  detailsFormGroup: FormGroup = this._formBuilder.group({});
  filesFormGroup: FormGroup = this._formBuilder.group({});
  doneFormGroup: FormGroup = this._formBuilder.group({
    doneCtrl: [false],
    compteRenduCtrl: [''],

  });

  constructor(
    private route: ActivatedRoute,
    private dossierService: DossierService,
    private _formBuilder: FormBuilder,
    private router: Router,
  ) {}

  dossierId!: number;
  ngOnInit(): void {
    this.loadDossierDetails();
    this.dossierId = +this.route.snapshot.paramMap.get('id')!;
    // Les initialisations des FormGroup sont déjà faites dans la déclaration des propriétés
  }

  loadDossierDetails(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.dossierService.getDossierById(id).subscribe({
      next: (data) => {
        this.dossierDetails = data;
        console.log('✅ Détails du dossier chargés:', this.dossierDetails);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des détails du dossier.';
        console.error('❌ Erreur lors du chargement des détails du dossier:', error);
      }
    });
  }

  submitForm(): void {
    if (this.doneFormGroup.valid) {
      const compteRendu = this.doneFormGroup.value.compteRenduCtrl;
      const estTermine = this.doneFormGroup.value.doneCtrl;
      const dossierId = this.dossierDetails?.dossier?.id;

      console.log('Compte Rendu:', compteRendu);
      console.log('Dossier Terminé:', estTermine);
      console.log('ID du Dossier:', dossierId);

      // Ici, vous pouvez appeler votre service pour enregistrer le compte rendu et l'état du dossier.
    } else {
      alert('Veuillez remplir le compte rendu si nécessaire.');
    }
  }

  protected readonly Object = Object;


  onChangerEtat(id: number, nouvelEtat: string): void {
    if (!id) {
      console.error('ID de dossier manquant.');
      return;
    }

    this.dossierService.changerEtatDossier(id, nouvelEtat).subscribe({
      next: (response) => {
        console.log('État changé avec succès', response);
        // Redirection après succès
        this.router.navigate(['/dossier/dossier']);
      },
      error: (error) => {
        console.error('Erreur lors du changement d\'état :', error);
        // Ici tu peux afficher un message d'erreur à l'utilisateur si tu veux
      }
    });
  }


}
