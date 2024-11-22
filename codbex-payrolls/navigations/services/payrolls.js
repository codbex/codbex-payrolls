const navigationData = {
    id: 'payrolls-navigation',
    label: "Payrolls",
    view: "payrolls",
    group: "salaries",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-payrolls/gen/codbex-payrolls/ui/Payrolls/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }