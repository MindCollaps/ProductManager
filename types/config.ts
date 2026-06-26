export interface AppConfigResponse {
    hourlyRate: number | string;
    showTimelineToCustomer: boolean;
    demoMode: boolean;
}

export interface RepairSavingsSummary {
    newPurchaseValue: number;
    laborCost: number;
    partsCost: number;
    repairValue: number;
    savedValue: number;
}
