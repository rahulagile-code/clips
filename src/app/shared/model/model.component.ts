import { Component, Input, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css'],
})
export class ModelComponent implements OnInit, OnDestroy {
  @Input() modalID: string = '';
  constructor(public modalService: ModalService, public el: ElementRef) {}
  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
  }

  closeModal() {
    this.modalService.toggleModal(this.modalID);
  }

  ngOnDestroy(): void {
    document.body.removeChild(this.el.nativeElement);
  }
}
