const WIDTH = 8;
const DURATION = 750;
const NUMBERS = [".one", ".two", ".three", ".four", ".five", ".six", ".seven", ".eight"];
const NOTES = [["C", 5], ["G", 4], ["E", 4], ["C", 4], ["G", 3], ["E", 3], ["C", 3]];
let piano;
const cells = [];
let socket;

//removes a class and adds a class to a cell
const swapClasses = function(cell, removeClass, addClass) {
    cell.addClass(addClass);
    cell.removeClass(removeClass);
};

//splits the cells' ids into [c,r] tuples
const splitID = function(cell) {
    return cell.attr('id').split(",");
};

const fetchCell = function(splitid) {
    return $("#[" + splitid[0] + "," + splitid[1] + "]");
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
const beatBar = function(duration, beat) {
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
            piano.play(NOTES[index][0], NOTES[index][1], duration / 1000);
        }
    });
};

//register with server
const setupSocket = function() {
    socket = io("https://soundgrid2.herokuapp.com/");
    socket.on("activate", function(splitid) {
        console.log("activate");
        activate(fetchCell(splitid));
    });
    socket.on("deactivate", function(splitid) {
        console.log("deactivate");
        deactivate(fetchCell(splitid));
    });
    socket.on("startBeat", () => {
        console.log("beatBar");
        beatBar()
    });
};

//assigns the onclick handler to all of the cells
const setup = function() {
    //collect cell references
    for (let i = 0; i < 8; i++) {
        cells[i] = $(NUMBERS[i])
    }

    //register with server
    setupSocket();
    
    //install onclick handlers
    $(".cell").click(onclick);

    //setup instrument
    Synth.setVolume(0.20);
    piano = Synth.createInstrument('piano');

    //start beat
    beatBar(DURATION, 0);
};

//runs the setup when the DOM is ready
$(setup);