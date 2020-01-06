/**
 * 
 */

$(document).ready(function() {
	splitter = $('.split-me').touchSplit({
		leftMax : 400,
		leftMin : 200,
		rightMin : 500,
		thickness : "5px",
		dock : "left"
	})
	splitter.getSecond().touchSplit({
		leftMin : 520,
		rightMin : 50,
		thickness : "5px",
		orientation : "vertical"
	})

	// Instance the tour
	var tour = new Tour({
		steps : [ {
			element : "#modelcanvas",
			title : "Model viewer",
			content : "Drag and rotate the model."
		}, {
			element : "#output-div",
			title : "Resize",
			content : "Resize the model viewer and output console."
		}, {
			element : "#model-input",
			title : "Inputs",
			content : "Input simulation parameters."
		}, {
			element : "#hetro",
			title : "Set heterogeneous regions",
			content : "Add regions with different permeabilities."
		}, {
			element : "#simulation-input",
			title : "Set run parameters",
			content : "Setup termination criteria and elapse time."
		} 
		
		],
		storage: false
	});

	// Initialize the tour
	tour.init();

	// Start the tour
	tour.start();
});