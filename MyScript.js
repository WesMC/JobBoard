angular.module("search-jobs", [])
    .controller('display_seg', function ($scope) {
        $scope.prog_dis_class = "";
        $scope.writ_dis_class = "";
        $scope.progShow = false;

        $scope.displayProg = function () {
            $scope.prog_dis_class = "active";
            $scope.progShow != $scope.progShow;
        };
    });
