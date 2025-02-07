const viewData = {
    id: 'payroll-entry-print',
    label: 'Print',
    link: '/services/ts/codbex-templates/print/payroll-entry-print-template.ts',
    perspective: 'Payrolls',
    view: 'PayrollEntry',
    type: 'entity',
    order: 30
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}