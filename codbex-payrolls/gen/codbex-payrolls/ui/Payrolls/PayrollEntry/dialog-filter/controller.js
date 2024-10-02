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
			if (params?.entity?.DueDateFrom) {
				params.entity.DueDateFrom = new Date(params.entity.DueDateFrom);
			}
			if (params?.entity?.DueDateTo) {
				params.entity.DueDateTo = new Date(params.entity.DueDateTo);
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
			$scope.optionsEmployee = params.optionsEmployee;
			$scope.optionsPayrollPeriod = params.optionsPayrollPeriod;
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
			if (entity.Employee !== undefined) {
				filter.$filter.equals.Employee = entity.Employee;
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
			if (entity.PayrollPeriod !== undefined) {
				filter.$filter.equals.PayrollPeriod = entity.PayrollPeriod;
			}
			if (entity.DueDateFrom) {
				filter.$filter.greaterThanOrEqual.DueDate = entity.DueDateFrom;
			}
			if (entity.DueDateTo) {
				filter.$filter.lessThanOrEqual.DueDate = entity.DueDateTo;
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