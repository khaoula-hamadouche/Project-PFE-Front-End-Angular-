import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartData, ChartDataset, ChartOptions, Color } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../service/storage-service/storage.service'; // Assurez-vous que le chemin est correct

interface BarChartData extends ChartData<'bar'> {
  labels: string[];
  datasets: (ChartDataset<'bar'> & {
    label: string;
    backgroundColor: Color | Color[];
    data: number[];
  })[];
}

interface DoughnutChartData extends ChartData<'doughnut'> {
  datasets: (ChartDataset<'doughnut'> & {
    backgroundColor: string[];
    data: number[];
  })[];
}

interface UserRoleStat {
  role: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [ChartjsComponent, BaseChartDirective, CommonModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dossiers Chart Data and Options
  data: DoughnutChartData = {
    labels: ['VALIDE', 'REJETE', 'EN_ATTENTE', 'EN_TRAITEMENT'],
    datasets: [
      {
        backgroundColor: ['#008000', '#FF0000', '#FFFF00', '#87CEEB'], // Vert, Rouge, Jaune, Bleu Ciel
        data: []
      }
    ]
  };
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Users by Role Chart Data and Options
  usersByRoleData: BarChartData = {
    labels: [],
    datasets: [
      {
        label: 'Nombre d\'utilisateurs',
        backgroundColor: '#63c2de',
        data: []
      }
    ]
  };
  usersByRoleChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return '';
          },
          stepSize: 1, // Ensure only whole numbers are displayed
        },
      },
    },
  };

  // User-Specific Dossiers Chart Data and Options
  userDossiersData: DoughnutChartData = {
    labels: ['VALIDE', 'REJETE', 'EN_ATTENTE', 'EN_TRAITEMENT'],
    datasets: [
      {
        backgroundColor: ['#008000', '#FF0000', '#FFFF00', '#87CEEB'], // Vert, Rouge, Jaune, Bleu Ciel
        data: []
      }
    ]
  };
  userDossiersChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  canViewUserRoles: boolean = false;
  canViewDossierStats: boolean = false;
  canViewUserDossiersStats: boolean = false;

  totalDossiers: number = 0;
  pourcentageValide: number = 0;
  pourcentageRejete: number = 0;
  pourcentageEnAttente: number = 0;
  pourcentageEnTraitement: number = 0;
  totalUsers: number = 0;
  totalUserDossiers: number = 0;
  pourcentageUserValide: number = 0;
  pourcentageUserRejete: number = 0;
  pourcentageUserEnAttente: number = 0;
  pourcentageUserEnTraitement: number = 0;
  usersByRoleCounts: { [role: string]: number } = {};
  private ngUnsubscribe = new Subject<void>();

  @ViewChild('chartComponentDossiers') chartComponentDossiers!: ChartjsComponent;
  @ViewChild('chartComponentRoles') chartComponentRoles!: ChartjsComponent;
  @ViewChild('chartComponentUserDossiers') chartComponentUserDossiers!: ChartjsComponent;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService // Inject StorageService
  ) {}

  ngOnInit(): void {
    const permissions = this.storageService.getPermissions();
    this.canViewUserRoles = permissions.includes('GETALLROLE');
    this.canViewDossierStats = permissions.includes('GETALLDOSSIER');
    this.canViewUserDossiersStats = permissions.includes('GETDOSSIERBYUSER'); // Check for the new permission

    if (this.canViewDossierStats) {
      this.fetchDossierStats();
    }
    if (this.canViewUserRoles) {
      this.fetchUsersByRoleStats();
    }
    if (this.canViewUserDossiersStats) {
      this.fetchUserDossierStats(); // Call the new fetch method
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  fetchDossierStats(): void {
    this.http.get<any>('http://localhost:8085/api/dossiers/stats/etat').pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (response && typeof response === 'object') {
          this.data.datasets[0].data = [
            response.VALIDE || 0,
            response.REJETE || 0,
            response.EN_ATTENTE || 0,
            response.EN_TRAITEMENT || 0
          ];
          this.calculateDossierAnalysis();
          this.updateDossierChart();
        } else {
          console.error('Réponse des statistiques des dossiers invalide:', response);
          this.totalDossiers = 0; // S'assurer que l'analyse ne s'affiche pas avec des données invalides
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la récupération des statistiques des dossiers', error);
        this.totalDossiers = 0; // S'assurer que l'analyse ne s'affiche pas en cas d'erreur
        this.cdr.detectChanges();
      }
    );
  }

  fetchUsersByRoleStats(): void {
    this.http.get<UserRoleStat[]>('http://localhost:8081/api/statistics/users-by-role', { withCredentials: true }).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          this.usersByRoleData.labels = response.map(stat => stat.role);
          this.usersByRoleData.datasets[0].data = response.map(stat => stat.count);
          this.calculateUserRoleAnalysis(response);
          this.updateUsersByRoleChart();
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Erreur lors de la récupération des statistiques des utilisateurs par rôle', error);
        }
      );
  }

  fetchUserDossierStats(): void {
    this.http.get<any>('http://localhost:8085/api/dossiers/stats/etat/by-user', { withCredentials: true}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (response && typeof response === 'object') {
          this.userDossiersData.datasets[0].data = [
            response.VALIDE || 0,
            response.REJETE || 0,
            response.EN_ATTENTE || 0,
            response.EN_TRAITEMENT || 0
          ];
          this.calculateUserDossierAnalysis(); // Call the new analysis method
          this.updateUserDossierChart();
        } else {
          console.error('Réponse des statistiques des dossiers utilisateur invalide:', response);
          this.totalUserDossiers = 0;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la récupération des statistiques des dossiers par utilisateur', error);
        this.totalUserDossiers = 0;
        this.cdr.detectChanges();
      }
    );
  }

  calculateUserDossierAnalysis(): void {
    const data = this.userDossiersData.datasets[0].data;
    this.totalUserDossiers = data.reduce((sum, value) => sum + value, 0);
    if (this.totalUserDossiers > 0) {
      this.pourcentageUserValide = (data[0] / this.totalUserDossiers) * 100;
      this.pourcentageUserRejete = (data[1] / this.totalUserDossiers) * 100;
      this.pourcentageUserEnAttente = (data[2] / this.totalUserDossiers) * 100;
      this.pourcentageUserEnTraitement = (data[3] / this.totalUserDossiers) * 100;
    } else {
      this.pourcentageUserValide = 0;
      this.pourcentageUserRejete = 0;
      this.pourcentageUserEnAttente = 0;
      this.pourcentageUserEnTraitement = 0;
    }
  }

  calculateUserRoleAnalysis(data: UserRoleStat[]): void {
    this.totalUsers = data.reduce((sum, stat) => sum + stat.count, 0);
    this.usersByRoleCounts = data.reduce((acc: { [key: string]: number }, stat) => {
      acc[stat.role] = stat.count;
      return acc;
    }, {});
  }

  calculateDossierAnalysis(): void {
    const data = this.data.datasets[0].data;
    this.totalDossiers = data.reduce((sum, value) => sum + value, 0);
    if (this.totalDossiers > 0) {
      this.pourcentageValide = (data[0] / this.totalDossiers) * 100;
      this.pourcentageRejete = (data[1] / this.totalDossiers) * 100;
      this.pourcentageEnAttente = (data[2] / this.totalDossiers) * 100;
      this.pourcentageEnTraitement = (data[3] / this.totalDossiers) * 100;
    } else {
      this.pourcentageValide = 0;
      this.pourcentageRejete = 0;
      this.pourcentageEnAttente = 0;
      this.pourcentageEnTraitement = 0;
    }
  }

  updateDossierChart(): void {
    if (this.chartComponentDossiers && this.chartComponentDossiers.chart) {
      this.chartComponentDossiers.chart.update();
    }
  }

  updateUsersByRoleChart(): void {
    if (this.chartComponentRoles && this.chartComponentRoles.chart) {
      this.chartComponentRoles.chart.update();
    }
  }

  updateUserDossierChart(): void {
    if (this.chartComponentUserDossiers && this.chartComponentUserDossiers.chart) {
      this.chartComponentUserDossiers.chart.update();
    }
  }
}
