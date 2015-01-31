window.onload = function() {
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 960 - margin.right - margin.left,
        height = 800 - margin.top - margin.bottom;

    var i = 0,
        duration = 750,
        root;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var svg = d3.select(".d3container").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var drinkTemplate = Hogan.compile(
        '<p class=drink><a target="_blank" href="https://www.google.com/search?q=site:www.cocktaildb.com+{{drink}}">{{drink}}</a><span class="recipe">{{ingredients}}</span></p>'
    );
    
    d3.json("/static/tree.json", function (error, drink_tree) {
        
        root = drink_tree;
        root.x0 = height / 2;
        root.y0 = 0;

        root.children.forEach(collapse);
        update(root);
    });

    d3.select(self.frameElement).style("height", "800px");

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    //Clear out the #leaf-node-results and fill with 25 of the passed drinks
    function populateSidebarWithDrinks(drinks) {
        var sidebar = $('#leaf-node-results');
        sidebar.empty().hide();
        var shuffled_drinks = drinks.slice();
        var shuffled_drinks = d3.shuffle(shuffled_drinks).slice(0, 25);
        $.map(shuffled_drinks, function (drink) {
            sidebar.append(drinkTemplate
                    .render({'drink': drink})
            )
        });
        sidebar.show("slide");
    }
    
    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 180;
        });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", click);

        var nodeColorPicker = function (d) {
            if (d.drinks && d.drinks[0] != selected_node) {
                return "#272822";
            }
            return d._children ? "#272822" : "#E74C3C";
        };
        
        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", nodeColorPicker);
        

        nodeEnter.append("text")
            .attr("x", function (d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) {
                if (d.question) return d.question;
                if (d.title) return d.title;
                return "->";
            })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", nodeColorPicker);

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    var selected_node = null;
    
// Toggle children on click.
    function click(d) {
        if (d.children) { //collapse!
            collapse(d);
            //d._children = d.children;
            //d.children = null;
        } else { //extend!
            if (d.drinks) {
                selected_node = d.drinks[0];
                populateSidebarWithDrinks(d.drinks);
            }
            d.children = d._children;
            d._children = null;
        }
        update(d);

        setTimeout(function() {
            if (d.children && d.children.length == 1) {
                click(d.children[0]);
            }
        }, duration);
        
    }
};