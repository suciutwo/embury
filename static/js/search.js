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


    function getWantedIngredients() {
        return $('.wantitem').map(function () {
            return $(this).children('.itemtext').text();
        }).get();
    }

    function getOwnedIngredients() {
        return $('.haveitem').map(function () {
            return $(this).children('.itemtext').text();
        }).get();
    }

    function appendOwned(owned) {
        if (owned === "") return;
        var alreadyOwned = getOwnedIngredients();
        if($.inArray(owned, alreadyOwned) === -1 ) {
            $('#have').append(ownedTemplate.render({owned: owned}));
        }
    }

    function appendWanted(wanted) {
        if (wanted === "") return;
        var alreadyWanted = getWantedIngredients();
        if ($.inArray(wanted, alreadyWanted) === -1) {
            $('#want').append(wantedTemplate.render({want: wanted}));
        }
    }

    $(document).ready(function () {

        var drinkTemplate = Hogan.compile(
            '<p class=drink><a target="_blank" href="https://www.google.com/search?q=site:www.cocktaildb.com+{{drink}}">{{drink}}</a><span class="recipe">{{ingredients}}</span></p>'
        );

        var suggestedDrinkTemplate = Hogan.compile(
            '<p class=suggesteddrink><a target="_blank" href="https://www.google.com/search?q=site:www.cocktaildb.com+{{drink}}">{{drink}}</a><span class="recipe">{{ingredients}}</span></p>'
        );

        var buyMoreTemplate = Hogan.compile(
            '<h3>If you buy {{tobuy}} </h3>'
        );

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


            var buyMoreBox = $('#buyMore');
            buyMoreBox.empty();
            $.ajax({
                    url: '/suggest/',
                    data: {
                        owned: owned,
                        required: wanted
                    },
                    success: function (response) {
                        $.map(response.suggestions, function (suggestion) {
                            buyMoreBox.append($(buyMoreTemplate.render({tobuy: suggestion.tobuy})));
                            $.map(suggestion.cocktails, function (cocktail) {
                                var ingredientString = $.map(cocktail.recipe, function (d) {
                                    return d.ingredient;
                                })
                                    .join(', ');
                                buyMoreBox.append(
                                    $(suggestedDrinkTemplate.render({
                                        drink: cocktail.name,
                                        ingredients: ingredientString
                                    }))
                                );
                            });
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