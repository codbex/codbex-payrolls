const widgetData = {
    id: 'pending-payrolls-widget',
    label: 'Pending Payrolls',
    link: '/services/web/codbex-payrolls/widgets/pending-payrolls/index.html',
    redirectViewId: 'payrolls-navigation',
    size: "small"
};

function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = getWidget;
}

export { getWidget }