angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-payrolls.Payrolls.PayrollEntry';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Payrolls/PayrollEntryService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "PayrollEntry Details",
			create: "Create PayrollEntry",
			update: "Update PayrollEntry"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-payrolls-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Payrolls" && e.view === "PayrollEntry" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsEmployee = [];
				$scope.optionsStatus = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.StartDate) {
					msg.data.entity.StartDate = new Date(msg.data.entity.StartDate);
				}
				if (msg.data.entity.EndDate) {
					msg.data.entity.EndDate = new Date(msg.data.entity.EndDate);
				}
				if (msg.data.entity.PayDate) {
					msg.data.entity.PayDate = new Date(msg.data.entity.PayDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.StartDate) {
					msg.data.entity.StartDate = new Date(msg.data.entity.StartDate);
				}
				if (msg.data.entity.EndDate) {
					msg.data.entity.EndDate = new Date(msg.data.entity.EndDate);
				}
				if (msg.data.entity.PayDate) {
					msg.data.entity.PayDate = new Date(msg.data.entity.PayDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsStatus = msg.data.optionsStatus;
				$scope.action = 'update';
			});
		});

		$scope.serviceEmployee = "/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts";
		$scope.serviceStatus = "/services/ts/codbex-payrolls/gen/codbex-payrolls/api/entities/PayrollStatusService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("PayrollEntry", `Unable to create PayrollEntry: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("PayrollEntry", "PayrollEntry successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PayrollEntry", `Unable to update PayrollEntry: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("PayrollEntry", "PayrollEntry successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);