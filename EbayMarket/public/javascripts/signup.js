/**
 * Created by longnguyen on 9/28/16.
 */

var app = angular.module('signup', []);
app.controller('signup', function($scope, $http) {


    $scope.onSignup = function ($event) {
        resetFieldCheck();
        if (isAllFiledsValid()) {
            // $http({
            //     method: 'POST',
            //     url: '/signup',
            //     data: {
            //         'email': $scope.email,
            //         'password': $scope.password,
            //         'firstName': $scope.firstName,
            //         'lastName': $scope.lastName
            //     }
            // }).success(function (data) {
            //     alert(data)
            // }).error(function (error) {
            //
            // });
            return true;
        }
        $event.preventDefault();
        return false;
    }

    var isAllFiledsValid = function () {
        if ($scope.email == undefined) {
            $scope.invalidEmail = true;
            $scope.emailError = 'Please enter a valid email address.';
            return false;
        }
        //todo: check email length
        if ($scope.email.length > 128) {
            $scope.invalidEmail = true;
            $scope.emailError = 'Email is too long.';
            return false;
        }

        if ($scope.reEmail != $scope.email) {
            $scope.invalidReEmail = true;
            $scope.reEmailError = 'Looks like these email addresses don’t match.';
            return false;
        }

        if ($scope.password == undefined || $scope.password == '') {
            $scope.invalidPassword = true;
            $scope.passwordError = 'Please enter your password.';
            return false;
        }

        if ($scope.password.length < 6) {
            $scope.invalidPassword = true;
            $scope.passwordError = 'Please enter at least 6 characters.';
            return false;
        }
        var patt = /[0-9!@#$%^*-_+=]/;
        if ($scope.password.length > 64 || patt.test($scope.password) == false) {
            $scope.invalidPassword = true;
            $scope.passwordError = 'Sorry, that password is invalid. Please use another password.';
            return false;
        }

        if ($scope.firstName == undefined || $scope.firstName == '') {
            $scope.invalidFirstName = true;
            $scope.firstNameError = 'Please enter your first name.';
            return false;
        }

        if ($scope.firstName.length > 32) {
            $scope.invalidFirstName = true;
            $scope.firstNameError = 'First name is too long.';
            return false;
        }

        if ($scope.lastName == undefined || $scope.lastName == '') {
            $scope.invalidLastName = true;
            $scope.lastNameError = 'Please enter your last name.';
            return false;
        }

        if ($scope.lastName.length > 32) {
            $scope.invalidLastName = true;
            $scope.lastNameError = 'Last name is too long.';
            return false;
        }
        return true;
    }

    var resetFieldCheck = function () {
        $scope.invalidEmail = false;
        $scope.invalidReEmail = false;
        $scope.invalidPassword = false;
        $scope.invalidFirstName = false;
        $scope.invalidLastName = false;
    }
});

