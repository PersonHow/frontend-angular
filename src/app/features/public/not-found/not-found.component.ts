import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, FileQuestion } from 'lucide-angular';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
    readonly icons = { FileQuestion };
}
