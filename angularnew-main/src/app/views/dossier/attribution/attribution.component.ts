import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
  selector: 'app-attribution',
  templateUrl: './attribution.component.html',
  styleUrls: ['./attribution.component.scss'],
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, FormsModule
  ],
})
export class AttributionComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },

    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: 'Type Passation', field: 'typePassation', sortable: true, filter: true, resizable: true },
    { headerName: "État", field: "etat", sortable: true, filter: true,

      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },
    { headerName: 'Date Soumission', field: 'dateSoumission', sortable: true, filter: 'agDateColumnFilter', valueFormatter: (params) => this.formatDate(params.value) },
    { headerName: 'Chargé', field: 'chargeDossier', sortable: true, filter: true, resizable: true },
    { headerName: 'Nom Fournisseur', field: 'nomFournisseur', sortable: true, filter: true, resizable: true },
    { headerName: 'Montant Contrat', field: 'montantContrat', sortable: true, filter: true, resizable: true },
    { headerName: 'Durée Contrat', field: 'dureeContratAttribution', sortable: true, filter: true, resizable: true }, // Renommé pour éviter la confusion
    { headerName: 'Fournisseur Etranger', field: 'fournisseurEtranger', sortable: true, filter: true, resizable: true, valueFormatter: (params) => params.value ? 'Oui' : 'Non' },
    { headerName: 'Installation Permanente (Etranger)', field: 'fournisseurEtrangerInstallationPermanente', sortable: true, filter: true, resizable: true, valueFormatter: (params) => params.value ? 'Oui' : 'Non' },
    { headerName: 'Origine Pays Non Double Imposition', field: 'originePaysNonDoubleImposition', sortable: true, filter: true, resizable: true, valueFormatter: (params) => params.value ? 'Oui' : 'Non' },
    // Ajoutez ici d'autres colonnes spécifiques si nécessaire
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

  defaultColDef = { flex: 1, minWidth: 150, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(private dossierService: DossierService, private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.loadAllAttributions();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  getEtatTextColorStyle(params: any): any {
    if (params.value === 'EN_ATTENTE') {
      return { 'color': '#ffeb3b', 'font-weight': 'bold' };  // Jaune
    } else if (params.value === 'Terminé') {
      return { 'color': '#4caf50', 'font-weight': 'bold' };  // Vert
    } else if (params.value === 'Annulé') {
      return { 'color': '#f44336', 'font-weight': 'bold' };  // Rouge
    }
    return {};
  }
  loadAllAttributions(): void {
    this.loading = true;
    this.errorMessage = null;
    const types = [ 'APPEL_OFFRE_ATTRIBUTION','Consultation_Prestataire_dAttribution', 'Consultation_Procurement_dAttribution'];

    Promise.all(types.map(type => this.dossierService.getDossiersByTypeOnly(type).toPromise()))
      .then(results => {
        this.rowData = results.flat().map((dossier: any) => ({
          id: dossier.id,
          intitule: dossier.intitule,
          numeroDossier: dossier.numeroDossier,
          typePassation: dossier.typePassation,
          dateSoumission: dossier.dateSoumission,
          etat: dossier.etat,
          fileDetails: dossier.fileDetails,
          chargeDossier: dossier.chargeDossier?.name || 'N/A',
          typeAttribution: dossier.typePassation, // Utiliser le type de passation comme type d'attribution ici
          ...this.extractAttributionSpecificDetails(dossier.details, dossier.typePassation),
        }));
        this.loading = false;
        console.log('✅ Toutes les données d\'attribution chargées :', this.rowData);
      })
      .catch(error => {
        this.errorMessage = 'Erreur lors du chargement des données d\'attribution.';
        this.loading = false;
        console.error('❌ Erreur lors du chargement des données d\'attribution :', error);
      });
  }

  extractAttributionSpecificDetails(details: any, typePassation: string): any {
   if (typePassation === 'Consultation_Prestataire_dAttribution' || typePassation === 'Consultation_Procurement_dAttribution' || typePassation ==='APPEL_OFFRE_ATTRIBUTION') {
      return {
        nomFournisseur: details?.nomFournisseur ?? 'N/A',
        montantContrat: details?.montantContrat ?? 'N/A',
        dureeContratAttribution: details?.dureeContrat ?? 'N/A', // Renommé pour éviter la confusion
        fournisseurEtranger: details?.fournisseurEtranger ?? false,
        fournisseurEtrangerInstallationPermanente: details?.fournisseurEtrangerInstallationPermanente ?? false,
        originePaysNonDoubleImposition: details?.originePaysNonDoubleImposition ?? false,
      };
    }
    return {};
  }

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
        (dossier.chargeDossier && dossier.chargeDossier.toLowerCase().includes(query)) ||
        (dossier.nomFournisseur && dossier.nomFournisseur.toLowerCase().includes(query)) ||
        (dossier.montantContrat && dossier.montantContrat.toString().toLowerCase().includes(query)) ||
        (dossier.dureeContratAttribution && dossier.dureeContratAttribution.toString().toLowerCase().includes(query)) ||
        (dossier.fournisseurEtranger && (dossier.fournisseurEtranger ? 'oui' : 'non').toLowerCase().includes(query)) ||
        (dossier.fournisseurEtrangerInstallationPermanente && (dossier.fournisseurEtrangerInstallationPermanente ? 'oui' : 'non').toLowerCase().includes(query)) ||
        (dossier.originePaysNonDoubleImposition && (dossier.originePaysNonDoubleImposition ? 'oui' : 'non').toLowerCase().includes(query)) ||
        (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query)))
      // Ajoutez ici d'autres propriétés spécifiques pour la recherche si nécessaire
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
  selectedType: string = '';
  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }
}
