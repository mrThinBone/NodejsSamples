/**
 * Created by DELL-INSPIRON on 9/8/2016.
 */
app.controller('UploadController', ['$scope', '$http', function ($scope, $http) {
  $scope.upload = function () {
    console.log($scope.inputFile);
    $http({
      method: 'POST',
      url: '/upload/image',
      data: {
        image: $scope.inputFile
      }
    }).then(function onSuccess(response) {
      console.log(response.data);
      var win = window.open(response.data.Location, '_blank');
      win.focus();
    }, function onError(response) {
      console.error("Error", response.data);
    });
  }
}]);