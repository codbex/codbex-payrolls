import { PayrollEntryRepository as PayrollEntryDao } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";
import { PayrollEntryItemRepository as PayrollEntryItemDao } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryItemRepository";
import { PayrollEntryItemTypeRepository as PayrollEntryItemTypeDao } from "codbex-payrolls/gen/codbex-payrolls/dao/entities/PayrollEntryItemTypeRepository";
import { EmployeeRepository as EmployeeDao } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";
import { JobAssignmentRepository as JobAssignmentDao } from "codbex-jobs/gen/codbex-jobs/dao/Employees/JobAssignmentRepository";
import { JobPositionRepository as JobPositionDao } from "codbex-jobs/gen/codbex-jobs/dao/Teams/JobPositionRepository";
import { DepartmentRepository as DepartmentDao } from "codbex-organizations/gen/codbex-organizations/dao/Organizations/DepartmentRepository";
import { JobRoleRepository as JobRoleDao } from "codbex-companies/gen/codbex-companies/dao/Companies/JobRoleRepository";
import { SalaryRepository as SalaryDao } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";
import { CurrencyRepository as CurrencyDao } from "codbex-currencies/gen/codbex-currencies/dao/Currencies/CurrencyRepository";

import { Controller, Get } from "sdk/http";

@Controller
class PayslipService {

    private readonly payrollEntryDao;
    private readonly employeeDao;
    private readonly jobAssignmentDao;
    private readonly departmentDao;
    private readonly jobPositionDao;
    private readonly jobRoleDao;
    private readonly salaryDao;
    private readonly currencyDao;
    private readonly payrollEntryItemDao;
    private readonly payrollEntryItemTypeDao;


    constructor() {
        this.payrollEntryDao = new PayrollEntryDao();
        this.employeeDao = new EmployeeDao();
        this.jobAssignmentDao = new JobAssignmentDao();
        this.departmentDao = new DepartmentDao();
        this.jobPositionDao = new JobPositionDao();
        this.jobRoleDao = new JobRoleDao();
        this.salaryDao = new SalaryDao();
        this.currencyDao = new CurrencyDao();
        this.payrollEntryItemDao = new PayrollEntryItemDao();
        this.payrollEntryItemTypeDao = new PayrollEntryItemTypeDao();
    }

    @Get("/:payrollId")
    public payrollData(_: any, ctx: any) {
        const payrollId = ctx.pathParameters.payrollId;

        const payrollEntry = this.payrollEntryDao.findById(payrollId);

        const employees = this.employeeDao.findAll({
            $filter: {
                equals: {
                    Id: payrollEntry.Employee
                }
            }
        });

        const jobAssignment = this.jobAssignmentDao.findAll({
            $filter: {
                equals: {
                    Employee: employees[0].Id
                }
            }
        });

        const department = this.departmentDao.findAll({
            $filter: {
                equals: {
                    Id: jobAssignment[0].Department
                }
            }
        });

        const jobPosition = this.jobPositionDao.findAll({
            $filter: {
                equals: {
                    Id: jobAssignment[0].JobPosition
                }
            }
        });

        const jobRole = this.jobRoleDao.findAll({
            $filter: {
                equals: {
                    Id: jobPosition[0].Role
                }
            }
        });

        const salary = this.salaryDao.findAll({
            $filter: {
                equals: {
                    Employee: payrollEntry.Employee
                }
            }
        });

        const currency = this.currencyDao.findAll({
            $filter: {
                equals: {
                    Id: salary[0].Currency
                }
            }
        });

        const deductions = this.payrollEntryItemDao.findAll({
            $filter: {
                equals: {
                    PayrollEntry: payrollEntry.Id
                },
                notEquals: {
                    Type: [1, 2]
                }
            }
        });

        const earnings = this.payrollEntryItemDao.findAll({
            $filter: {
                equals: {
                    PayrollEntry: payrollEntry.Id,
                    Type: 2
                },
            }
        });

        let earningsArray = [];
        let deductionsArray = [];
        let earningsTotal = salary[0].Gross;
        let deductionsTotal = 0;


        deductions.forEach((deduction) => {

            const payrollItemType = this.payrollEntryItemTypeDao.findById(deduction.Type);
            deductionsTotal += deduction.Amount;

            const currentDeduction = {
                "Name": payrollItemType.Name,
                "Amount": deduction.Amount
            }

            deductionsArray.push(currentDeduction);
        });

        earnings.forEach((earning) => {

            const payrollItemType = this.payrollEntryItemTypeDao.findById(earning.Type);

            const currentEarning = {
                "Name": payrollItemType.Name,
                "Amount": earning.Amount
            }

            earningsTotal += earning.Amount;

            earningsArray.push(currentEarning);

        });

        return {
            payrollEntry: payrollEntry,
            employee: employees[0],
            department: department[0],
            jobRole: jobRole[0],
            currency: currency[0],
            earnings: earningsArray,
            salary: salary[0],
            deductions: deductionsArray,
            earningsTotal: earningsTotal,
            deductionsTotal: deductionsTotal
        }

    }
}