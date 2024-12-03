const widgetData = {
    id: 'upcoming-taxes-payment',
    label: 'Upcoming Taxes Payment',
    link: '/services/web/codbex-payrolls/widgets/upcoming-taxes-payment/index.html',
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