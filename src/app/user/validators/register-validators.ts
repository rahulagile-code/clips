import { ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';

export class RegisterValidators {
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        console.error('From controls can not be found in the form group');
        return {
          controlNotfound: false,
        };
      }
      const error =
        control.value === matchingControl.value
          ? null
          : {
              noMatch: true,
            };

      // If Passowrd not match then we set errors to confirm-password form control
      matchingControl.setErrors(error);
      return error;
    };
  } 
}

// new RegisterValidator.match() <~ without static
// RegisterValidator.match()  <~ with static
