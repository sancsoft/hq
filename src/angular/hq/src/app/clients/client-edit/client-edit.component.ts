import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HQService } from '../../services/hq.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { APIError } from '../../errors/apierror';


interface Form {
  name: FormControl<string>;
  officialName: FormControl<string | null>;
  billingEmail: FormControl<string | null>;
  hourlyRate: FormControl<number | null>;
}

@Component({
  selector: 'hq-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-edit.component.html'
})

export class ClientEditComponent implements OnInit {
  clientId?: string;

  constructor(private hqService: HQService, private router: Router, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.clientId = await (await firstValueFrom(this.route.paramMap.pipe())).get('clientId') ?? undefined
    this.getClient();
  }
  apiErrors?: string[];

  form = new FormGroup<Form>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),
    officialName: new FormControl(null),
    billingEmail: new FormControl(null, {
      validators: [
        Validators.email
      ]
    }),
    hourlyRate: new FormControl(null, {
      validators: [
        Validators.min(0)
      ]
    }),
  });


  private async getClient() {
    try {
      const request = { "id": this.clientId }
      const response = await firstValueFrom(this.hqService.getClientsV1(request));
      const client = response.records[0]
      this.form.setValue({
        name: client.name,
        officialName: client.officialName ?? null,
        billingEmail: client.billingEmail ?? null,
        hourlyRate: client.hourlyRate ?? null
      })
    }
    catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      }
      else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }

  async submit() {
    this.form.markAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      var request = { id: this.clientId, ... this.form.value }
      const response = await firstValueFrom(this.hqService.upsertClientV1(request));
      this.router.navigate(['../', response.id], { relativeTo: this.route });
    }
    catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      }
      else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}