import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}

  isModalOpen(id: string): boolean {
    return Boolean(this.modals.find((element) => element.id === id)?.visible);
  }

  toggleModal(id: string) {
    const modal = this.modals.find((element) => element.id === id);
    if (modal) {
      modal.visible = !modal.visible;
    }
    console.log(modal)
  }

  register(id: string) {
    this.modals.push({
      id: id,
      visible: false,
    });
  }

  unregister(id:string){
    this.modals = this.modals.filter(
      element => element.id !== id
    )
  }
}
