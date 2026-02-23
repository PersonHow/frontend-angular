import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { 
    MemberProfileResponse, 
    UpdateMemberProfileRequest 
} from '../../shared/models';
import { API_ENDPOINTS } from '../../shared/constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ==================== 會員 - 個人資料 ====================

    /**
     * 獲取個人資料（會員）
     */
    getMemberProfile(): Observable<MemberProfileResponse> {
        return this.http.get<MemberProfileResponse>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.PROFILE}`
        );
    }

    /**
     * 更新個人資料（會員）
     */
    updateMemberProfile(request: UpdateMemberProfileRequest): Observable<MemberProfileResponse> {
        return this.http.put<MemberProfileResponse>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.PROFILE}`,
            request
        );
    }
}
