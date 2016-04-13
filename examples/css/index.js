
var demoDiv = document.getElementById('demodiv');
    
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

TINA.onUpdate(function update(t, dt) {
	// At this point, all my tweens are up to date for the current iteration
});

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

var duration = 2000;
var bouncing = 4;

// NOTE: The available CSS properties options are currently:
//       top, bottom, left, right, width, height and opacity
var csstween = new TINA.CSSTween(demodiv, ['top', 'width', 'opacity', 'height'])
.from({
    top: 50,
    width: 100,
    height: 100,
    opacity: 1
})
.to({
    top: 200,
    width: 200,
    height: 200,
    opacity: 0
}, 2000)
.iterations(Infinity)
.pingpong(true)
.start();
