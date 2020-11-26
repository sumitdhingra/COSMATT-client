import { Directive, Input, ContentChild, TemplateRef } from '@angular/core';

@Directive({selector: '[cosmattTableCell]'})
export class CosmattTableCellDirective {
    @Input('cosmattTableCell') type: string;
    constructor (public template: TemplateRef<any>) {}
}