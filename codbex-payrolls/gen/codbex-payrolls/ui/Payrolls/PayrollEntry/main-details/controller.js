angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Payrolls/PayrollEntryService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'PayrollEntry successfully created';
		let propertySuccessfullyUpdated = 'PayrollEntry successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'PayrollEntry Details',
			create: 'Create PayrollEntry',
			update: 'Update PayrollEntry'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.formHeadSelect', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)' });
			$scope.formHeaders.create = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.formHeadCreate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)' });
			$scope.formHeaders.update = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.formHeadUpdate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-payrolls-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'Payrolls' && e.view === 'PayrollEntry' && e.type === 'entity');
		});

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsEmployee = [];
				$scope.optionsCurrency = [];
				$scope.optionsStatus = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.StartDate) {
					data.entity.StartDate = new Date(data.entity.StartDate);
				}
				if (data.entity.EndDate) {
					data.entity.EndDate = new Date(data.entity.EndDate);
				}
				if (data.entity.PayDate) {
					data.entity.PayDate = new Date(data.entity.PayDate);
				}
				$scope.entity = data.entity;
				$scope.optionsEmployee = data.optionsEmployee;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.optionsStatus = data.optionsStatus;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsEmployee = data.optionsEmployee;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.optionsStatus = data.optionsStatus;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.StartDate) {
					data.entity.StartDate = new Date(data.entity.StartDate);
				}
				if (data.entity.EndDate) {
					data.entity.EndDate = new Date(data.entity.EndDate);
				}
				if (data.entity.PayDate) {
					data.entity.PayDate = new Date(data.entity.PayDate);
				}
				$scope.entity = data.entity;
				$scope.optionsEmployee = data.optionsEmployee;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.optionsStatus = data.optionsStatus;
				$scope.action = 'update';
			});
		}});

		$scope.serviceEmployee = '/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts';
		$scope.serviceCurrency = '/services/ts/codbex-currencies/gen/codbex-currencies/api/Currencies/CurrencyService.ts';
		$scope.serviceStatus = '/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Settings/PayrollStatusService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY'),
					message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToCreate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY'),
					message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToCreate', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-payrolls.Payrolls.PayrollEntry.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createEmployee = () => {
			Dialogs.showWindow({
				id: 'Employee-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createCurrency = () => {
			Dialogs.showWindow({
				id: 'Currency-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createStatus = () => {
			Dialogs.showWindow({
				id: 'PayrollStatus-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshEmployee = () => {
			$scope.optionsEmployee = [];
			$http.get('/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts').then((response) => {
				$scope.optionsEmployee = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Employee',
					message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshCurrency = () => {
			$scope.optionsCurrency = [];
			$http.get('/services/ts/codbex-currencies/gen/codbex-currencies/api/Currencies/CurrencyService.ts').then((response) => {
				$scope.optionsCurrency = response.data.map(e => ({
					value: e.Id,
					text: e.Code
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Currency',
					message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshStatus = () => {
			$scope.optionsStatus = [];
			$http.get('/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Settings/PayrollStatusService.ts').then((response) => {
				$scope.optionsStatus = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Status',
					message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});