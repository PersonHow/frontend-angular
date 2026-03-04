import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import {
    MemberProfileResponse,
    UpdateMemberProfileRequest,
    AdminAccountListDTO,
    AdminAccountDetailDTO,
    PageResponse
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

    // ==================== 管理員 - 針對會員操作 ====================

    /**
     *  獲取所有會員資料
     */
    adminGetAllAccounts(keyword: string = '', page = 0, size = 10): Observable<PageResponse<AdminAccountListDTO>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if(keyword.trim() != ''){
            params = params.set('keyword', keyword.trim());
        }else{
            params = params.set('keyword', keyword);
        }
        console.log(params);
        
        return this.http.get<PageResponse<AdminAccountListDTO>>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.ACCOUNTS}`, {params}
        );

    }

    /**
     *  獲取會員資料（包括所屬問卷）
     */
    adminGetAccountDetail(id: number) :Observable<AdminAccountDetailDTO>{
        return this.http.get<AdminAccountDetailDTO>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.ACCOUNT_DETAIL(id)}`
        );
    }

}
