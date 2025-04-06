import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierService } from '../../../service/dossier.service';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-edit-dossier',
  templateUrl: './edit-dossier.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: ['./edit-dossier.component.css']
})
export class EditDossierComponent {}
