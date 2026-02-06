// ============================================
// API 服務 - HTTP 請求封裝
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { PageResponse } from '../../shared/models';
import {
    SurveyListItem,
    SurveyDetail,
    SurveySearchRequest,
    CreateSurveyRequest,
    UpdateSurveyRequest,
    ResponseListItem,
    ResponseDetail,
    SubmitResponseRequest,
    SubmitResponseResponse,
    StatisticsResponse,
    MemberProfileResponse,
    UpdateMemberProfileRequest
} from '../../shared/models';
import { API_ENDPOINTS } from '../../shared/constants/app.constants';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ==================== 管理員 - 問卷管理 ====================

    /**
     * 獲取問卷列表（管理員）
     */
    getAdminSurveys(params?: SurveySearchRequest): Observable<PageResponse<SurveyListItem>> {
        const httpParams = this.buildSearchParams(params);
        return this.http.get<PageResponse<SurveyListItem>>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.SURVEYS}`,
            { params: httpParams }
        );
    }

    /**
     * 獲取問卷詳情（管理員）
     */
    getAdminSurveyDetail(id: number): Observable<SurveyDetail> {
        return this.http.get<SurveyDetail>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.SURVEY_DETAIL(id)}`
        );
    }

    /**
     * 創建問卷（管理員）
     */
    createAdminSurvey(request:CreateSurveyRequest): Observable<SurveyDetail>{
        return this.http.post<SurveyDetail>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.CREATE_SURVEY}`, request
        )
    }

    /**
     * 更新問卷（管理員）
     */
    updateAdminSurvey(id: number, request: UpdateSurveyRequest): Observable<SurveyDetail> {
        return this.http.put<SurveyDetail>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.SURVEY_DETAIL(id)}`,
            request
        );
    }

    /**
     * 刪除問卷（管理員）
     */
    deleteAdminSurvey(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}${API_ENDPOINTS.ADMIN.SURVEY_DETAIL(id)}`
        );
    }

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

    // ==================== 會員 - 問卷管理 ====================

    /**
     * 創建問卷（會員）
     */
    createMemberSurvey(request: CreateSurveyRequest): Observable<SurveyDetail> {
        return this.http.post<SurveyDetail>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.CREATE_SURVEY}`,
            request
        );
    }

    /**
     * 獲取我的問卷列表（會員）
     */
    getMemberSurveys(params?: SurveySearchRequest): Observable<PageResponse<SurveyListItem>> {
        const httpParams = this.buildSearchParams(params);
        return this.http.get<PageResponse<SurveyListItem>>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.SURVEYS}`,
            { params: httpParams }
        );
    }

    /**
     * 獲取問卷詳情（會員）
     */
    getMemberSurveyDetail(id: number): Observable<SurveyDetail> {
        return this.http.get<SurveyDetail>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.SURVEY_DETAIL(id)}`
        );
    }

    /**
     * 更新問卷（會員）
     */
    updateMemberSurvey(id: number, request: UpdateSurveyRequest): Observable<SurveyDetail> {
        return this.http.put<SurveyDetail>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.SURVEY_DETAIL(id)}`,
            request
        );
    }

    /**
     * 刪除問卷（會員）
     */
    deleteMemberSurvey(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}${API_ENDPOINTS.MEMBER.SURVEY_DETAIL(id)}`
        );
    }

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

    // ==================== 公開 ====================

    /**
     * 獲取公開問卷列表
     */
    getPublicSurveys(params?: SurveySearchRequest): Observable<PageResponse<SurveyListItem>> {
        const httpParams = this.buildSearchParams(params);
        return this.http.get<PageResponse<SurveyListItem>>(
            `${this.apiUrl}${API_ENDPOINTS.PUBLIC.SURVEYS}`,
            { params: httpParams }
        );
    }

    /**
     * 獲取公開問卷詳情
     */
    getPublicSurveyDetail(id: number): Observable<SurveyDetail> {
        return this.http.get<SurveyDetail>(
            `${this.apiUrl}${API_ENDPOINTS.PUBLIC.SURVEY_DETAIL(id)}`
        );
    }

    /**
     * 提交問卷（公開/會員）
     */
    submitResponse(surveyId: number, request: SubmitResponseRequest): Observable<SubmitResponseResponse> {
        return this.http.post<SubmitResponseResponse>(
            `${this.apiUrl}${API_ENDPOINTS.PUBLIC.SUBMIT_RESPONSE(surveyId)}`,
            request
        );
    }

    // ==================== 工具方法 ====================

    /**
     * 構建搜尋參數
     */
    private buildSearchParams(params?: SurveySearchRequest): HttpParams {
        let httpParams = new HttpParams();

        if (params) {
            if (params.title) {
                httpParams = httpParams.set('title', params.title);
            }
            if (params.status) {
                httpParams = httpParams.set('status', params.status);
            }
            if (params.start_date) {
                httpParams = httpParams.set('startDate', params.start_date);
            }
            if (params.end_date) {
                httpParams = httpParams.set('endDate', params.end_date);
            }
            if (params.page !== undefined) {
                httpParams = httpParams.set('page', params.page.toString());
            }
            if (params.size !== undefined) {
                httpParams = httpParams.set('size', params.size.toString());
            }
        }

        return httpParams;
    }
}
