window.onload = function() {

    var ownedTemplate = Hogan.compile(
        '<p class="hoverparent haveitem">' +
        '<span class="hiddenuntilhover hiddenplus">+&nbsp</span>' +
        '<span class="itemtext">{{owned}}</span>' +
        '<span class="hiddenuntilhover hiddenminus">&nbsp-</span>' +
        '</p>'
    );

    var wantedTemplate = Hogan.compile(
        '<p class="wantitem hoverparent">' +
        '<span style="color: transparent">+&nbsp</span>' +
        '<span class="itemtext">{{want}}</span>' +
        '<span class="hiddenuntilhover hiddenminus">&nbsp-</span>' +
        '</p>'
    );

    function appendOwned(owned) {
        $('#have').append(ownedTemplate.render({owned: owned}));

    }

    function appendWanted(wanted) {
        $('#want').append(wantedTemplate.render({want: wanted}));
    }

    $(document).ready(function () {

        var drinkTemplate = Hogan.compile(
            '<p class=drink><a target="_blank" href="https://www.google.com/search?q=site:www.cocktaildb.com+{{drink}}">{{drink}}</a><span class="recipe">{{ingredients}}</span></p>'
        );

        var suggestedDrinkTemplate = Hogan.compile(
            '<p class=suggesteddrink><a target="_blank" href="https://www.google.com/search?q=site:www.cocktaildb.com+{{drink}}">{{drink}}</a><span class="recipe">{{ingredients}}</span></p>'
        );


        function getOwnedIngredients() {
            return $('.haveitem').map(function () {
                return $(this).children('.itemtext').text();
            }).get();
        }

        function getWantedIngredients() {
            return $('.wantitem').map(function () {
                return $(this).children('.itemtext').text();
            }).get();
        }

        $('#search').click(function () {
            var suggestionBox = $('#suggestions');
            suggestionBox.empty();
            var wanted = getWantedIngredients();
            var owned = getOwnedIngredients().concat(wanted);
            console.log(owned);
            $.ajax({
                url: '/search/',
                data: {
                    owned: owned,
                    //forbidden: forbidden,
                    required: wanted
                },
                success: function (response) {
                    $.map(response.cocktails, function (cocktail) {
                        var ingredientString = $.map(cocktail.recipe, function(d) { return d.ingredient; })
                            .join(', ');
                        suggestionBox.append(
                            $(drinkTemplate.render({drink: cocktail.name,
                            ingredients: ingredientString}))
                        );
                    });
                },
                error: function (error) {
                    console.log(error);
                }
            });


            var buyMoreBox = $('#buy');
            buyMoreBox.empty();
            $.ajax({
                    url: '/suggest/',
                    data: {
                        owned: owned
                    },
                    success: function (response) {
                        $('#buyMoreHeader').text("If you bought " + response.tobuy);

                        $.map(response.cocktails, function (cocktail) {
                            var ingredientString = $.map(cocktail.recipe, function(d) { return d.ingredient; })
                                .join(', ');
                            buyMoreBox.append(
                                $(suggestedDrinkTemplate.render({drink: cocktail.name,
                                    ingredients: ingredientString}))
                            );
                        });
                    },
                    error: function (error) {
                        console.log(error);
                    }
                }
            );

        });


        $('#havebutton').click(function () {
            var input = $('#haveinput');
            appendOwned(input.val());
            input.typeahead('val', '');
        });

        $('#wantbutton').click(function () {
            var input = $('#wantinput');
            appendWanted(input.val());
            input.typeahead('val', '');
        });


        window.ingredientList = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            limit: 15,
            prefetch: {
                url: '/ingredients/',
                filter: function (data) {
                    return $.map(data.ingredients, function (ingredient) {
                        return {value: ingredient};
                    });
                }
            }
        });
        ingredientList.initialize();

        $('.typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'ingredients',
                displayKey: 'value',
                source: ingredientList.ttAdapter()
            }
        );

        $("#haveinput").on('typeahead:selected', function () {
            $('#havebutton').click();
        });

        $("#wantinput").on('typeahead:selected', function () {
            $('#wantbutton').click();
        });
    });


    $(document).on("click", '.hiddenplus', function() {
        appendWanted($(this).siblings('.itemtext').text());
    });


    $(document).on("click", '.hiddenminus', function() {
        $(this).parent().remove();
    });

};