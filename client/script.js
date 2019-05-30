const WIDTH = 8;
const NUMBERS = [".one", ".two", ".three", ".four", ".five", ".six", ".seven", ".eight"];
const NOTES = [["C", 5], ["G", 4], ["E", 4], ["C", 4], ["G", 3], ["E", 3], ["C", 3]];
let piano;
let cells = [];

const swapClasses = function(cell, removeClass, addClass) {
    cell.addClass(addClass);
    cell.removeClass(removeClass);
}

//toggles a cell on
const activate = function(cell) {
    swapClasses(cell, "inactive", "active");
};

//toggles a cell off
const deactivate = function(cell) {
    swapClasses(cell, "active", "inactive");
};

//calls the server to toggle a cell on or off depending on its current state
const onclick = function(eventObject) {
    const cell = $(this);
    if(cell.hasClass("inactive")) {
        activate(cell); //change to server-interfacing code when appropriate
    } else if(cell.hasClass("active")) {
        deactivate(cell); //change to server-interfacing code when appropriate
    }
};

//shows the beat bar, duration in ms
const beatBar = function(duration, beat) {
    swapClasses(cells[beat], "offbeat", "onbeat");

    setTimeout(function() {
        swapClasses(cells[beat], "onbeat", "offbeat");
        beatBar(duration, (beat + 1) % WIDTH);
    }, duration);

    //play sounds
    cells[beat].each(function(index) {
        if($(this).hasClass("active")) {
            piano.play(NOTES[index][0], NOTES[index][1], duration / 1000);
        }
    });
};

//assigns the onclick handler to all of the cells
const setup = function() {
    //register with server
    
    $(".cell").click(onclick);

    for (var i = 0; i < 8; i++) {
        cells[i] = $(NUMBERS[i])
    }

    Synth.setVolume(0.20);
    piano = Synth.createInstrument('piano');

    beatBar(750, 0);
};

//runs the setup when the DOM is ready
$(setup);