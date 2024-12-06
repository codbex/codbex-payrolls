angular.module('upcoming-taxes-payment', ['ideUI', 'ideView'])
    .controller('UpcomingTaxesPayment', ['$scope', '$http', function ($scope, $http) {
        $scope.state = {
            isBusy: true,
            error: false,
            busyText: "Loading...",
        };

        $scope.today = new Date().toDateString();

        const date = new Date();
        date.setMonth(date.getMonth());
        $scope.currentMonth = date.toLocaleString('default', { month: 'long' });

        $scope.currentYear = new Date().getFullYear();

        const payrollsServiceUrl = "/services/ts/codbex-payrolls/widgets/api/PayrollsService.ts/PayrollTaxesData";
        console.log(payrollsServiceUrl);

        $http.get(payrollsServiceUrl)
            .then(function (response) {
                $scope.currencyForTaxes = response.data.currencyForTaxes;
                $scope.taxesSum = response.data.taxesSum;
            })
            .catch(function (error) {
                $scope.state.error = true;
                $scope.state.isBusy = false;
                console.error('Error fetching data:', error);
            })
            .finally(function () {
                $scope.state.isBusy = false;
            });
    }]);