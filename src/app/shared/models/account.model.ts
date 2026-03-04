import { AccountSex, Role } from "./auth.model";
import { SurveyListItem } from "./survey.model";
import { PageResponse } from "./common.model";


export interface AdminAccountListDTO{
    id: number,
    name: string,
    email: string,
    phone: string,
    role: Role,
    createdAt: string
}

export interface AdminAccountDetailDTO{
    id: number,
    name: string,
    email: string,
    phone: string,
    sex:AccountSex
    role: Role,
    createdSurveys: SurveyListItem[]
}
