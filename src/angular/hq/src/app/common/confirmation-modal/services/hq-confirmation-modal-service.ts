import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class HQConfirmationModalService {
  private messageSource = new BehaviorSubject<string | null>(null);
  private performAction = new BehaviorSubject<boolean | null>(null);
  currentMessage = this.messageSource.asObservable();
  cuurentAction = this.performAction.asObservable();

  showModal(message: string) {
    this.messageSource.next(message);
   }
   performActionWith(action: boolean) {
    this.performAction.next(action);
    this.hideModal();
   }
   hideModal() {
    this.messageSource.next(null);
   }


}
