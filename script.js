const activate = function(cell) {
    cell.addClass("active");
    cell.removeClass("inactive");
};

const deactivate = function(cell) {
    cell.addClass("inactive");
    cell.removeClass("active");
};

const onclick = function(eventObject) {
    const cell = $(this);
    if(cell.hasClass("inactive")) {
        activate(cell);
    } else if(cell.hasClass("active")) {
        deactivate(cell);
    }
};

//assigns the onclick handler to all of the cells
const setup = function() {
    $(".cell").click(onclick);
};

//runs the setup when the DOM is ready
$(setup);