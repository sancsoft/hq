import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HQService } from '../../services/hq.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { APIError } from '../../errors/apierror';
import { ToastService } from '../../services/toast.service';

interface Form {
  name: FormControl<string>;
  officialName: FormControl<string | null>;
  billingEmail: FormControl<string | null>;
  hourlyRate: FormControl<number | null>;
}

@Component({
  selector: 'hq-client-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-create.component.html'
})
export class ClientCreateComponent {

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

  constructor(private hqService: HQService, private router: Router, private route: ActivatedRoute, private toastService: ToastService) {
  }

  async submit() {
    this.form.markAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      const request = this.form.value;
      const response = await firstValueFrom(this.hqService.upsertClientV1(request));
      this.router.navigate(['../', response.id], { relativeTo: this.route });
      this.toastService.show('Accepted', 'Client has been created.');

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

}
