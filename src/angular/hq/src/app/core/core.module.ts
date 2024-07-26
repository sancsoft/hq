import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent } from './components/tab/tab.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { DateInputComponent } from './components/date-input/date-input.component';
import { StatDisplayComponent } from './components/stat-display/stat-display.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SelectInputComponent } from './components/select-input/select-input.component';
import { DualPanelComponent } from './components/dual-panel/dual-panel.component';
import { TextInputComponent } from './components/text-input/text-input.component';
import { ButtonComponent } from './components/button/button.component';
import { FormLabelComponent } from './components/form-label/form-label.component';
import { TextareaInputComponent } from './components/textarea-input/textarea-input.component';
import { SelectInputOptionDirective } from './directives/select-input-option.directive';
import { ValidationErrorDirective } from './directives/validation-error.directive';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { FileInputComponent } from './components/file-input/file-input.component';
import { TableFooterComponent } from './components/table-footer/table-footer.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TabComponent,
    ProgressBarComponent,
    DateInputComponent,
    StatDisplayComponent,
    SearchInputComponent,
    SelectInputComponent,
    DualPanelComponent,
    TextInputComponent,
    ButtonComponent,
    FormLabelComponent,
    PdfViewerComponent,
    TextareaInputComponent,
    SelectInputOptionDirective,
    ValidationErrorDirective,
    FileInputComponent,
    TableFooterComponent,
  ],
  exports: [
    TabComponent,
    ProgressBarComponent,
    DateInputComponent,
    StatDisplayComponent,
    SearchInputComponent,
    SelectInputComponent,
    DualPanelComponent,
    TextInputComponent,
    ButtonComponent,
    FormLabelComponent,
    PdfViewerComponent,
    TextareaInputComponent,
    SelectInputOptionDirective,
    ValidationErrorDirective,
    FileInputComponent,
    TableFooterComponent,
  ],
})
export class CoreModule {}
