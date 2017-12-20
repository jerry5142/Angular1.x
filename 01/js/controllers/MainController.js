app.controller('MainController', ['$scope', function($scope) { 
  $scope.title = 'Gotta Have It!'; 
  $scope.promo = 'We gotta deal 4 u!';
  $scope.products = 
          [ 
            { 
              name: 'Phone Jack Speakers', 
			  pic: 'img/little-speaker.jpg',
              price: 21.5, 
			  description: 'Mini subwoofer for your phone',
			  review: ''
			}, 
            { 
              name: 'Nintendo Classic', 
			  pic: 'img/nintendo.jpg',
              price: 34, 
			  description: 'Old school gaming',
			  review: ''
            },
            { 
              name: 'Cell Phone', 
			  pic: 'img/phone.jpg',
              price: 47.91, 
			  description: 'Inexpensive smart phone',
			  review: ''
            },
            { 
              name: 'Portable power', 
			  pic: 'img/power.jpg',
              price: 73, 
			  description: 'Recharge your phone or laptop. Start you car',
			  review: ''
            },
            { 
              name: 'Spiderbot', 
			  pic: 'img/robot.jpg',
              price: 187, 
			  description: 'Cool walking spider robot',
			  review: ''
            },
            { 
              name: 'VR goggles', 
			  pic: 'img/vr-goggles.jpg',
              price: 31.5, 
			  description: '3D Virtual Reality goggles for you phone',
			  review: ''
            }
  ];
  console.log($scope.review);
}]);