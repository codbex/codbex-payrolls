angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Payrolls/PayrollEntryService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete PayrollEntry? This action cannot be undone.',
			deleteTitle: 'Delete PayrollEntry?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.yes');
			translated.no = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.deleteTitle', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)' });
			translated.deleteConfirm = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.deleteConfirm', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)' });
		});
		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-payrolls-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Payrolls' && e.view === 'PayrollEntry' && (e.type === 'page' || e.type === undefined));
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		function resetPagination() {
			$scope.dataReset = true;
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.selectedEntity = null;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entityCreated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entityUpdated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			$scope.selectedEntity = null;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				filter.$offset = ($scope.dataPage - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				if ($scope.dataReset) {
					filter.$offset = 0;
					filter.$limit = $scope.dataPage * $scope.dataLimit;
				}

				EntityService.search(filter).then((response) => {
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}
					response.data.forEach(e => {
						if (e.StartDate) {
							e.StartDate = new Date(e.StartDate);
						}
						if (e.EndDate) {
							e.EndDate = new Date(e.EndDate);
						}
						if (e.PayDate) {
							e.PayDate = new Date(e.PayDate);
						}
					});

					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY'),
						message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToLF', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY'),
					message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToCount', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.postMessage({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entitySelected', data: {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsEmployee: $scope.optionsEmployee,
				optionsCurrency: $scope.optionsCurrency,
				optionsStatus: $scope.optionsStatus,
			}});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			$scope.action = 'create';

			Dialogs.postMessage({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.createEntity', data: {
				entity: {},
				optionsEmployee: $scope.optionsEmployee,
				optionsCurrency: $scope.optionsCurrency,
				optionsStatus: $scope.optionsStatus,
			}});
		};

		$scope.updateEntity = () => {
			$scope.action = 'update';
			Dialogs.postMessage({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.updateEntity', data: {
				entity: $scope.selectedEntity,
				optionsEmployee: $scope.optionsEmployee,
				optionsCurrency: $scope.optionsCurrency,
				optionsStatus: $scope.optionsStatus,
			}});
		};

		$scope.deleteEntity = () => {
			let id = $scope.selectedEntity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-payrolls.Payrolls.PayrollEntry.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY'),
							message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToDelete', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRY)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'PayrollEntry-filter',
				params: {
					entity: $scope.filterEntity,
					optionsEmployee: $scope.optionsEmployee,
					optionsCurrency: $scope.optionsCurrency,
					optionsStatus: $scope.optionsStatus,
				},
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsEmployee = [];
		$scope.optionsCurrency = [];
		$scope.optionsStatus = [];


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

		$scope.optionsEmployeeValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsEmployee.length; i++) {
				if ($scope.optionsEmployee[i].value === optionKey) {
					return $scope.optionsEmployee[i].text;
				}
			}
			return null;
		};
		$scope.optionsCurrencyValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsCurrency.length; i++) {
				if ($scope.optionsCurrency[i].value === optionKey) {
					return $scope.optionsCurrency[i].text;
				}
			}
			return null;
		};
		$scope.optionsStatusValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsStatus.length; i++) {
				if ($scope.optionsStatus[i].value === optionKey) {
					return $scope.optionsStatus[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
