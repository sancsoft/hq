import { BehaviorSubject } from 'rxjs';
import { Injectable } from "@angular/core";

// Duration here is in miliseconds since we are using setTimeout
export interface IHQSnackbarMessage {
  title: string;
  description: string;
  duration?: number;
}
@Injectable({
  providedIn: "root"
})
export class HQSnackBarService {
  private messageSource = new BehaviorSubject<IHQSnackbarMessage | null>(null)
  currentMessage = this.messageSource.asObservable();

  //  This method is used to show the snackbar message and dismiss the snackbar message when provided duration ends or 5000ms (5 seconds) which is the default duration
  showMessage(title: string, description: string, duration?: number) {
    const message: IHQSnackbarMessage = {
      title,
      description,
      duration
    };
    this.messageSource.next(message);
    setTimeout(() => {
      this.messageSource.next(null)
    }, message.duration || 5000)
  }
  hideMessage() {
    this.messageSource.next(null)
  }

}
