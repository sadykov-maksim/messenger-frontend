import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export type BitrixLead = {
    ID: string
    TITLE?: string
    STATUS_ID?: string
    SOURCE_ID?: string
    ASSIGNED_BY_ID?: string
    DATE_CREATE?: string
}


export type BitrixDeal = {
    ID: string
    OPPORTUNITY: string
    STAGE_SEMANTIC_ID: "P" | "S" | "F"
    UF_CRM_AD_COST?: string
}

export type BitrixUser = {
    ID: string
    NAME?: string
    LAST_NAME?: string
    SECOND_NAME?: string
}

export type Option = {
    value: string
    label: string
}

export type DealCategory = {
    ID: string
    NAME: string
}