$( document ).ready(function() {
    var drinkTemplate = Hogan.compile(
        '<p class=drink data-ingredients="{{data}}">{{drink}}<p>'
    );

    $('#search').click(function() {
        var suggestionBox = $('#suggestions')
        suggestionBox.empty();
        $('#suggestionHeader').text("Mixing...");
        $.ajax({
            url: '/search/',
            success: function(response) {
                $('#suggestionHeader').text("I recommend");
                $.map(response.drinks, function(drink) {
                  suggestionBox.append(
                    drinkTemplate.render({drink: drink.name,
                     data:drink.ingredients})
                  );
                });
                $('.drink').click(function() {
                  $('#drinkName').text($(this).text());
                  var ingredientBox = $('#drinkIngredients').empty();
                  var ingredients = $(this).attr('data-ingredients')
                  ingredients = ingredients.split(',');
                  $.map(ingredients, function(ingredient) {
                    ingredientBox.append(
                      "<p>"+ingredient+"</p>"
                    );
                  });

                });
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
});