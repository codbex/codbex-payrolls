import { Controller, Get } from "sdk/http";

import { PayrollEntryRepository as PayrollEntryDao } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";
import { EmployeeRepository as EmployeeDao } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";
import { SalaryRepository as SalaryDao } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";
import { CurrencyRepository as CurrencyDao } from "codbex-currencies/gen/codbex-currencies/dao/Currencies/CurrencyRepository";

@Controller
class GenerateEmployeePaymentService {

    private readonly payrollEntryDao;
    private readonly employeeDao;
    private readonly salaryDao;
    private readonly currencyDao;

    constructor() {
        this.payrollEntryDao = new PayrollEntryDao();
        this.employeeDao = new EmployeeDao();
        this.salaryDao = new SalaryDao();
        this.currencyDao = new CurrencyDao();
    }

    @Get("/payrollData/:payrollId")
    public payrollData(_: any, ctx: any) {
        const payrollId = ctx.pathParameters.payrollId;

        const payrollEntry = this.payrollEntryDao.findById(payrollId);

        return {
            "Id": payrollEntry.Id,
            "Employee": payrollEntry.Employee,
            "Title": payrollEntry.Title,
            "Status": payrollEntry.Status,
            "StartDate": payrollEntry.StartDate,
            "EndDate": payrollEntry.EndDate,
            "PayDate": payrollEntry.PayDate,
            "Currency": payrollEntry.Currency
        };
    }

    @Get("/employeeData/:employeeId")
    public employeeData(_: any, ctx: any) {
        const employeeId = ctx.pathParameters.employeeId;

        const employeeEntry = this.employeeDao.findById(employeeId);

        return {
            "Name": employeeEntry.Name,
            "IBAN": employeeEntry.IBAN
        };
    }

    @Get("/salaryData/:salaryId")
    public salaryData(_: any, ctx: any) {
        const salaryId = ctx.pathParameters.salaryId;

        const salaryEntry = this.salaryDao.findById(salaryId);

        const currency = this.currencyDao.findAll({
            $filter: {
                equals: {
                    Id: salaryEntry.Currency
                }
            }
        });

        const taxes = salaryEntry.Gross - salaryEntry.Net;

        return {
            "Currency": salaryEntry.Currency,
            "CurrencyCode": currency[0].Code,
            "Net": salaryEntry.Net,
            "Taxes": taxes
        };
    }

}
