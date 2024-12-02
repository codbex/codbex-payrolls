import { PayrollEntryItemRepository as PayrollEntryItemDao } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryItemRepository";
import { PayrollEntryRepository as PayrollEntryDao } from "codbex-payrolls/gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";
import { CurrencyRepository as CurrencyDao } from "codbex-currencies/gen/codbex-currencies/dao/Currencies/CurrencyRepository";
import { Controller, Get } from "sdk/http";

@Controller
class PayrollsService {

    private readonly payrollEntryItemDao;
    private readonly currencyDao;
    private readonly payrollEntryDao;

    constructor() {
        this.payrollEntryItemDao = new PayrollEntryItemDao();
        this.currencyDao = new CurrencyDao();
        this.payrollEntryDao = new PayrollEntryDao();
    }

    @Get("/PendingPayrolls")
    public PendingPayrolls() {

        const pendingPayrolls = this.payrollEntryDao.findAll({
            $filter: {
                equals: {
                    Status: 2
                }
            }
        });

        let pendingPayrollsSum = 0;

        pendingPayrolls.forEach((payroll) => {

            pendingPayrollsSum += payroll.Amount;

        });

        return {
            pendingPayrollsSum: pendingPayrollsSum
        };
    }

    @Get("/PayrollTaxesData")
    public PayrollTaxesData() {

        const payrollTaxes = this.payrollEntryItemDao.findAll({
            $filter: {
                equals: {
                    Type: [3, 4, 5, 6, 7]
                }
            }
        });

        let taxesSum = 0;

        payrollTaxes.forEach((tax) => {
            taxesSum += tax.Amount;
        });

        const payrollEntries = this.payrollEntryDao.findAll({
            $filter: {
                equals: {
                    Id: payrollTaxes[0].PayrollEntry
                }
            }
        });

        const currencies = this.currencyDao.findAll({
            $filter: {
                equals: {
                    Id: payrollEntries[0].Currency
                }
            }
        });

        return {
            taxesSum: taxesSum,
            currencyForTaxes: currencies[0].Code
        };
    }

}