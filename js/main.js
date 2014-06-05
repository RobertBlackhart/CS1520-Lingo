/**
 * Created by master on 4/10/14.
 */

var currentGuess = 1;
var currentWord = 1;
var words = [];
var timer;
var timeLeft = 10;
var numRoundsTotal = 0, numRoundsWon = 0, numPuzzlesTotal = 0, numPuzzlesWon = 0, puzzlesWonThisRound = 0;

var nextRound;
var nextPuzzle;

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

function main()
{
	if(!localStorage.getItem("name"))
	{
		var name = prompt("What is your name");
		localStorage.setItem("name", name);
	}
	else
		var name = localStorage.getItem("name");

	if(localStorage.getItem("numRoundsTotal"))
		numRoundsTotal = localStorage.getItem("numRoundsTotal");
	if(localStorage.getItem("numRoundsWon"))
		numRoundsWon = localStorage.getItem("numRoundsWon");
	if(localStorage.getItem("numPuzzlesTotal"))
		numPuzzlesTotal = localStorage.getItem("numPuzzlesTotal");
	if(localStorage.getItem("numPuzzlesWon"))
		numPuzzlesWon = localStorage.getItem("numPuzzlesWon");

	$("#NumRoundsTotal").text(numRoundsTotal);
	$("#NumRoundsWon").text(numRoundsWon);
	$("#NumPuzzlesTotal").text(numPuzzlesTotal);
	$("#NumPuzzlesWon").text(numPuzzlesWon);

	$("#Username").text("Welcome " + name + "!");

	$("#Guess").keypress(function(e)
	{
		if(e.keyCode == 13)
		{
			doGuess();
		}
	});

	nextRound = $("#NextRound");
	nextRound.click(function(){
		$("#WinLoseMessage").toggle();
		nextRound.toggle();
		$("#Guess").focus();
		getWords();
	});

	nextPuzzle = $("#NextPuzzle");
	nextPuzzle.click(function(){
		$("#WinLoseMessage").toggle();
		nextPuzzle.toggle();
		clearTimeout(timer);
		$("#PuzzleNumber").text("Puzzle: " + currentWord + "/5");
		$("#Guess").focus();
		loadGame();
	});

	getWords();
}

function getWords()
{
	$("#NumRoundsTotal").text(++numRoundsTotal);
	localStorage.setItem("numRoundsTotal",numRoundsTotal);

	puzzlesWonThisRound = 0;
	$("#NumWins").text("Won: " + puzzlesWonThisRound + "/3");
	$.getJSON("getWords.php", function(data)
	{
		currentGuess = 1;
		currentWord = 1;
		$("#PuzzleNumber").text("Puzzle: " + currentWord + "/5");
		words = data;
		loadGame(data);
	});
}

function doGuess()
{
	if($("#WinLoseMessage").is(':visible'))
		return;

	var guessInput = $("#Guess");
	var guess = guessInput.val();
	guessInput.val("");

	if(guess.length < 5)
	{
		for(var i=guess.length; i<5; i++)
			guess += "#";
	}

	if(guess.length > 5)
		guess = guess.substr(0,5);

	var guessContains = words[currentWord-1];

	var row = $("#GuessTable tr").eq(currentGuess);

	for(i = 0; i < 5; i++)
	{
		var result = document.createElement('span');
		result.id = "cell" + i + "_" + currentGuess;
		result.innerHTML = guess.charAt(i);
		row.find("td").eq(i).append(result);
	}

	var rightList = [];

	//check for right-right
	for(i = 0; i < 5; i++)
	{
		if(guess.charAt(i) == words[currentWord - 1].charAt(i))
		{
			console.log(guess.charAt(i) + " matched at position " + i);

			$("#cell"+i+"_"+currentGuess).addClass("RightLetterRightPlace");
			guessContains = guessContains.replace(guess.charAt(i), "#");
			rightList.push(i);
		}
	}

	//right-wrong
	for(i = 0; i < 5; i++)
	{
		if($.inArray(i,rightList) != -1)
			continue;

		if(words[currentWord - 1].contains(guess.charAt(i)) && guessContains.contains(guess.charAt(i)))
		{
			console.log(guess.charAt(i) + " is contained in " + guessContains);

			guessContains = guessContains.replace(guess.charAt(i), "#");
			$("#cell"+i+"_"+currentGuess).addClass("RightLetterWrongPlace");
		}
		else
			$("#cell"+i+"_"+currentGuess).addClass("WrongLetter");
	}

	if(rightList.length == 5)
	{
		timeLeft = 10;
		clearTimeout(timer);
		var winLoseMessage = $("#WinLoseMessage");
		winLoseMessage.toggle();
		winLoseMessage.text("You guessed correctly!");
		$("#NumPuzzlesWon").text(++numPuzzlesWon);
		localStorage.setItem("numPuzzlesWon",numPuzzlesWon);

		puzzlesWonThisRound++;
		$("#NumWins").text("Won: " + puzzlesWonThisRound + "/3");
		if(puzzlesWonThisRound == 3)
		{
			$("#NumRoundsWon").text(++numRoundsWon);
			localStorage.setItem("numRoundsWon",numRoundsWon);

			currentWord = 6;
			displayNextPuzzleButton();
			return;
		}
		displayNextPuzzleButton();
		return;
	}
	else
	{
		currentGuess++;
		if(currentGuess > 5)
		{
			var winLoseMessage = $("#WinLoseMessage");
			winLoseMessage.toggle();
			winLoseMessage.text("Sorry, the correct word was " + words[currentWord-1]);
			timeLeft = 10;
			clearTimeout(timer);
			displayNextPuzzleButton();
			return;
		}
	}

	timeLeft = 10;
	clearTimeout(timer);
	timer = setTimeout(doCountdown,1000);
	$("#Timer").text(timeLeft + " sec");
}

function displayNextPuzzleButton()
{
	currentWord++;
	if(currentWord > 5)
	{
		nextRound.toggle();
		nextRound.focus();
	}
	else
	{
		nextPuzzle.toggle();
		nextPuzzle.focus();
	}
}

function loadGame()
{
	$("#NumPuzzlesTotal").text(++numPuzzlesTotal);
	localStorage.setItem("numPuzzlesTotal",numPuzzlesTotal);

	currentGuess = 1;
	$("#GuessTable tr td").text("");
	alert("TA cheat guide\n\ncurrent word: " + words[currentWord - 1]);
	$("#GuessTable tr td").eq(0).text(words[currentWord - 1].substring(0, 1));
	$("#GuessTable tr td").eq(0).addClass("RightLetterRightPlace");

	timer = setTimeout(doCountdown,1000);
	$("#Timer").text(timeLeft + " sec");
}

function doCountdown()
{
	timeLeft--;
	if(timeLeft < 0)
	{
		timeLeft = 10;
		doGuess();
		$("#Guess").val('');
		return;
	}

	$("#Timer").text(timeLeft + " sec");
	timer = setTimeout(doCountdown,1000);
}