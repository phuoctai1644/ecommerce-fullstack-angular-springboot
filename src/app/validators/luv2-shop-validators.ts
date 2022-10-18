import { FormControl, ValidationErrors } from "@angular/forms";

export class Luv2ShopValidators {

    // Whitespace validation
    static notOnlyWhiteSpace(control: FormControl): ValidationErrors | null {
        
        // Check if string only contains whitespace
        if ((control.value != null) && (control.value.trim().length === 0)) {
            // invalid => return error object
            return {'notOnlyWhiteSpace': true}
        } else {
            // Valid => return null
            return null
        }
    }
}
