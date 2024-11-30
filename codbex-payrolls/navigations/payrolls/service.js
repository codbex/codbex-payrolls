const navigationData = {
    id: 'payrolls-navigation',
    label: "Payrolls",
    group: "salaries",
    order: 1000,
    link: "/services/web/codbex-payrolls/gen/codbex-payrolls/ui/Payrolls/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }