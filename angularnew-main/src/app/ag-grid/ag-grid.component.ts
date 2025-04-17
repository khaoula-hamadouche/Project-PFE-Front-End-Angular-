import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-ag-grid',
  imports:[CommonModule],
  templateUrl: './ag-grid.component.html',
  styleUrls: ['./ag-grid.component.scss']
})
export class AgGridComponent {
  private apiUrl = 'http://localhost:8080/api/pdf/extract'; // API backend

  fournisseur: string = '';
  montant: string = '';
  etablissement: string = '';
  isLoading: boolean = false; // Indicateur de chargement

  constructor(private http: HttpClient) {}

  // Méthode pour télécharger le fichier et récupérer la réponse de l'API
  uploadPdf(file: File) {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post<string[]>(this.apiUrl, formData); // Retourne un tableau de chaînes
  }
  
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isLoading = true;
  
      this.uploadPdf(file).subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response);
  
          // La chaîne de texte est retournée sous forme de tableau de chaînes
          const text = response[0];
  
          // Extraction du fournisseur et du montant à l'aide d'expressions régulières
          const fournisseurMatch = text.match(/Fournisseur\s*:\s*([^\\n]+)/);
          const montantMatch = text.match(/Montant du contrat\s*:\s*([^\\n]+)/);
          const etablissementMatch = text.match(/etablissement du contrat\s*:\s*([^\\n]+)/);
  
          // Affecter les résultats ou 'Non spécifié' si non trouvé
          this.fournisseur = fournisseurMatch ? fournisseurMatch[1].trim() : 'Non spécifié';
          this.montant = montantMatch ? montantMatch[1].trim() : 'Non spécifié';
          this.etablissement = etablissementMatch ? etablissementMatch[1].trim() : 'Non spécifié';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors de l\'envoi du PDF', err);
          this.isLoading = false;
        }
      });
    }
  }
  
}
