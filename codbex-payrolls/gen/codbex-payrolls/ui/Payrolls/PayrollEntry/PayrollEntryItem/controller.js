angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Payrolls/PayrollEntryItemService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete PayrollEntryItem? This action cannot be undone.',
			deleteTitle: 'Delete PayrollEntryItem?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.yes');
			translated.no = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-payrolls:codbex-payrolls-model.defaults.deleteTitle', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM)' });
			translated.deleteConfirm = LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.deleteConfirm', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM)' });
		});
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-payrolls-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Payrolls' && e.view === 'PayrollEntryItem' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Payrolls' && e.view === 'PayrollEntryItem' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					selectedMainEntityKey: 'PayrollEntry',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id,
					selectedMainEntityKey: 'PayrollEntry',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.entitySelected', handler: (data) => {
			resetPagination();
			$scope.selectedMainEntityId = data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntry.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntryItem.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntryItem.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntryItem.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-payrolls.Payrolls.PayrollEntryItem.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			let PayrollEntry = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.PayrollEntry = PayrollEntry;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				EntityService.search(filter).then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM'),
						message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToLF', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM'),
					message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToCount', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'PayrollEntryItem-details',
				params: {
					action: 'select',
					entity: entity,
					optionsType: $scope.optionsType,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'PayrollEntryItem-filter',
				params: {
					entity: $scope.filterEntity,
					optionsType: $scope.optionsType,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'PayrollEntryItem-details',
				params: {
					action: 'create',
					entity: {
						'PayrollEntry': $scope.selectedMainEntityId
					},
					selectedMainEntityKey: 'PayrollEntry',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsType: $scope.optionsType,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'PayrollEntryItem-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'PayrollEntry',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsType: $scope.optionsType,
			},
				closeButton: false
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
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
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-payrolls.Payrolls.PayrollEntryItem.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM'),
							message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToDelete', { name: '$t(codbex-payrolls:codbex-payrolls-model.t.PAYROLLENTRYITEM)', message: message }),
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsType = [];


		$http.get('/services/ts/codbex-payrolls/gen/codbex-payrolls/api/Settings/PayrollEntryItemTypeService.ts').then((response) => {
			$scope.optionsType = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Type',
				message: LocaleService.t('codbex-payrolls:codbex-payrolls-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.optionsTypeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsType.length; i++) {
				if ($scope.optionsType[i].value === optionKey) {
					return $scope.optionsType[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
