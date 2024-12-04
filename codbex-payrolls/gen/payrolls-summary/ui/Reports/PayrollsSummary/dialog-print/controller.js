angular.module('page', ["ideUI", "ideView", "entityApi"])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-payrolls.Reports.PayrollsSummary';
    }])
    .config(["entityApiProvider", function (entityApiProvider) {
        entityApiProvider.baseUrl = "/services/ts/codbex-payrolls/gen/payrolls-summary/api/PayrollsSummary/PayrollsSummaryService.ts";
    }])
    .controller('PageController', ['$scope', 'messageHub', 'entityApi', 'ViewParameters', function ($scope, messageHub, entityApi, ViewParameters) {

		let params = ViewParameters.get();
		if (Object.keys(params).length) {         
            const filterEntity = params.filterEntity ?? {};

			const filter = {
			};
			if (filterEntity.StartDate) {
				filter.StartDate = new Date(filterEntity.StartDate);
			}

            $scope.filter = filter;
		}

        $scope.loadPage = function (filter) {
            if (!filter && $scope.filter) {
                filter = $scope.filter;
            }
            let request;
            if (filter) {
                request = entityApi.search(filter);
            } else {
                request = entityApi.list();
            }
            request.then(function (response) {
                if (response.status != 200) {
                    messageHub.showAlertError("PayrollsSummary", `Unable to list/filter PayrollsSummary: '${response.message}'`);
                    return;
                }

                response.data.forEach(e => {
                    if (e['Start Date']) {
                        e['Start Date'] = new Date(e['Start Date']);
                    }
                    if (e['Pay Date']) {
                        e['Pay Date'] = new Date(e['Pay Date']);
                    }
                });

                $scope.data = response.data;
                setTimeout(() => {
                    window.print();

                }, 250);
            });
        };
        $scope.loadPage($scope.filter);

        window.onafterprint = () => {
            messageHub.closeDialogWindow("codbex-payrolls-Reports-PayrollsSummary-print");
        }

    }]);
