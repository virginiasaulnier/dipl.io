describe('Map service', function() {
    'use strict';

    var variant,
        game,
        phases,
        options,
        orders,
        currentState,
        mockGameService,
        mockVariantService,
        MapService,
        ms,
        location,
        data;

    beforeEach(function() {
        mockGameService = {
            isPlayer: function() { return true; },
            getCurrentUserInGame: function() { return { Nation: 'Germany' }; }
        };

        angular.mock.module('mapService');
        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockGameService);
            $provide.value('variantService', mockVariantService);
        });

        variant = {
            Name: 'Classical',
            Nations: ['uh oh :(', 'Italy', 'Germany', 'England', 'Russia'],
            Graph: {
                Nodes: {
                    MUN: {
                        sc: {
                            x: 123,
                            y: 456
                        }
                    }
                }
            }
        };
        game = {
            Desc: 'My Game 1',
            Started: true,
            Finished: false,
            Members: [{ }]
        };
        phases = [{
            Properties: {
                PhaseOrdinal: 1,
                Season: 'Spring',
                Type: 'Movement',
                Year: 1901,
                Resolved: true,
                DeadlineAt: moment().add({ years: -3 })
            }
        }, {
            Properties: {
                PhaseOrdinal: 2,
                Season: 'Summer',
                Type: 'Retreat',
                Year: 1901,
                Resolved: true
            }
        }, {
            Properties: {
                PhaseOrdinal: 3,
                Season: 'Fall',
                Type: 'Movement',
                Year: 1901,
                DeadlineAt: moment().add({ minutes: 3, seconds: 12, milliseconds: 144 }).toISOString(),
                Units: [
                    { Properties: { Unit: { Nation: 'Germany' } } }
                ],
                Resolutions: [
                    { Province: 'mun', Resolution: 'OK' },
                    { Province: 'den', Resolution: 'Aw Hell naw' }
                ]
            }
        }];
        currentState = [{ Properties: { } }];
        options = { por: { } };
        orders = [{
            Properties: {
                Parts: ['mun', 'Move', 'ber']
            }
        }, {
            Properties: {
                Parts: ['den', 'Hold']
            }
        }];
        data = {
            variant: variant,
            game: game,
            phases: phases,
            orders: orders,
            phaseState: currentState,
            options: options
        };

        inject(function(_mapService_, _$location_) {
            location = _$location_;
            MapService = _mapService_;
            ms = new MapService(data);
        });
    });

    it('exposes public data, but not private', function() {
        expect(ms.variant).to.not.be.undefined;
        expect(ms.game).to.not.be.undefined;
        expect(ms.phases).to.be.an('Array');
        expect(ms.phaseState).to.not.be.undefined;
        expect(ms.orders).to.be.an('Array');

        // Private stuff.
        expect(ms._options).to.be.undefined;
        expect(ms._ordinal).to.be.undefined;
    });

    it('puts the current user first in the variant\'s list of powers', function() {
        expect(ms.variant.Nations[0]).to.equal('Germany');
    });

    it('returns the appropriate phase by its ordinal', function() {
        expect(ms.getCurrentPhase().Season).to.equal('Fall');

        data.ordinal = 2;
        ms = new MapService(data);
        expect(ms.getCurrentPhase().Season).to.equal('Summer');
    });

    it('determines if the user can submit movement orders', function() {
        expect(ms.userCanPerformAction('Movement')).to.be.true;
        expect(ms.userCanPerformAction('Adjustment', 'Build', 'Fleet')).to.be.false;
    });

    it('determines if the user can submit adjustment orders', function() {
        data.phases.push({
            Properties: {
                Type: 'Adjustment',
                PhaseOrdinal: 4,
                Season: 'Winter',
                Year: 1901
            }
        });
        data.options = {
            lon: {
                Next: {
                    Build: {
                        Next: {
                            Army: { },
                            Fleet: { }
                        }
                    }
                }
            }
        };
        ms = new MapService(data);
        expect(ms.userCanPerformAction('Movement')).to.be.false;
        expect(ms.userCanPerformAction('Adjustment', 'Build', 'Army')).to.be.true;
        expect(ms.userCanPerformAction('Adjustment', 'Build', 'Fleet')).to.be.true;
        expect(ms.userCanPerformAction('Adjustment', 'Disband')).to.be.false;
    });

    it('indicates if input is expected from the user', function() {
        expect(ms.isUserInputExpected()).to.be.true;
    });

    describe('SC generation', function() {
        it('generates an SVG path', function() {
            location.path('/games/123456');
            expect(ms.getSCPath()).to.have.string('/games/123456#sc');
        });

        it('generates an SVG transform', function() {
            expect(ms.getSCTransform(variant.Graph.Nodes.MUN)).to.equal('translate(123,456) scale(0.04)');
        });
    });

    describe('Order management', function() {
        xit('returns a null promise when no order is submittable', function() {
            return expect(ms.inputOrder('mun')).to.eventually.equal(null);
        });

        it('sets and gets the current action', function() {
            ms.setCurrentAction('Move');
            expect(ms.getCurrentAction()).to.equal('Move');
        });

        it('gets a province\'s order', function() {
            expect(ms.getOrderForProvince('MUN').Properties.Parts[0]).to.equal('mun');
            expect(ms.getOrderForProvince('den').Properties.Parts[0]).to.equal('den');
        });

        it('identifies a failed order', function() {
            expect(ms.orderDidFail('mun')).to.be.false;
            expect(ms.orderDidFail('den')).to.be.true;
        });
    });
});
