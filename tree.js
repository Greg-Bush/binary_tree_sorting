(function () {
    "use strict";

    var treeDiagram,
        greatGrandfather,
        initialArray,
        currentIndex,
        initialArrayTarget,
        resultArrayTarget,
        stack,
        currentNode,
        goLeftNext,
        nextStepButton;


    function NodeModel(index, number) {
        this.key = index + "";
        this.value = number * 1;
    }

    // добавление узла в дерево
    function AddNode(node) {

        if (!greatGrandfather) {
            // праотец
            greatGrandfather = node;
        }
        else {
            // рекурсивный поиск места под солнцем
            AddNodeTo(greatGrandfather, node);
        }

        ShowNode(node);
        HighlightNode(node);
    }

    function AddNodeTo(parent, node) {
        HighlightNodeTemporary(parent);
        if (node.value < parent.value) {
            if (!parent.left) {
                parent.left = node;
                node.parent = parent;
            }
            else {
                AddNodeTo(parent.left, node);
            }
        }
        else {
            if (!parent.right) {
                parent.right = node;
                node.parent = parent;
            }
            else {
                AddNodeTo(parent.right, node);
            }
        }
    }


    function TreeBuilding() {
        treeDiagram.clearHighlighteds(); // убираем прежнюю подсветку

        if (currentIndex < initialArray.length) {
            // пошаговое построение дерева
            HighlightArrayItem(initialArrayTarget, currentIndex);
            AddNode(new NodeModel(currentIndex, initialArray[currentIndex]));
            currentIndex++;
        }
        else {
            // приступаем к обходу
            currentIndex = 0;
            stack = [];
            currentNode = greatGrandfather;
            stack.push(currentNode);
            goLeftNext = true;
            nextStepButton.off().click(TreeTraveling);
            FadeToogle(initialArrayTarget.parent(), resultArrayTarget.parent());
            resultArrayTarget.empty();
        }
    }

    // обход дерева
    function TreeTraveling() {
        if (stack.length > 0) {
            treeDiagram.clearHighlighteds();

            if (goLeftNext) {
                while (currentNode.left) {
                    HighlightNodeTemporary(currentNode);
                    stack.push(currentNode);
                    currentNode = currentNode.left;
                }
            }

            HighlightNode(currentNode);
            AddListItem(resultArrayTarget, currentNode.value);
            HighlightArrayItem(resultArrayTarget, currentIndex++);

            if (currentNode.right) {
                currentNode = currentNode.right;
                goLeftNext = true;
            }
            else {
                currentNode = stack.pop();
                goLeftNext = false;
            }

        }
    }


    window.onload = function () {

        initDiagram();
        initialArrayTarget = $('#initialArray');
        resultArrayTarget = $('#resultArray');
        nextStepButton = $('#nextStepButton');

        $('#startingForm').submit(function () {
            var numbers = $('#numbersInput').val().match(/[0-9]+/g);  // получаем исходный массив

            if (!numbers) return;

            initialArray = numbers;

            // заметаем следы предыдущего массива
            initialArrayTarget.empty();
            greatGrandfather = null;
            currentIndex = 0;
            treeDiagram.model = new go.TreeModel();

            nextStepButton.off().click(TreeBuilding);

            for (var i = 0; i < initialArray.length; i++) {
                AddListItem(initialArrayTarget, initialArray[i]);
            }
            FadeToogle(resultArrayTarget.parent(), initialArrayTarget.parent());
            nextStepButton.delay(500).fadeIn(1000);

            return false;
        });

    }

    function initDiagram() {
        // инициализация диаграммы
        var $$ = go.GraphObject.make;

        var nodeTemplate =
            $$(go.Node, "Auto",
            new go.Binding("background", "isHighlighted", function (h) { return h ? "yellow" : null; }).ofObject(),
            new go.Binding("location", "location"),
            $$(go.TextBlock, {
                margin: 12,
                stroke: "black",
                font: "bold 16px sans-serif"
            },
            new go.Binding("text", "value")));

        var layout = $$(go.TreeLayout, {

            // для верного позиционирования левых и правых дочерних узлов
            sorting: go.TreeLayout.SortingAscending,
            comparer: function (a, b) {
                if (a.node.data.value < b.node.data.value) return -1;
                else return 1;
            },

            angle: 90
        });

        treeDiagram = $$(go.Diagram, "diagramArea", {
            initialContentAlignment: go.Spot.Top,
            nodeTemplate: nodeTemplate,
            layout: layout,
            model: $$(go.GraphLinksModel),
            allowDelete: false
        });
    }

    // визуализация узла
    function ShowNode(node) {
        var item = { key: node.key, value: node.value };
        if (node.parent) {
            item.parent = node.parent.key;
        }
        treeDiagram.model.addNodeData(item);
    }

    // подсветка узла
    function HighlightNode(node) {
        treeDiagram.findNodeForKey(node.key).isHighlighted = true;
    }

    // анимация поиска
    function HighlightNodeTemporary(node) {
        var item = treeDiagram.findNodeForKey(node.key);
        item.isHighlighted = true;
        setTimeout(function () {
            item.isHighlighted = false;
        }, 1000);
    }

    // подсветка ячейки массива
    function HighlightArrayItem(target, index) {
        var property = "background-color",
            childrens = target.children();
        childrens.css(property, "inherit");
        $(childrens[index]).css(property, "yellow");
    }

    function FadeToogle(hideTarget, showTarget) {
        hideTarget.fadeOut(500);
        showTarget.delay(500).fadeIn(1000);
    }

    function AddListItem(target, text) {
        var li = $('<li>', { text: text, class: "Hidden" });
        target.append(li);
        li.fadeIn(1000);
    }
})();