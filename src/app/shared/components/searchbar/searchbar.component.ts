import { Component, input, output } from "@angular/core";
import { SearchField, SearchParams } from "../../models";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { LucideAngularModule, RotateCcw, Search } from "lucide-angular";

@Component({
    selector: "app-search-bar",
    standalone: true,
    imports: [LucideAngularModule, ReactiveFormsModule],
    templateUrl: './searchbar.component.html',
    styleUrl: './searchbar.component.scss'
})

export class SearchBarComponent {
    fields = input.required<SearchField[]>();

    search = output<SearchParams>();
    reset = output<void>();

    searchForm: FormGroup;

    readonly SearchIcon = Search;
    readonly ResetIcon = RotateCcw;

    constructor(
        private fb: FormBuilder
    ) {
        this.searchForm = this.fb.group({});
    }

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        const controls: { [key: string]: any } = {};

        this.fields().forEach(field => {
            controls[field.name] = [''];
        });

        this.searchForm = this.fb.group(controls);
    }

    onSearch(): void {
        const formValue = this.searchForm.value;
        if (formValue['startDate'] && formValue['endDate']) {
            if (new Date(formValue['startDate']) > new Date(formValue['endDate'])) {
                alert('開始時間不得晚於結束時間');
                return;
            }
        }

        if (this.searchForm.valid) {
            const params = this.getSearchParams();
            this.search.emit(params);
        }
    }

    onReset(): void {
        this.searchForm.reset();
        this.reset.emit();
    }

    private getSearchParams(): SearchParams {
        const formValue = this.searchForm.value;
        const params: SearchParams = {};

        Object.keys(formValue).forEach((key) => {
            if (formValue[key]) {
                params[key] = formValue[key];
            }
        })

        return params;
    }


}
