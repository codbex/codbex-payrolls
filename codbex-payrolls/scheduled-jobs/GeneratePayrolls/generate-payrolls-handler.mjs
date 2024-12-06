import { GeneratePayrollsService } from './GeneratePayrollsService';

import { EmployeeRepository } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";
import { SalaryRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";
import { SalaryItemRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryItemRepository";
import { PayrollEntryRepository } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";
import { PayrollEntryItemRepository } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryItemRepository";
import { CurrencyRepository } from "codbex-currencies/gen/codbex-currencies/dao/Currencies/CurrencyRepository";


const PayrollDao = new PayrollEntryRepository();
const CurrencyDao = new CurrencyRepository();
const EmployeeDao = new EmployeeRepository();
const SalaryDao = new SalaryRepository();
const SalaryItemDao = new SalaryItemRepository();
const PayrollEntryItemDao = new PayrollEntryItemRepository();

const employees = EmployeeDao.findAll();

employees.forEach((employee) => {

    const date = new Date();
    date.setMonth(date.getMonth() + 1);

    const nextMonthName = date.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const payrollTitle = employee.Name + "'s salary for " + nextMonthName + " " + date.getFullYear();

    const payrollId = PayrollDao.count() + 1;

    const salary = SalaryDao.findAll({
        $filter: {
            equals: {
                Employee: employee.Id
            }
        }
    });

    const currencies = CurrencyDao.findAll({
        $filter: {
            equals: {
                Id: salary[0].Currency
            }
        }
    });

    const payroll = {
        "id": payrollId,
        "employee": employee.Id,
        "title": payrollTitle,
        "amount": 0,
        "currency": currencies[0].Id,
        "startDate": firstDayOfMonth.toLocaleDateString('en-CA'),
        "endDate": lastDayOfMonth.toLocaleDateString('en-CA'),
        "payrollStatus": 2
    };

    GeneratePayrollsService.savePayroll(payroll);

    const salaryItems = SalaryItemDao.findAll({
        $filter: {
            equals: {
                Salary: salary[0].Id
            }
        }
    });

    let payrollAmount = 0;

    salaryItems.forEach((item) => {

        const payrollEntryItemId = PayrollEntryItemDao.count() + 1;

        const amount = item.Type == 1 ? salary[0].Net : item.Quantity;

        payrollAmount += amount;

        const payrollItem = {
            "id": payrollEntryItemId,
            "itemType": item.Type,
            "amount": amount,
            "payrollEntry": payrollId
        };

        GeneratePayrollsService.savePayrollEntryItem(payrollItem);
    });

    const payrollEntry = PayrollDao.findAll({
        $filter: {
            equals: {
                Id: PayrollDao.count()
            }
        }
    });

    payrollEntry[0].Amount = payrollAmount;

    PayrollDao.update(payrollEntry[0]);

});
