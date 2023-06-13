import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelComponent } from './model/model.component';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
import { TabsComponent } from './tabs/tabs.component';
import { InputComponent } from './input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AlertComponent } from './alert/alert.component';
import { EventBlockerDirective } from './directives/event-blocker.directive';

@NgModule({
  declarations: [
    ModelComponent,
    TabsContainerComponent,
    TabsComponent,
    InputComponent,
    AlertComponent,
    EventBlockerDirective,
  ],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    NgxMaskModule.forRoot()
  ],
  exports: [
    ModelComponent,
    TabsComponent,
    TabsContainerComponent,
    InputComponent,
    AlertComponent,
    EventBlockerDirective
  ],
})
export class SharedModule {}
