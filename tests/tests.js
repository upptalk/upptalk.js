// suite('Connection', function(){
//   setup(function(){
//   });

//   suite('Login', function(){
//     test('should return -1 when not present', function(){
//       Yuilop.connect('toto', '1213');
//       // assert.equal(-1, [1,2,3].indexOf(4));
//     });
//   });
// });


describe('Connection', function(){
  describe('Connect', function(){
    it('should save without error', function(done){

      Yuilop.onConnected = function() {
        console.log('toto')
        done();
      };
      Yuilop.connect('toto', '123');
    })
  })
})