import { Component } from '@angular/core';
import { EmailService } from 'src/app/service/email.service';
import {  
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TableDirective, TextColorDirective 
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-sent',
  imports: [CommonModule, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, IconDirective, ReactiveFormsModule, TableDirective]
      ,
  templateUrl: './sent.component.html',
  styleUrl: './sent.component.scss'
})
export class SentComponent {
 emails: any[] = [];
    constructor(private emailService: EmailService) {}
  
    ngOnInit(): void {
      this.loademails();
    }
  
    loademails() {
      this.emailService.getemailsenvoyer().subscribe(
        (data) => this.emails = data,
        (error) => console.error('Erreur lors du chargement des emails', error)
      );
    }
    openAttachment(filePath: string): void {
      window.open(filePath, '_blank');
    }
}
