import { Component, input, output, signal, computed } from "@angular/core";
import { ChevronLeft, ChevronRight, LucideAngularModule } from "lucide-angular";

@Component({
    selector: "app-pagination",
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './pagination.component.html',
    styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
    // Inputs
    currentPage = input<number>(1);
    totalPages = input<number>(1);
    totalItems = input<number>(0);
    pageSize = input<number>(10);
    showJumpTo = input<boolean>(true);
    showTotalItems = input<boolean>(false);

    // Output
    pageChange = output<number>();

    // Signal
    jumpToPage = signal<number>(1);

    readonly icons = {
        chevronLeft: ChevronLeft,
        chevronRight: ChevronRight
    };

    isFirstPage = computed(() => this.currentPage() <= 1);
    isLastPage = computed(() => this.currentPage() >= this.totalPages());

    pageOptions = computed(() => {
        const pages: number[] = [];
        const total = this.totalPages(); // 取得 Signal 的值
        // 從 1 開始，直到 total
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
        return pages;
    });

    // Method
    goToPrevious(): void {
        if (!this.isFirstPage()) {
            this.emitPageChange(this.currentPage() - 1);
        }
    }

    goToNext(): void {
        if (!this.isLastPage()) {
            this.emitPageChange(this.currentPage() + 1);
        }
    }
    
    // (其餘方法保持不變，或確保 emitPageChange 有定義)
    private emitPageChange(page: number): void {
        this.pageChange.emit(page);
    }
    
    // ... 你的其他方法 (onJumpToPageChange, jumpTo 等)
    onJumpToPageChange(event: Event): void {
        const selectEvent = event.target as HTMLSelectElement;
        const page = parseInt(selectEvent.value, 10);
        if (!isNaN(page)) {
            this.jumpToPage.set(page);
        }
    }

    jumpTo(): void {
        const page = this.jumpToPage();
        if (page >= 1 && page <= this.totalPages()) {
            this.emitPageChange(page);
        }
    }
}
