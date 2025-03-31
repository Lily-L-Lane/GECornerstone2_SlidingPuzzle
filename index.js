var rows = 6;
var columns = 6;

var curTile;
var otherTile;

var turns = 0;

window.onload = function() {
    for (let r=0; r < rows; r++) {
        let tile = document.createElement("img");
        tile.id = r.toString() + "-" + columns.toString();
        tile.src = imgOrder.shift() + "jpg";

        document.getElementsById("board").append(tile);
    }
}
