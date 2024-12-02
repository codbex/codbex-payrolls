const widgetData = {
    id: 'pending-payrolls',
    label: 'Pending Payrolls',
    link: '/services/web/codbex-payrolls/widgets/pending-payrolls/index.html',
    lazyLoad: true,
    size: "medium"
};

function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = getWidget;
}

export { getWidget }