import { Component, OnInit, inject, WritableSignal, signal, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JwtService } from '../../service/jwt.service';
import {  CardBodyComponent, CardComponent, ColComponent, RowComponent, TableDirective, TextColorDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../service/storage-service/storage.service';



@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    })
export class DashboardComponent {

}
