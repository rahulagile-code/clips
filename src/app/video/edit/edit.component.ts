import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  alertMsg = 'blue';
  alertColor = 'Please wait! Updating clip.';
  showAlert = false;
  isSubmission = false;
  @Input() activeClip?: IClip | null;
  @Output() update = new EventEmitter();
  clipID = new FormControl('', { nonNullable: true });

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });

  editForm = new FormGroup({
    title: this.title,
  });

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return;
    }
    this.clipID.setValue(this.activeClip.docId as string);
    this.title.setValue(this.activeClip.title);
    this.isSubmission = false;
    this.showAlert = false;
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.showAlert = true;
    this.isSubmission = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Updating clip.';

    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (error) {
      this.alertMsg = 'Something Went Wrong. Try again later';
      this.alertColor = 'red';
      this.isSubmission = true;
      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);
    this.isSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }
}
