const viewData = {
    id: 'employee-payment-generate',
    label: 'Pay salary',
    link: '/services/web/codbex-payrolls/ext/generate/EmployeePayment/employee-payment-generate.html',
    perspective: 'Payrolls',
    view: 'PayrollEntry',
    type: 'entity',
    order: 13
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}