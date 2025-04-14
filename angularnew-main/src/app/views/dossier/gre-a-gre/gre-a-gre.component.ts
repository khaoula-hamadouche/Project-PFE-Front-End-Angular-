import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective
} from "@coreui/angular";
import {
  ClientSideRowModelModule, ColDef, GridReadyEvent, ModuleRegistry,
  NumberFilterModule, TextFilterModule, ValidationModule, PaginationModule,
  DateFilterModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule, CellStyleModule, ICellRendererParams
} from "ag-grid-community";
import { Router } from "@angular/router";

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: 'app-gre-a-gre',
  templateUrl: './gre-a-gre.component.html',
  styleUrls: ['./gre-a-gre.component.scss'],
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule
  ],
})
export class GreAGreComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },
    { headerName: 'Etat', field: 'etat', sortable: true, filter: true, resizable: true }, // Ajout de la colonne Etat

    { headerName: 'Montant Estimé', field: 'montantEstime', sortable: true, filter: true, resizable: true },
    { headerName: 'Budget Estimé', field: 'budgetEstime', sortable: true, filter: true, resizable: true },
    { headerName: 'Durée Contrat', field: 'dureeContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'Durée Réalisation', field: 'dureeRealisation', sortable: true, filter: true, resizable: true },
    { headerName: 'Chargé', field: 'chargeDossier', sortable: true, filter: true, resizable: true },
    {
      headerName: "Date Soumission",
      field: "dateSoumission",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => this.formatDate(params.value),
      valueGetter: (params) => params.data?.dateSoumission ? new Date(params.data.dateSoumission) : null,
    },
    {
      headerName: 'Fichiers',
      field: 'fileDetails',
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value || typeof params.value !== 'object') return '';
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm';
        button.innerText = '📁 Voir ';
        const dossierId = params.data?.id;
        button.addEventListener('click', () => {
          this.router.navigate([`/dossier/dossiers/${dossierId}/fichiers`]);
        });
        const fragment = document.createDocumentFragment();
        fragment.appendChild(button);
        return fragment;
      },
      width: 250,
    },

  ];

  defaultColDef = { flex: 1, minWidth: 120, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(private dossierService: DossierService, private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.getDossiersByTypeOnly();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  getDossiersByTypeOnly(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dossierService.getDossiersByTypeOnly("GRE_A_GRE").subscribe( (data) => {
        console.log("✅ Données GRE_A_GRE reçues :", data);

        this.rowData = data.map((dossier: any) => ({
          id: dossier.id,
          intitule: dossier.intitule,
          numeroDossier: dossier.numeroDossier,
          typePassation: dossier.typePassation,
          dateSoumission: dossier.dateSoumission,
          fileDetails: dossier.fileDetails,
          chargeDossier: dossier.chargeDossier?.name || 'N/A',
          etat: dossier.etat,

          // Champs extraits depuis "details"
          montantEstime: dossier.details?.montantEstime ?? 'N/A',
          budgetEstime: dossier.details?.budgetEstime ?? 'N/A',
          dureeContrat: dossier.details?.dureeContrat ?? 'N/A',
          dureeRealisation: dossier.details?.dureeRealisation ?? 'N/A',
        }));
        console.log("✅ rowData GRE_A_GRE après mapping :", this.rowData);
      },
      (error) => {
        console.error('❌ Erreur lors de la récupération des dossiers GRE_A_GRE :', error);
      }
    );}

  private formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  addActionListeners() {
    const table = document.querySelector("ag-grid-angular");
    if (table) {
      this.renderer.listen(table, "click", (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "A") {
          alert(`Téléchargement de : ${target.innerText}`);
        }
      });
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target || !target.value) {
      this.filteredData = [...this.rowData];
      return;
    }

    const query = target.value.toLowerCase();

    this.filteredData = this.rowData.filter(dossier =>
      (dossier.numeroDossier && dossier.numeroDossier.toLowerCase().includes(query)) ||
      (dossier.intitule && dossier.intitule.toLowerCase().includes(query)) ||
      (dossier.typePassation && dossier.typePassation.toLowerCase().includes(query)) ||
      (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
      (dossier.etat && dossier.etat.toLowerCase().includes(query)) ||
      (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query))) ||
      (dossier.montantEstime && dossier.montantEstime.toString().toLowerCase().includes(query)) ||
      (dossier.budgetEstime && dossier.budgetEstime.toString().toLowerCase().includes(query)) ||
      (dossier.dureeContrat && dossier.dureeContrat.toString().toLowerCase().includes(query)) ||
      (dossier.dureeRealisation && dossier.dureeRealisation.toString().toLowerCase().includes(query)) ||
      (dossier.chargeDossier && dossier.chargeDossier.toLowerCase().includes(query))
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}
