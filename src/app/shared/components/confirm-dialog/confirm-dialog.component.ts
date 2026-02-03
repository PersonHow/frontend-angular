import { CommonModule } from "@angular/common";
import { Component, input, output, signal, computed } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [LucideAngularModule, CommonModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss'
})

export class ConfirmDialogComponent {
    isOpen = input<boolean>(false);

    title = input<string>('確認操作');

    message = input<string>('');

    confirmText = input<string>("確認");

    cancelText = input<string>('取消');

    confirmType = input<'main' | 'danger' | 'warning'>('main');

    showCloseButton = input<boolean>(false);

    closeOnOverlay = input<boolean>(false);

    confirmEvent = output<void>();

    cancelEvent = output<void>();

    confirmButtonTypes = computed(() => {
        const type = this.confirmType();
        return {
            'btn-confirm': true,
            'btn-main': type === 'main',
            'btn-warning': type === 'warning',
            'btn-danger': type === 'danger'
        };
    });

    OnConfirm():void{
        this.confirmEvent.emit();
    }

    OnCancel(): void{
        this.cancelEvent.emit();
    }

    OnOverlayClick(): void{
        if(this.closeOnOverlay()){
            this.cancelEvent.emit();
        }
    }

    onDialogClick(event:Event):void{
        event.stopPropagation();
    }
}
