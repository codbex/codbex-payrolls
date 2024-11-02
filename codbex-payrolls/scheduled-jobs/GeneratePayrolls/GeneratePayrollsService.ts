import { insert } from "sdk/db";

export interface Payroll {
    readonly id: number,
    readonly employee: number,
    readonly title: string,
    readonly netSalary: number,
    readonly taxes: number,
    readonly startDate: Date,
    readonly endDate: Date,
    readonly payrollStatus: number
}

export class GeneratePayrollsService {

    public static savePayrolls(payrollsData: Payroll) {
        const sql = `INSERT INTO "CODBEX_PAYROLLENTRY" ("PAYROLLENTRY_ID","PAYROLLENTRY_EMPLOYEE", "PAYROLLENTRY_TITLE", "PAYROLLENTRY_NETSALARY","PAYROLLENTRY_TAXES","PAYROLLENTRY_STARTDATE","PAYROLLENTRY_ENDDATE","PAYROLLENTRY_STATUS") values (?, ?, ?, ?, ?,?,?,?)`;
        const queryParameters = [payrollsData.id, payrollsData.employee, payrollsData.title, payrollsData.netSalary, payrollsData.taxes, payrollsData.startDate, payrollsData.endDate, payrollsData.payrollStatus];
        insert.execute(sql, queryParameters);
    }

}