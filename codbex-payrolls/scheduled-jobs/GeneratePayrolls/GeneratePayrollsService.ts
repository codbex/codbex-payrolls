import { insert } from "sdk/db";

export interface Payroll {
    readonly id: number,
    readonly numberGen: string,
    readonly employee: number,
    readonly title: string,
    readonly amount: number,
    readonly currency: number,
    readonly startDate: Date,
    readonly endDate: Date,
    readonly payrollStatus: number
}

export interface PayrollEntryItem {
    readonly id: number;
    readonly itemType: number;
    readonly amount: number;
    readonly payrollEntry: number;
}

export class GeneratePayrollsService {

    public static savePayroll(payrollsData: Payroll) {
        const sql = `INSERT INTO "CODBEX_PAYROLLENTRY" ("PAYROLLENTRY_ID","PAYROLLENTRY_NUMBER","PAYROLLENTRY_EMPLOYEE", "PAYROLLENTRY_TITLE","PAYROLLENTRY_AMOUNT","PAYROLLENTRY_CURRENCY","PAYROLLENTRY_STARTDATE","PAYROLLENTRY_ENDDATE","PAYROLLENTRY_STATUS") values (?,?, ?, ?, ?, ?,?,?)`;
        const queryParameters = [payrollsData.id, payrollsData.numberGen, payrollsData.employee, payrollsData.title, payrollsData.amount, payrollsData.currency, payrollsData.startDate, payrollsData.endDate, payrollsData.payrollStatus];
        insert.execute(sql, queryParameters);
    }

    public static savePayrollEntryItem(payrollsData: PayrollEntryItem) {
        const sql = `INSERT INTO "CODBEX_PAYROLLENTRYITEM" ("PAYROLLENTRYITEM_ID","PAYROLLENTRYITEM_TYPE", "PAYROLLENTRYITEM_AMOUNT", "PAYROLLENTRYITEM_PAYROLLENTRY") values (?, ?, ?, ?)`;
        const queryParameters = [payrollsData.id, payrollsData.itemType, payrollsData.amount, payrollsData.payrollEntry];
        insert.execute(sql, queryParameters);
    }

}