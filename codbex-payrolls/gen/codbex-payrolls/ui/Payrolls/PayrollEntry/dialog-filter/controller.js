angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-payrolls.Payrolls.PayrollEntry';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.MonthFrom) {
				params.entity.MonthFrom = new Date(params.entity.MonthFrom);
			}
			if (params?.entity?.MonthTo) {
				params.entity.MonthTo = new Date(params.entity.MonthTo);
			}
			if (params?.entity?.PayDateFrom) {
				params.entity.PayDateFrom = new Date(params.entity.PayDateFrom);
			}
			if (params?.entity?.PayDateTo) {
				params.entity.PayDateTo = new Date(params.entity.PayDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsPayrollStatus = params.optionsPayrollStatus;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Title) {
				filter.$filter.contains.Title = entity.Title;
			}
			if (entity.NetSalary !== undefined) {
				filter.$filter.equals.NetSalary = entity.NetSalary;
			}
			if (entity.Taxes !== undefined) {
				filter.$filter.equals.Taxes = entity.Taxes;
			}
			if (entity.MonthFrom) {
				filter.$filter.greaterThanOrEqual.Month = entity.MonthFrom;
			}
			if (entity.MonthTo) {
				filter.$filter.lessThanOrEqual.Month = entity.MonthTo;
			}
			if (entity.PayrollStatus !== undefined) {
				filter.$filter.equals.PayrollStatus = entity.PayrollStatus;
			}
			if (entity.PayDateFrom) {
				filter.$filter.greaterThanOrEqual.PayDate = entity.PayDateFrom;
			}
			if (entity.PayDateTo) {
				filter.$filter.lessThanOrEqual.PayDate = entity.PayDateTo;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("PayrollEntry-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);