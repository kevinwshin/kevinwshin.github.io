const WIDTH = 12;
const HEIGHT = 11;
const DURATION = 60 * 1000 / 80; //80 BPM
const NOTES = [["C", 5], ["A", 4], ["G", 4], ["E", 4], ["D", 4], ["C", 4], ["A", 3], ["G", 3], ["E", 3], ["D", 3], ["C", 3]];
let piano;
const cells = [];
let socket;

//removes a class and adds a class to a cell (or group of cells)
const swapClasses = function(cell, removeClass, addClass) {
    cell.addClass(addClass);
    cell.removeClass(removeClass);
};

//splits the cells' ids into [c,r] tuples
const splitID = function(cell) {
    return cell.attr('id').split(",");
};

//gets a cell based on its id
const fetchCell = function(splitid) {
    return $("#" + splitid[0] + "\\," + splitid[1]);
};

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
        activate(cell);
        socket.emit("activate", splitID(cell));
    } else if(cell.hasClass("active")) {
        deactivate(cell);
        socket.emit("deactivate", splitID(cell));
    }
};

//one sweep of the beat bar, beat duration in ms
const beatBar = function(duration=DURATION, beat=0) {
    swapClasses(cells[beat], "offbeat", "onbeat");

    //both turns off the beatbar and moves it to the next beat
    setTimeout(function() {
        swapClasses(cells[beat], "onbeat", "offbeat");
        if(++beat < WIDTH) {
            beatBar(duration, beat);
        }
    }, duration);

    //play sounds
    cells[beat].each(function(index) {
        if($(this).hasClass("active")) {
            piano.play(NOTES[index][0], NOTES[index][1], duration / 800);
        }
    });
};

//register with server
const setupSocket = function() {
    socket = io("https://soundgrid2.herokuapp.com/");
    socket.on("activate", function(splitid) {
        activate(fetchCell(splitid));
    });
    socket.on("deactivate", function(splitid) {
        deactivate(fetchCell(splitid));
    });
    socket.on("startBeat", beatBar);
    socket.on("setup", function(grid) {
        for(let i = 0; i < cells.length; i++) {
            cells[i].each(function(j) {
                if(grid[i][j]) {
                    activate($(this));
                }
            });
        }
    });
};

//assigns the onclick handler to all of the cells
const setup = function() {
    //collect cell references
    for(let i = 0; i < WIDTH; i++) {
        cells.push($(".grid > :nth-child(" + WIDTH + "n+" + (i + 1) + ")"));
    }

    //register with server
    setupSocket();
    
    //install onclick handlers
    $(".cell").click(onclick);

    //setup instrument
    Synth.setVolume(0.20);
    piano = Synth.createInstrument('piano');

    //start beat
    //beatBar();
};

//runs the setup when the DOM is ready
$(setup);
