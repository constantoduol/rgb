

    function showHelp() {
        var window = document.getElementById("alert-window");
        if (!window) {
            var html = "<div class='modal' id='alert-window' style='background : #F0FFFF'>" +
            "<div class='modal-dialog'>" +
            "<div class='modal-content'>" +
            "<div class='modal-header'>" +
            "<h4 class='modal-title' id='modal-title'></h4>" +
            "</div>" +
            "<div class='modal-body' id='modal-content'>" +
            "</div>" +
            "<div class='modal-footer'>" +
            "<button type='button' class='btn btn-default' data-dismiss='modal' id='cancel_func'>Ok</button>" +

            "</div>" +
            "</div><!-- /.modal-content -->" +
            "</div><!-- /.modal-dialog -->" +
            "</div><!-- /.modal -->";
            $("body").append(html);
        }
       
        $("#modal-title").html("Colors combine as shown below, use the arrow keys or swipe(touchscreen) to navigate and fill the grid with 15 cyan colored tiles");
        var html = $("#instr").html();
        $("#modal-content").html(html);
        $("#alert-window").modal();

    }

    function showPopup(title,msg) {
        var window = document.getElementById("alert-window");
        if (!window) {
            var html = "<div class='modal' id='alert-window' style='background : #F0FFFF'>" +
            "<div class='modal-dialog'>" +
            "<div class='modal-content'>" +
            "<div class='modal-header'>" +
            "<h4 class='modal-title' id='modal-title'></h4>" +
            "</div>" +
            "<div class='modal-body' id='modal-content'>" +
            "</div>" +
            "<div class='modal-footer'>" +
            "<button type='button' class='btn btn-default' data-dismiss='modal' id='cancel_func'>Ok</button>" +

            "</div>" +
            "</div><!-- /.modal-content -->" +
            "</div><!-- /.modal-dialog -->" +
            "</div><!-- /.modal -->";
            $("body").append(html);
        }

        $("#modal-title").html(title);
        $("#modal-content").html(msg);
        $("#alert-window").modal();
    }


    function shareToTimeline(message) {
        FB.ui({
            method: 'feed',
            name: 'RGB Color game',
            link: "https://quest-cloud.appspot.com/games/rgb/",
            picture: 'https://quest-cloud.appspot.com/games/rgb/img/splash.png',
            description: message
        },
                  function (response) {
                      if (response && response.post_id) {
                          showPopup("Success", "Post was published to your facebook timeline successfully");
                      } else {
                          showPopup("Error", "Whoops an error occurred! post was not shared to your facebook timeline");
                      }
                  });
    }


    function Grid() {
        this.grid = [[null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]];
        this.nextList = ["red", "green", "blue"];
        this.direction = { up: 1, down: 2, right: 3, left: 4 }; // 1 = up, 2 = down, 3 = left to right, 4 = right to left
    }

    function Tile(value, row, col, state) {
        this.value = value; // red,green,blue,cyan,magenta,yellow
        this.row = row;
        this.col = col;
        this.state = state; //merged or new
    }
    


    Grid.prototype.init = function () {
        var grid = document.getElementById("grid");
        grid.innerHTML = "";
        var table = document.createElement("table");
        table.setAttribute("id","grid-table");
        for (var x = 0; x < 4; x++) {
            var rowId = "row-" + x;
            var row = document.createElement("tr");
            row.setAttribute("id", rowId);
            for (var y = 0; y < 4; y++) {
                var cellId = "cell-" + x + "-" + y;
                var cell = document.createElement("td");
                cell.setAttribute("class", "cell");
                cell.setAttribute("id", cellId);
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        grid.appendChild(table);
        this.resize();
        window.onresize = this.resize;
        this.showMessage("You Lose")
    };

    Grid.prototype.run = function () {
        this.nextTile();
        this.nextTile();
        new KeyboardInputManager();
    };






    Grid.prototype.addColors = function (color1, color2) {
        if ((color1 === "cyan" && color2 === "cyan") || (color1 === "cyan" && color2 === "cyan")) {
            return undefined
        }

        else if (color1 === color2) {
            return color1;
        }
        else if ((color1 === "red" && color2 === "blue") || (color1 === "blue" && color2 === "red")) {
            return "magenta";
        }
        else if ((color1 === "blue" && color2 === "green") || (color1 === "green" && color2 === "blue")) {
            return "cyan";
        }
        else if ((color1 === "red" && color2 === "green") || (color1 === "green" && color2 === "red")) {
            return "yellow";
        }
        else if ((color1 === "magenta" && color2 === "yellow") || (color1 === "yellow" && color2 === "magenta")) {
            return "red";
        }

        else if ((color1 === "yellow" && color2 === "cyan") || (color1 === "cyan" && color2 === "yellow")) {
            return "green";
        }
        else if ((color1 === "cyan" && color2 === "magenta") || (color1 === "magenta" && color2 === "cyan")) {
            return "blue";
        }

    };

    Grid.prototype.merge = function (arr, dir) {
        if (dir === this.direction.up || dir === this.direction.left) {
            for (var x = 0; x < 4; x++) {
                var next = x === 3 ? 3 : x + 1;
                var nextTile = arr[next];
                var currentTile = arr[x];
                if (nextTile && currentTile && x < 3) {
                    var newValue = this.addColors(currentTile.value, nextTile.value);
                    if (!newValue)
                        continue;
                    arr[next] = new Tile(newValue, nextTile.row, nextTile.col, "merged");
                    arr[x] = null;
                    x++;
                }
            }
        }
        else {
            for (var x = 3; x >= 0; x--) {
                var next = x === 0 ? 0 : x - 1;
                var nextTile = arr[next];
                var currentTile = arr[x];
                if (nextTile && currentTile && x > 0) {
                    var newValue = this.addColors(currentTile.value, nextTile.value);
                    if (!newValue)
                        continue;
                    arr[next] = new Tile(newValue, nextTile.row, nextTile.col, "merged");
                    arr[x] = null;
                    x--;
                }
            }
        }
    };






    Grid.prototype.move = function (dir) { //the move criteria is percolate, merge, percolate
        var moved = false;
        if (dir === this.direction.left || dir === this.direction.right) {
            for (var x = 0; x < 4; x++) {
                var percolated1 = this.percolate(this.grid[x], dir);
                this.merge(percolated1, dir);
                var percolated = this.percolate(percolated1, dir);
                var similar = this.compare(percolated, this.grid[x]); // if there was any motion, these two won't be the same
                if (similar === false)
                    moved = true;
                this.grid[x] = percolated;
                for (var y = 0; y < percolated.length; y++) {
                    //actuate the array i.e set the colors of the tiles
                    var tile = percolated[y];
                    if (tile) {
                        tile.col = y; // the column has changes since we are moving left or right
                        this.setColor(tile.value, tile.row, tile.col, tile.state);
                    }
                    else {
                        //set all other tiles to light gray
                        this.setColor("lightgray", x, y, "motion");
                    }
                }
            }
        }
        else {
            for (var y = 0; y < 4; y++) {
                var temp = [];
                for (var x = 0; x < 4; x++) {
                    temp.push(this.grid[x][y]); // e.g grid[0][0]; grid[1][0];  grid[2][0]; grid[3][0];
                }

                var percolated1 = this.percolate(temp, dir);
                this.merge(percolated1, dir);
                var percolated = this.percolate(percolated1, dir);
                var similar = this.compare(percolated, temp); //if there was any motion, these two wont be the same
                if (similar === false)
                    moved = true;

                for (var x = 0; x < 4; x++) {
                    var tile = percolated[x];
                    this.grid[x][y] = tile;
                    if (tile) {
                        tile.row = x; //the tile has been moved to another row so change it
                        this.setColor(tile.value, tile.row, tile.col, tile.state); //actuate the array i.e set the colors of the tiles
                    }
                    else {
                        //set all other tiles to lightgray
                        this.setColor("lightgray", x, y, "motion");
                    }
                }
            }
        }
        //console.log(notMoved);
     
        if (moved) {
            this.nextTile();
            this.toString();
        }
        this.checkWin(moved);
      
    };


    Grid.prototype.setColor = function (color, row, col, state) {
        var id = "cell-" + row + "-" + col;
        var label = color.charAt(0).toUpperCase();
        var cell = document.getElementById(id);
        cell.style.background = color;
        window.requestAnimationFrame(function () {
            if (state === "new") {
                this.grid.addClass(cell, "tile-new");
                this.grid.runLater(500, function () {
                    window.grid.removeClass(cell, "tile-new");
                    if (window.grid.grid[row][col])
                        window.grid.grid[row][col].state = undefined;
                });
            }
            else if (state === "merged") {
                this.grid.addClass(cell, "tile-merged");
                this.grid.runLater(500, function () {
                    window.grid.removeClass(cell, "tile-merged");
                    if (window.grid.grid[row][col])
                        window.grid.grid[row][col].state = undefined;
                });
            }
            else if (state === "motion") {
                this.grid.addClass(cell, "motion");
                this.grid.runLater(500, function () {
                    window.grid.removeClass(cell, "motion");
                    if (window.grid.grid[row][col])
                        window.grid.grid[row][col].state = undefined;
                });
            }
        });

        if (label === "L") {
            cell.innerHTML = "";
        }
        else {
            cell.innerHTML = label;
        }
    };

    Grid.prototype.checkWin = function (moved) {
        var emptyTiles = [];
        var cyanTiles = [];
       // var mergePossible = false;
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
            	/*
                var next = y === 3 ? 3 : y + 1;
                if (this.grid[x][y] && this.grid[x][next]) {
                    var color = this.addColors(this.grid[x][y].value, this.grid[x][next].value);
                    
                    if( color ){
                        mergePossible = true;
                    }
                }

                if (this.grid[y][x] && this.grid[next][x]) {
                    var color = this.addColors(this.grid[y][x].value, this.grid[next][x].value);
                    
                    if (color) {
                        mergePossible = true;
                    }
                }
            	*/


                if (!this.grid[x][y]) {
                    var emptyTile = {};
                    emptyTile.row = x;
                    emptyTile.col = y;
                    emptyTiles.push(emptyTile);
                }
                else if (this.grid[x][y].value === "cyan") {
                    var cyanTile = {};
                    cyanTile.row = x;
                    cyanTile.col = y;
                    cyanTiles.push(cyanTile);
                }
            }
        }

        if (cyanTiles.length === 15) {
            this.showMessage("You Win!");
            return;
        }
        else if (emptyTiles.length === 0) {
        	console.log("you lose");
            this.showMessage("Game Over!");
            return;
        }
        if (moved) {
            var score = (cyanTiles.length / 16) * 160;
            var currentScore = document.getElementById("current-score").innerHTML;
            var bestScore = document.getElementById("best-score").innerHTML;
            currentScore = parseInt(currentScore) + parseInt(score);
            document.getElementById("current-score").innerHTML = currentScore;
            if (currentScore > bestScore) {
                bestScore = parseInt(bestScore) + parseInt(score);
                document.getElementById("best-score").innerHTML = bestScore;
                document.getElementById("current-score").innerHTML = bestScore;
            }
            window.localStorage.setItem("best-score", bestScore);
        }
    };

    Grid.prototype.clone = function (arr) {
        var temp = [];
        for (var x = 0; x < arr.length; x++) {
            temp[x] = arr[x];
        }
        return temp;
    };

    Grid.prototype.compare = function (arr1, arr2) {
        var similar = true;
        for (var x = 0; x < arr1.length; x++) {
            if (arr1[x] !== arr2[x]) {
                similar = false;
                break;
            }
        }
        return similar;
    };

    Grid.prototype.percolate = function (arr, dir) {
        //percolating down is the same as left to right
        //percolating up is the same as right to left
        var temp = [];
        var len = arr.length;
        var limit = len;
        for (var x = 0; x < limit; x++) {
            if (x < len) {
                var tile = arr[x];
                if (tile)
                    temp.push(tile);
                if (x === (len - 1))
                    limit = limit + (len - temp.length);
            }
            else {
                if (dir === this.direction.up || dir === this.direction.left) {
                    temp.push(null);
                }
                else {
                    temp.unshift(null);
                }
            }
        }
        return temp;
    };



    Grid.prototype.nextTile = function () {
        var nextIndex = Math.floor(Math.random() * this.nextList.length);
        var emptyTiles = [];
        var nextValue = this.nextList[nextIndex];
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                if (!this.grid[x][y]) {
                    var emptyTile = {};
                    emptyTile.row = x;
                    emptyTile.col = y;
                    emptyTiles.push(emptyTile);
                }
            }
        }

        if (emptyTiles.length === 0) {
            return;
        }
        var nextLocation = Math.floor(Math.random() * emptyTiles.length);
        var row = emptyTiles[nextLocation].row;
        var col = emptyTiles[nextLocation].col;
        var tile = new Tile(nextValue, row, col, "new");
        this.grid[row][col] = tile;
        this.setColor(tile.value, tile.row, tile.col, tile.state);
        
        return tile;

    };

    Grid.prototype.runLater = function (limit, func) {
        return setTimeout(func, limit);
    };

    Grid.prototype.addClass = function (elem, clazz) {
        var currentClasses = elem.getAttribute("class");
        if (!currentClasses) {
            currentClasses = "";
        }
        if (currentClasses.indexOf(clazz) === -1) {
            currentClasses = currentClasses + " " + clazz;
            elem.setAttribute("class", currentClasses);
        }
    };

    Grid.prototype.removeClass = function (elem, clazz) {
        var currentClasses = elem.getAttribute("class");
        currentClasses = currentClasses.replace(clazz, "").trim();
        elem.setAttribute("class", currentClasses);
    };

    Grid.prototype.toString = function () {
        for (var x = 0; x < 4; x++) {
            var val1 = 0, val2 = 0, val3 = 0, val4 = 0;
            if (this.grid[x][0]) {
                val1 = this.grid[x][0].value.charAt(0).toUpperCase();
            }
            if (this.grid[x][1]) {

                val2 = this.grid[x][1].value.charAt(0).toUpperCase();
            }
            if (this.grid[x][2]) {

                val3 = this.grid[x][2].value.charAt(0).toUpperCase();
            }
            if (this.grid[x][3]) {
                val4 = this.grid[x][3].value.charAt(0).toUpperCase();
            }
            console.log(val1 + "	" + val2 + "	" + val3 + "	" + val4);
        }
        console.log("\n");

    };


    Grid.prototype.getDim = function () {
        var body = window.document.body;
        var screenHeight;
        var screenWidth;
        if (window.innerHeight) {
            screenHeight = window.innerHeight;
            screenWidth = window.innerWidth;
        }
        else if (body.parentElement.clientHeight) {
            screenHeight = body.parentElement.clientHeight;
            screenWidth = body.parentElement.clientWidth;
        }
        else if (body && body.clientHeight) {
            screenHeight = body.clientHeight;
            screenWidth = body.clientWidth;
        }
        return [screenWidth, screenHeight];
    };

    Grid.prototype.resize = function () {
    	if(mobilecheck()){
    		return;
    	}
        var maxHeight = window.screen.availHeight;
        var maxWidth = window.screen.availWidth;
        var currentHeight = window.grid.getDim()[1];
        var currentWidth = window.grid.getDim()[0];
        var grid = document.getElementById("grid");
        var instr = document.getElementById("instr");
        var scores = document.getElementById("scores");
        var gameMessage = document.getElementById("message");
        var coreInst = document.getElementById("core-instr");
        var cells = document.getElementsByClassName("cell");
        var gridTable = document.getElementById("grid-table");
        var belowGrid = document.getElementById("below-grid");
        var fontSize = (currentHeight/maxHeight)*40+"px";
        var coreInstrFontSize = (currentHeight/maxHeight)*20+"px";
    	var width = 0.36*currentWidth;
        gridTable.style.height = width+"px";
        gridTable.style.width = width+"px";
        grid.style.width = width+"px";
        instr.style.width = width+"px";
        gameMessage.style.marginTop = 0.39*currentHeight+"px";
        gameMessage.style.fontSize = fontSize;
        var marginLeft = (currentWidth - 0.4*currentWidth) / 2;
        
        grid.style.marginLeft = marginLeft + "px";
        instr.style.marginLeft = marginLeft + "px";
        coreInst.style.marginLeft = marginLeft + "px";
        coreInst.style.fontSize = coreInstrFontSize;
        scores.style.marginLeft = marginLeft + "px";
        belowGrid.style.marginLeft = marginLeft + "px";
        belowGrid.style.fontSize = coreInstrFontSize;
        var cellHeight = (width/4.5)+"px";
        var borderSpacing = (currentHeight/maxHeight)*10+"px";
        gridTable.style.borderSpacing = borderSpacing;
        for (var x = 0; x < cells.length; x++) {
            cells[x].style.height = cellHeight;
            cells[x].style.width = cellHeight;
            cells[x].style.fontSize = fontSize;
        }    
        
    };

    Grid.prototype.showMessage = function (msg) {
        document.getElementById("win-or-lose").innerHTML = msg;
        var gmsg = document.getElementById("game-message");
        this.addClass(gmsg, "message-anim");
        gmsg.style.display = "block";
        this.runLater(1000, function () {
            window.grid.removeClass(gmsg, "message-anim");
        });
    }

    Grid.prototype.cyanTest = function () {
        var time = setInterval(function () {
            if (false) {
                clearInterval(time);
            }
            else {
                var nextMove = Math.floor(Math.random() * 4) + 1;
                this.grid.move(nextMove);
            }
        }, 400);
    };
    
  function mobilecheck() {
   	 var check = false;
   	 (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
   	 return check;
  }
