import { GeneratePayrollsService } from './GeneratePayrollsService';

import { EmployeeRepository } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";
import { SalaryRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";
import { SalaryItemRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryItemRepository";
import { PayrollEntryRepository } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";
import { PayrollEntryItemRepository } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryItemRepository";

const PayrollDao = new PayrollEntryRepository();
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

    const payrollsCount = PayrollDao.count();

    const payroll = {
        "id": payrollsCount + 1,
        "employee": employee.Id,
        "title": payrollTitle,
        "amount": 0,
        "startDate": firstDayOfMonth.toLocaleDateString('en-CA'),
        "endDate": lastDayOfMonth.toLocaleDateString('en-CA'),
        "payrollStatus": 2
    };

    GeneratePayrollsService.savePayroll(payroll);

    const salary = SalaryDao.findAll({
        $filter: {
            equals: {
                Employee: employee.Id
            }
        }
    });

    const salaryItems = SalaryItemDao.findAll({
        $filter: {
            equals: {
                Salary: salary[0].Id
            }
        }
    });

    let salaryItemsAmount = 0;

    salaryItems.forEach((item) => {

        const payrollsEntryItemsCount = PayrollEntryItemDao.count();

        const payrollItem = {
            "id": payrollsEntryItemsCount + 1,
            "itemType": item.Type,
            "amount": item.Quantity,
            "payrollEntry": payrollsCount + 1
        };

        salaryItemsAmount += item.Quantity;

        GeneratePayrollsService.savePayrollEntryItem(payrollItem);
    });

    const payrollEntry = PayrollDao.findAll({
        $filter: {
            equals: {
                Id: payrollsCount + 1
            }
        }
    });

    payrollEntry[0].Amount += salaryItemsAmount;
    PayrollDao.update(payrollEntry);
});
