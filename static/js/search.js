window.onload = function() {
    $(document).ready(function () {

        var drinkTemplate = Hogan.compile(
            '<p class=drink>{{drink}}</p>'
        );

        var suggestedDrinkTemplate = Hogan.compile(
            '<p class=suggesteddrink>{{drink}}</p>'
        );

        var ingredientTemplate = Hogan.compile(
            '<p class=ingredient>{{ingredient}}</p>'
        );

        var missingTemplate = Hogan.compile(
            '<p class=missingitem>{{missing}}</p>'
        );

        var ownedTemplate = Hogan.compile(
            '<p class=haveitem>{{owned}}</p>'
        );

        var wantedTemplate = Hogan.compile(
            '<p class=wantitem>{{want}}</p>'
        );

        function appendMissing(missing) {
            $('#missing').append(missingTemplate.render({missing: missing}));
            $('.missingitem').click(function () {
                $(this).remove()
            });
        }

        function appendOwned(owned) {
            $('#have').append(ownedTemplate.render({owned: owned}));
            $('.haveitem').click(function () {
                $(this).remove()
            });
        }

        function appendWanted(wanted) {
            $('#want').append(wantedTemplate.render({want: wanted}));
            $('.wantitem').click(function () {
                $(this).remove()
            });
        }


        function getMissingIngredients() {
            return $('.missingitem').map(function () {
                return $(this).text();
            }).get();
        }

        function getOwnedIngredients() {
            return $('.haveitem').map(function () {
                return $(this).text();
            }).get();
        }

        function getWantedIngredients() {
            return $('.wantitem').map(function () {
                return $(this).text();
            }).get();
        }


        $('#search').click(function () {
            var suggestionBox = $('#suggestions');
            suggestionBox.empty();
            var forbidden = getMissingIngredients();
            var owned = getOwnedIngredients();
            var wanted = getWantedIngredients();
            $.ajax({
                url: '/search/',
                data: {
                    owned: owned,
                    forbidden: forbidden,
                    required: wanted
                },
                success: function (response) {
                    $.map(response.cocktails, function (cocktail) {
                        suggestionBox.append(
                            $(drinkTemplate.render({drink: cocktail.name}))
                                .data("recipe", cocktail.recipe)
                        );
                    });
                    $('.drink').click(function () {
                        $('#drinkName').text($(this).text());
                        var ingredientBox = $('#drinkIngredients').empty();
                        var instructions = $(this).data("recipe");
                        $.map(instructions, function (instruction) {
                            ingredientBox.append(
                                ingredientTemplate.render({ingredient: instruction.ingredient})
                            );
                        });
                        $('.ingredient').click(function () {
                            appendMissing($(this).text())
                        });
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
                            buyMoreBox.append(
                                $(suggestedDrinkTemplate.render({drink: cocktail.name}))
                                    .data("recipe", cocktail.recipe)
                            );
                        });
                        $('.suggesteddrink').click(function () {
                            $('#drinkName2').text($(this).text());
                            var ingredientBox = $('#drinkIngredients2').empty();
                            var ingredients = $(this).data("recipe");
                            $.map(ingredients, function (instruction) {
                                ingredientBox.append(
                                    ingredientTemplate.render({ingredient: instruction.ingredient})
                                );
                            });
                            $('.ingredient').click(function () {
                                appendMissing($(this).text())
                            });
                        });
                    },
                    error: function (error) {
                        console.log(error);
                    }
                }
            );

        });


        $('#missingbutton').click(function () {
            var input = $('#missinginput');
            appendMissing(input.val());
            input.typeahead('val', '');
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

        $("#haveinput").on('typeahead:selected', function (e, data) {
            $('#havebutton').click();
        });

        $("#wantinput").on('typeahead:selected', function (e, data) {
            $('#wantbutton').click();
        });

        $("#missinginput").on('typeahead:selected', function (e, data) {
            $('#missingbutton').click();
        });


    });
};