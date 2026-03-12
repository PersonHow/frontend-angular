import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { 
    PageResponse, 
    ResponseListItem, 
    ResponseDetail, 
    SubmitResponseRequest, 
    SubmitResponseResponse, 
    StatisticsResponse 
} from '../../shared/models';
import { API_ENDPOINTS } from '../../shared/constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class ResponseService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ==================== 管理員 - 回覆管理 ====================

    /**
     * 獲取問卷回覆列表（管理員）
     */
    getAdminSurveyResponses(surveyId: number, page = 0, size = 10): Observable<PageResponse<ResponseListItem>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PageResponse<ResponseListItem>>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.SURVEY_RESPONSES(surveyId)}`,
            { params }
        );
    }

    /**
     * 獲取回覆詳情（管理員）
     */
    getAdminResponseDetail(id: number): Observable<ResponseDetail> {
        return this.http.get<ResponseDetail>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.RESPONSE_DETAIL(id)}`
        );
    }

    /**
     * 獲取問卷統計（管理員）
     */
    getAdminSurveyStatistics(surveyId: number): Observable<StatisticsResponse> {
        return this.http.get<StatisticsResponse>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.SURVEY_STATISTICS(surveyId)}`
        );
    }

    /**
     * 獲取問卷統計（公開）
     */
    getPublicSurveyStatistics(surveyId: number): Observable<StatisticsResponse> {
        return this.http.get<StatisticsResponse>(
            `${this.apiUrl}${API_ENDPOINTS.PUBLIC.SURVEY_STATISTICS(surveyId)}`
        );
    }

    // ==================== 會員 - 回覆管理 ====================

    /**
     * 獲取我的填寫記錄（會員）
     */
    getMemberResponses(page = 0, size = 10): Observable<PageResponse<ResponseListItem>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PageResponse<ResponseListItem>>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.RESPONSES}`,
            { params }
        );
    }

    /**
     * 獲取填寫記錄詳情（會員）
     */
    getMemberResponseDetail(id: number): Observable<ResponseDetail> {
        return this.http.get<ResponseDetail>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.RESPONSE_DETAIL(id)}`
        );
    }

    // ==================== 公開 - 回覆 ====================

    /**
     * 提交問卷（公開/會員）
     */
    submitResponse(surveyId: number, request: SubmitResponseRequest): Observable<SubmitResponseResponse> {
        return this.http.post<SubmitResponseResponse>(
            `${this.apiUrl}${API_ENDPOINTS.PUBLIC.SUBMIT_RESPONSE(surveyId)}`,
            request
        );
    }
}
