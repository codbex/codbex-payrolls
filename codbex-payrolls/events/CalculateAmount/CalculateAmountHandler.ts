import { PayrollEntryRepository } from "../../gen/codbex-payrolls/dao/Payrolls/PayrollEntryRepository";

export const trigger = (event) => {

    const PayrollEntryDao = new PayrollEntryRepository();


    if (event.operation == "create") {

        const payrollEntryItem = event.entity;

        const payrollEntry = PayrollEntryDao.findAll({
            $filter: {
                equals: {
                    Id: payrollEntryItem.PayrollEntry
                }
            }
        });

        payrollEntry[0].Amount = payrollEntry[0].Amount + payrollEntryItem.Amount;

        PayrollEntryDao.update(payrollEntry[0]);
    }




}