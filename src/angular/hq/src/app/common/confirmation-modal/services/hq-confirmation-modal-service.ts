import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HQConfirmationModalService {
  private messageSource = new BehaviorSubject<string | null>(null);
  showNotes = new BehaviorSubject<boolean | null>(false);

  private performAction = new Subject<boolean | null>();
  private notes = new BehaviorSubject<string | null>(null);
  currentNotes = this.notes.asObservable();
  currentMessage = this.messageSource.asObservable();
  cuurentAction = this.performAction.asObservable();

  showModal(message: string, showNotes: boolean = false) {
    this.messageSource.next(message);
    this.showNotes.next(showNotes);
  }
  performActionWith(action: boolean) {
    this.performAction.next(action);
    this.hideModal();
  }
  hideModal() {
    this.messageSource.next(null);
    this.showNotes.next(null);
  }
  saveNotes(notes: string) {
    this.notes.next(notes);
  }
  getNotes() {
    return this.notes.getValue();
  }
}
