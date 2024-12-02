const widgetData = {
    id: 'upcoming-taxes-payment',
    label: 'Upcoming Taxes Payment',
    link: '/services/web/codbex-payrolls/widgets/upcoming-taxes-payment/index.html',
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