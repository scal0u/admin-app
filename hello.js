var page = require('webpage').create();
page.open('http://inbox.google.com', function(status) {
	console.log("Status: " + status);
	if(status === "success") {
		page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
			page.evaluate(function() {
				$("#Email").val("pascalconges");
				$("form").submit();
			});
			// setTimeout(function() {
			// 	page.render('example.png');
			// 	phantom.exit();
			// }, 3000);
		});
		setTimeout(function() {
			page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
				page.evaluate(function() {
					$("#Passwd").val("grouistarck87");
					$("form").submit();
				});
			});
		}, 2000);
		setTimeout(function() {
			page.render('example.pdf');
			phantom.exit();
		}, 3000);
	};
});

