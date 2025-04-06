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

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: "app-dossier",
  standalone: true,
  imports: [AgGridAngular, CommonModule, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule],
  templateUrl: "./dossier.component.html",
  styleUrls: ["./dossier.component.scss"],
})
export class DossierComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: "Numéro Dossier", field: "numero", sortable: true, filter: true },
    { headerName: "Intitulé", field: "intitule", sortable: true, filter: true },
    { headerName: "Type Passation", field: "typePassation", sortable: true, filter: true },
    { headerName: "État", field: "etat", sortable: true, filter: true },
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
        console.log("Valeur de params.value :", params.value);
        if (!params.value || typeof params.value !== 'object') return '';

        const files = Object.keys(params.value).map(fileName => ({
          name: fileName,
          url: params.value[fileName]
        }));

        const fragment = document.createDocumentFragment();
        files.forEach(file => {
          const link = document.createElement('a');
          link.href = file.url;
          link.target = '_blank';
          link.className = 'text-primary';
          link.textContent = file.name;
          fragment.appendChild(link);
          fragment.appendChild(document.createElement('br'));
        });
        return fragment;
      },
      width: 250,
    }
  ];

  defaultColDef = { flex: 1, minWidth: 120, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(private dossierService: DossierService, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.getDossiers();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  getDossiers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dossierService.getAllDossiers().subscribe({
      next: (data) => {
        console.log("✅ Données reçues :", data);

        this.rowData = data.map(dossier => {
          const mappedRow = {
            numero: dossier?.dossier?.numeroDossier?.toString() || '',
            intitule: dossier?.dossier?.intitule || '',
            typePassation: dossier?.dossier?.typePassation || '',
            dateSoumission: dossier?.dossier?.dateSoumission,
            etat: dossier?.dossier?.etat || '',
            fileDetails: dossier.fileDetails
          };
          console.log("Ligne mappée :", mappedRow);
          return mappedRow;
        });

        console.log("rowData :", this.rowData);
        this.filteredData = this.rowData.slice();
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des dossiers :", err);
        this.errorMessage = "Erreur lors du chargement des dossiers. Veuillez réessayer.";
        this.loading = false;
      }
    });
  }

  private formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
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
    if (!target || !target.value) return;

    const query = target.value.toLowerCase();

    this.filteredData = this.rowData.filter(dossier =>
      (dossier.numero && dossier.numero.toLowerCase().includes(query)) ||
      (dossier.intitule && dossier.intitule.toLowerCase().includes(query)) ||
      (dossier.typePassation && dossier.typePassation.toLowerCase().includes(query)) ||
      (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
      (dossier.etat && dossier.etat.toLowerCase().includes(query)) ||
      (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query)))
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}
