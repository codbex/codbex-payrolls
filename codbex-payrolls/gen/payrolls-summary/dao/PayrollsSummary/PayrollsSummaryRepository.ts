import { Query, NamedQueryParameter } from "sdk/db";

export interface PayrollsSummary {
    readonly 'Employee Name': string;
    readonly 'Net Salary': number;
    readonly 'Taxes': number;
    readonly 'Bonuses': number;
    readonly 'Total': number;
    readonly 'Start Date': Date;
    readonly 'Pay Date': Date;
    readonly 'Status': string;
}

export interface PayrollsSummaryFilter {
    readonly 'StartDate?': Date;
}

export interface PayrollsSummaryPaginatedFilter extends PayrollsSummaryFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class PayrollsSummaryRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: PayrollsSummaryPaginatedFilter): PayrollsSummary[] {
        const sql = `
            SELECT Employee.EMPLOYEE_NAME as "Employee Name", Salary.SALARY_NET as "Net Salary", Salary.SALARY_GROSS - SALARY_NET as "Taxes", PayrollEntry.PAYROLLENTRY_AMOUNT - SALARY_GROSS as "Bonuses", PayrollEntry.PAYROLLENTRY_AMOUNT - (SALARY_GROSS - SALARY_NET) as "Total", PayrollEntry.PAYROLLENTRY_STARTDATE as "Start Date", PayrollEntry.PAYROLLENTRY_PAYDATE as "Pay Date", PayrollStatus.PAYROLLSTATUS_NAME as "Status"
            FROM CODBEX_PAYROLLENTRY as PayrollEntry
              INNER JOIN CODBEX_EMPLOYEE Employee ON Employee.EMPLOYEE_ID=PayrollEntry.PAYROLLENTRY_EMPLOYEE
              INNER JOIN CODBEX_PAYROLLSTATUS PayrollStatus ON PayrollStatus.PAYROLLSTATUS_ID=PayrollEntry.PAYROLLENTRY_STATUS
              INNER JOIN CODBEX_SALARY Salary ON Salary.SALARY_EMPLOYEE=PayrollEntry.PAYROLLENTRY_EMPLOYEE
            WHERE PayrollEntry.PAYROLLENTRY_STARTDATE = :StartDate
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `StartDate`,
            type: `DATE`,
            value: filter['StartDate'] !== undefined ?  filter['StartDate'] : `2024-11-01`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: PayrollsSummaryFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT Employee.EMPLOYEE_NAME as "Employee Name", Salary.SALARY_NET as "Net Salary", Salary.SALARY_GROSS - SALARY_NET as "Taxes", PayrollEntry.PAYROLLENTRY_AMOUNT - SALARY_GROSS as "Bonuses", PayrollEntry.PAYROLLENTRY_AMOUNT - (SALARY_GROSS - SALARY_NET) as "Total", PayrollEntry.PAYROLLENTRY_STARTDATE as "Start Date", PayrollEntry.PAYROLLENTRY_PAYDATE as "Pay Date", PayrollStatus.PAYROLLSTATUS_NAME as "Status"
                FROM CODBEX_PAYROLLENTRY as PayrollEntry
                  INNER JOIN CODBEX_EMPLOYEE Employee ON Employee.EMPLOYEE_ID=PayrollEntry.PAYROLLENTRY_EMPLOYEE
                  INNER JOIN CODBEX_PAYROLLSTATUS PayrollStatus ON PayrollStatus.PAYROLLSTATUS_ID=PayrollEntry.PAYROLLENTRY_STATUS
                  INNER JOIN CODBEX_SALARY Salary ON Salary.SALARY_EMPLOYEE=PayrollEntry.PAYROLLENTRY_EMPLOYEE
                WHERE PayrollEntry.PAYROLLENTRY_STARTDATE = :StartDate
            )
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `StartDate`,
            type: `DATE`,
            value: filter.StartDate !== undefined ?  filter.StartDate : `2024-11-01`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}