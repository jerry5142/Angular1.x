app.controller('ShopController', ['$scope', function($scope, $localStorage) { 
   $scope.products = 
   [ 
      { 
         name: 'Phone Jack Speakers', 
         pic: 'img/shop/little-speaker.jpg',
         price: 21.5, 
         description: 'Mini subwoofer for your phone',
         review: '',
         selected: false
      }, 
      { 
         name: 'Nintendo Classic', 
         pic: 'img/shop/nintendo.jpg',
         price: 34, 
         description: 'Old school gaming',
         review: '',
         selected: true
      },
      { 
         name: 'Cell Phone', 
         pic: 'img/shop/phone.jpg',
         price: 47.91, 
         description: 'Inexpensive smart phone',
         review: '',
         selected: false
      },
      { 
         name: 'Portable power', 
         pic: 'img/shop/power.jpg',
         price: 73, 
         description: 'Recharge your phone or laptop. Start you car',
         review: '',
         selected: false
      },
      { 
         name: 'Spiderbot', 
         pic: 'img/shop/robot.jpg',
         price: 187, 
         description: 'Cool walking spider robot',
         review: '',
         selected: false
      },
      { 
         name: 'VR goggles', 
         pic: 'img/shop/vr-goggles.jpg',
         price: 31.5, 
         description: '3D Virtual Reality goggles for you phone',
         review: '',
         selected: false
      }
   ];
}]);