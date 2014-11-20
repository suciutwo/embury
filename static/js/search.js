$( document ).ready(function() {

    var drinkTemplate = Hogan.compile(
        '<p class=drink data-ingredients="{{data}}">{{drink}}</p>'
    );

    var ingredientTemplate = Hogan.compile(
        '<p class=ingredient>{{ingredient}}</p>'
    );

    var missingTemplate = Hogan.compile(
        '<p class=missingitem>{{missing}}</p>'
    );

    function appendMissing(missing) {
        $('#missing').append(missingTemplate.render({missing: missing}));
        $('.missingitem').click(function() {
            $(this).remove()
        });
    }


    function getMissingIngredients() {
       return $('.missingitem').map(function () {
            return $(this).text();
        }).get();
    }


    $('#search').click(function() {
        var suggestionBox = $('#suggestions');
        suggestionBox.empty();
        var forbidden = getMissingIngredients();
        $.ajax({
            url: '/search/',
            data: {
                   forbidden: forbidden
            },
            success: function(response) {
                $.map(response.drinks, function(drink) {
                  suggestionBox.append(
                    drinkTemplate.render({drink: drink.name,
                     data:drink.ingredients})
                  );
                });
                $('.drink').click(function() {
                  $('#drinkName').text($(this).text());
                  var ingredientBox = $('#drinkIngredients').empty();
                  var ingredients = $(this).attr('data-ingredients');
                  ingredients = ingredients.split(',');
                  $.map(ingredients, function(ingredient) {
                    ingredientBox.append(
                        ingredientTemplate.render({ingredient: ingredient})
                    );
                  });
                  $('.ingredient').click(function() {
                      appendMissing($(this).text())
                  });
                });
            },
            error: function(error) {
                console.log(error);
            }
        });
    });


    $('#missingbutton').click(function() {
        appendMissing($('#missinginput').val());
    });
});