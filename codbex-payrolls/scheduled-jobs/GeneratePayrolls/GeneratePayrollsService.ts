import { insert } from "sdk/db";
import { PayrollEntryRepository } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

const PayrollDao = new PayrollEntryRepository();

export interface Payroll {
    readonly id: number,
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
        const sql = `INSERT INTO "CODBEX_PAYROLLENTRY" ("PAYROLLENTRY_ID","PAYROLLENTRY_EMPLOYEE", "PAYROLLENTRY_TITLE","PAYROLLENTRY_AMOUNT","PAYROLLENTRY_CURRENCY","PAYROLLENTRY_STARTDATE","PAYROLLENTRY_ENDDATE","PAYROLLENTRY_STATUS") values (?,?, ?, ?, ?, ?,?,?)`;
        const queryParameters = [payrollsData.id, payrollsData.employee, payrollsData.title, payrollsData.amount, payrollsData.currency, payrollsData.startDate, payrollsData.endDate, payrollsData.payrollStatus];
        insert.execute(sql, queryParameters);

        const payrolls = PayrollDao.findAll({
            $filter: {
                equals: {
                    Id: payrollsData.id
                }
            }
        });

        payrolls[0].Number = new NumberGeneratorService().generate(31);
        console.log(JSON.stringify(payrolls[0]));
        PayrollDao.update(payrolls[0]);
    }

    public static savePayrollEntryItem(payrollsData: PayrollEntryItem) {
        const sql = `INSERT INTO "CODBEX_PAYROLLENTRYITEM" ("PAYROLLENTRYITEM_ID","PAYROLLENTRYITEM_TYPE", "PAYROLLENTRYITEM_AMOUNT", "PAYROLLENTRYITEM_PAYROLLENTRY") values (?, ?, ?, ?)`;
        const queryParameters = [payrollsData.id, payrollsData.itemType, payrollsData.amount, payrollsData.payrollEntry];
        insert.execute(sql, queryParameters);
    }

}