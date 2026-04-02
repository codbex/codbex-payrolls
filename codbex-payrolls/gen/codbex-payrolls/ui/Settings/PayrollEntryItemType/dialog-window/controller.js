angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Settings/PayrollEntryItemTypeService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'PayrollEntryItemType successfully created';
		let propertySuccessfullyUpdated = 'PayrollEntryItemType successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'PayrollEntryItemType Details',
			create: 'Create PayrollEntryItemType',
			update: 'Update PayrollEntryItemType'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.formHeadSelect', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE)' });
			$scope.formHeaders.create = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.formHeadCreate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE)' });
			$scope.formHeaders.update = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.formHeadUpdate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-payrolls.Settings.PayrollEntryItemType.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToCreate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-payrolls.Settings.PayrollEntryItemType.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToUpdate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEMTYPE)', message: message });
				});
				console.error('EntityService:', error);
			});
		};


		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'PayrollEntryItemType-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});