'use strict';

var localStorage,
    user,
    userService;

describe('User service', function() {
    beforeEach(function() {
        angular.mock.module('ui.router');
        angular.mock.module('restangular');
        angular.mock.module('ngStorage');
        angular.mock.module('userService');
        user = {
            Id: '123456q'
        };

        inject(function(_$localStorage_, _userService_) {
            localStorage = _$localStorage_;
            localStorage.theUser = user;
            userService = _userService_;
        });
    });

    describe('Authentication', function() {
        it('validates the user\'s authentication status', function() {
            localStorage.theUser.ValidUntil = moment().add(-7, 'days').toISOString();
            expect(userService.isAuthenticated()).to.be.false;

            localStorage.theUser.ValidUntil = moment().add(7, 'days').toISOString();
            expect(userService.isAuthenticated()).to.be.true;
        });

        it('considers missing user data as unauthenticated', function() {
            delete localStorage.theUser;
            expect(userService.isAuthenticated()).to.be.false;
        });
    });

    it('clears locally stored data when logging off', function() {
        localStorage.token = '12345';
        userService.logOff();
        expect(localStorage.token).to.be.undefined;
        expect(localStorage.theUser).to.be.undefined;
    });

    it('handles 401 errors from the API', function() {
        localStorage.token = '12345';
        var errorHandled = userService.apiErrorHandler({ status: 401 });

        expect(errorHandled).to.be.false;
        expect(localStorage.token).to.be.undefined;
    });

    it('gets the current user ID', function() {
        expect(userService.getCurrentUserID()).to.equal('123456q');

        delete localStorage.theUser;
        expect(userService.getCurrentUserID()).to.be.null;
    });
});
