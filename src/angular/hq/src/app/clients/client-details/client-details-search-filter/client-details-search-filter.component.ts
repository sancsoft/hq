import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription, filter, map, takeUntil } from 'rxjs';
import { ClientDetailsService } from '../../client-details.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'hq-client-details-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-details-search-filter.component.html',
})
export class ClientDetailsSearchFilterComponent {
  // searchQuery: string = '';
  // selectedStatus: string = '';
  // showCurrentOnly: boolean = true;

  // private previousSegment: string = '';
  // private destroy$ = new Subject<void>();

  // @ViewChild('searchInput') searchInput: ElementRef | undefined;
  // @ViewChild('statusSelect') statusSelect: ElementRef | undefined;
  // @ViewChild('toggleSwitch') toggleSwitch: ElementRef | undefined;

  // private searchEvent: any;


  constructor(private router: Router, private activatedRoute : ActivatedRoute, public clientDetailService: ClientDetailsService) {

  }
  // ngOnInit(): void {
  //   this.router.events.pipe(
  //     filter(event => event instanceof NavigationEnd),
  //     takeUntil(this.destroy$)
  //   ).subscribe(() => {
  //     let currentRoute = this.activatedRoute.root;

  //     while (currentRoute.children.length > 0) {
  //       currentRoute = currentRoute.children[0];
  //     }
  //     const urlSegments = currentRoute.snapshot.url;
  //     if (urlSegments.length > 0) {
  //       const lastSegment = urlSegments[urlSegments.length - 1].path;
  //       console.log('Last path segment:', lastSegment);
  //       if (this.previousSegment!== lastSegment && this.previousSegment != '') {
  //         this.resetFilters();
  //       }
  //       this.previousSegment = lastSegment;

  //     } else {
  //       console.log('No path segments found.');
  //     }
  //   });

  // }
  // ngOnDestroy() {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  // onSearchQueryChange(event: any) {
  //   this.searchQuery = event.target.value;
  //   this.searchEvent = event
  //   this.updateQueryParams();
  //   console.log(this.searchQuery);
  // }
  // onSelectedStatusChange(event: any) {
  //   this.selectedStatus = event.target.value;
  //   this.updateQueryParams();
  //   console.log(this.selectedStatus);
  // }
  // onShowCurrentOnlyChange(event: any) {
  //   this.showCurrentOnly = event.target.checked;
  //   this.updateQueryParams();
  //   console.log(this.showCurrentOnly);
  // }

  // private updateQueryParams() {
  //   const queryParams = {
  //     search: this.searchQuery,
  //     status: this.selectedStatus,
  //     currentOnly: this.showCurrentOnly
  //   };
  //   this.router.navigate([], {
  //     queryParams: queryParams,
  //     queryParamsHandling: 'merge'
  //   });
  // }

  // private resetFilters() {
  //   console.log('Resetting filters...');
  //   this.searchQuery = '';
  //   this.selectedStatus = 'In Production';
  //   this.showCurrentOnly = true;

  //   if (this.searchInput) {
  //     this.searchInput.nativeElement.value = '';
  //   }
  //   if (this.statusSelect) {
  //     this.statusSelect.nativeElement.value = 'In Production';
  //   }
  //   if (this.toggleSwitch) {
  //     this.toggleSwitch.nativeElement.checked = true;
  //   }

  // }

}
