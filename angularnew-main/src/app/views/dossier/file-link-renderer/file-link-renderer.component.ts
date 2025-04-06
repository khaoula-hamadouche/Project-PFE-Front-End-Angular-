import { Component, OnInit } from '@angular/core';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-link-renderer',
  imports: [CommonModule],
  templateUrl: "./file-link-renderer.component.html",
  styleUrls: ["./file-link-renderer.component.scss"],
})
export class FileLinkRendererComponent implements OnInit {
  dossiers: any[] = [];

  constructor(private dossierService: DossierService) {}

  ngOnInit(): void {
    this.fetchDossiers();
  }

  fetchDossiers() {
    this.dossierService.getAllDossiers().subscribe({
      next: (data) => {
        console.log("✅ Données reçues :", data);
        this.dossiers = data;
      },
      error: (err) => {
        console.error("❌ Erreur lors de la récupération des dossiers", err);
      }
    });
  }

  getFilesNames(fileDetails: any): string[] {
    return fileDetails ? Object.keys(fileDetails) : [];
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getEtatClass(etat: string): string {
    switch (etat) {
      case 'EN_ATTENTE': return 'badge EN_ATTENTE';
      case 'VALIDÉ': return 'badge VALIDÉ';
      case 'REJETÉ': return 'badge REJETÉ';
      default: return 'badge';
    }
  }

  openFile(url: string) {
    window.open(url, '_blank');
  }

  // Function to get the name of the user who added the dossier
  getAddedByUserName(item: any): string {
    return item?.chargeDossier?.name || 'N/A';
  }
}
