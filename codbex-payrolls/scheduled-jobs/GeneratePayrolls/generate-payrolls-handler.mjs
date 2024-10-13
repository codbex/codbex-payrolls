import { GeneratePayrollsService } from './GeneratePayrollsService';

import { EmployeeRepository } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";
import { SalaryRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";
import { PayrollEntryRepository } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";

const PayrollDao = new PayrollEntryRepository();
const EmployeeDao = new EmployeeRepository();
const SalaryDao = new SalaryRepository();

const employees = EmployeeDao.findAll();

employees.forEach((employee) => {

    const salary = SalaryDao.findAll({
        $filter: {
            equals: {
                Employee: employee.Id
            }
        }
    });

    const payrollTaxes = salary[0].Gross - salary[0].Net;
    const payrollsCount = PayrollDao.count();

    const date = new Date();
    date.setMonth(date.getMonth() + 1);

    const nextMonthName = date.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const payrollTitle = employee.Name + "'s salary for " + nextMonthName + " " + date.getFullYear();

    const payroll = {
        "id": payrollsCount + 1,
        "employee": employee.Id,
        "title": payrollTitle,
        "netSalary": salary[0].Net,
        "taxes": payrollTaxes,
        "startDate": firstDayOfMonth.toLocaleDateString('en-CA'),
        "endDate": lastDayOfMonth.toLocaleDateString('en-CA'),
        "payrollStatus": 2
    };

    GeneratePayrollsService.savePayrolls(payroll);
});
