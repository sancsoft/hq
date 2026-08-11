import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { CoreModule } from '../../core/core.module';
import { ProjectListService } from './project-list.service';
import { BaseListService } from '../../core/services/base-list.service';

@Component({
  selector: 'hq-project-list',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    InRolePipe,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: ProjectListService,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent {
  HQRole = HQRole;
  Math = Math;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public listService: ProjectListService,
  ) {
    this.listService.refresh();
  }
}
