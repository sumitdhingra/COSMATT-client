import { SizingComponentType } from '../models/sizing.enum';
import { EventEmitter } from '@angular/core';
import { IComponentFormData, IComponentProfileElementData, IComponentFormValidationData} from './sizing-component-output.interface';

// interface which must be implemented by all sizing components
export interface ISizingComponent {
    // Interface event emitter object
    formDataUpdateEvent: EventEmitter<IComponentFormData>;

    // event to inform axis or other components about form valid / invalid status
    formValidEvent: EventEmitter<IComponentFormValidationData>;

    // Interface event emitter object to return the updated profile elements array
    profileElementListUpdateEvent: EventEmitter<IComponentProfileElementData>;

    // Interface function to return the display name of the page (to be displayed at the top of the page) 
    getDisplayName(): string;

    // Interface function to return the page heading text
    getPageHeadingText(): string;

    // Interface function to return the page sub-heading text
    getPageSubHeadingText(): string;
}
