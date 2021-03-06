describe('Game list item details controller', function() {
    'use strict';

    var variant,
        game,
        phases,
        mockGameService,
        MapService,
        mdDialog,
        controller;

    beforeEach(function() {
        game = { Members: [ ] };
        variant = { Nations: [ ] };
        phases = [ ];
        mockGameService = {
            getCurrentUserInGame: function() { return 'Germany'; }
        };

        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockGameService);
        });
        angular.mock.module('ui.router');
        angular.mock.module('gamelistitem.component');
        angular.mock.module('restangular');

        inject(function(_$controller_, _$mdDialog_, _mapService_) {
            MapService = _mapService_;
            mdDialog = _$mdDialog_;
            sinon.spy(mdDialog, 'hide');
            controller = _$controller_('GameListItemDetailsController', {
                service: new MapService({
                    variant: variant,
                    game: game,
                    phases: phases
                }),
                svg: { }
            });
        });
    });

    it('closes the dialog', function() {
        controller.closeDialog();
        expect(mdDialog.hide).to.have.been.calledOnce;
    });
});
