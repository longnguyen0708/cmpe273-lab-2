/**
 * Created by longnguyen on 10/11/16.
 */

var onItemQuantityChange = function (itemIndex) {
    var formId = "#cartItem" + itemIndex;

   // $(document).ready(function() {

       // $("#total").css( "color", "red" );
        $(formId).submit();
   // });
}


$(document).ready(function() {
    $(editForm).hide();

   $(editProfile).click(function () {
       $(editForm).toggle();
   })
});