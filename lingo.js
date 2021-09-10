var ballsConfigurations = [
	[[12, 26, 4, 10, 28, 8, 16, 30, 22, 14, 47, 18, 2, 24, 6, 26], [8, 30, 28, 24, 4, 18, 6, 2, 22, 47, 10, 20, 16, 12, 26, 14], [6, 47, 12, 8, 30, 26, 10, 16, 4, 18, 28, 14, 22, 20, 2, 24]],
	[[5, 27, 3, 17, 25, 1, 13, 9, 19, 47, 23, 21, 11, 7, 15, 29], [29, 9, 27, 47, 5, 25, 21, 11, 1, 3, 17, 15, 13, 23, 19, 7], [21, 1, 9, 29, 5, 17, 11, 13, 19, 27, 15, 47, 23, 25, 7, 3]]
];
var initialBalls = [
	[1, 4, 6, 11, 14], [2, 5, 6, 11, 12], [0, 7, 9, 10, 13]
];
var teamNames = ['Links', 'Rechts'];
var ballsIndex = [0, 0];
var wordLetterCount = [];
var currentIndex = -1;
var guesses = 5;
var currentGuess, currentLetter;
var bestGuess = [];
var active = 0;
var score = [0, 0];
var errors = 0;
var randomLetterTimerTimeout = null;
	
function initialize() {
	for (var i = 0; i < words.length; i++) {
		wordLetterCount.push(countLetters(words[i]));
	}
	
	showBalls(0);
	createBallsTable(0, function () {
		showBalls(1);
		createBallsTable(1, function () {
			hideBalls();
			
			updateScore();
			nextWord();
		});
	});
}

function initializeBoard (len) {
	var tenLetters = (len >= 10);
	$('#board').html('');
	currentGuess = 0, currentLetter = 0;
	
	for (var i = 0; i < (tenLetters ? 1 : guesses); i++) {
		$tr = $('<tr>');
		for (var j = 0; j < len; j++) {
			$tr.append($('<td class="letter" data-guess="' + i + '" data-place="' + j + '">' + (i == 0 ? bestGuess[j] : '') + '</td>'));
		}
		$('#board').append($tr);
	}
}

function countLetters (word) {
	var letters = {};
	for (var i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
		letters[String.fromCharCode(i)] = 0;
	}
	for (var i = 0; i < word.length; i++) {
		letters[word[i]] ++;
	}
	return letters;
}

function nextWord() {
	currentIndex ++;
	errors = 0;
	
	if (currentIndex < words.length) {
		bestGuess = [];
		//bestGuess.push(words[currentIndex][0]);
		for (var i = 0; i < words[currentIndex].length; i++) {
			bestGuess.push('.');
		}
		hideBalls();
		if (words[currentIndex].length >= 10) {
			giveRandomLetter();
			giveRandomLetter();
		} else {
			giveNextLetter();
		}
		initializeBoard(words[currentIndex].length);
		ion.sound.play('eerste letter');
	} else {
		hideBalls();
		$('#board').hide();
	}
}

function getBall(team, row, col) {
	return $('#balls' + team + ' td[data-row="' + row + '"][data-col="' + col + '"]');
}
function getElement(guess, letter) {
	return $('td[data-guess="' + guess + '"][data-place="' + letter + '"]');
}
function writeAtPosition(guess, letter, content) {
	getElement(guess, letter).html(content);
}
function getAtPosition(guess, letter) {
	return getElement(guess, letter).html();
}
function toggleClassAtPosition(guess, letter, c) {
	getElement(guess, letter).toggleClass(c);
}
function addClassAtPosition(guess, letter, c) {
	getElement(guess, letter).addClass(c);
}

function writeLetter (letter) {
	if (currentLetter < words[currentIndex].length) {
		writeAtPosition(currentGuess, currentLetter, letter);
		currentLetter ++;
	}
}

function deleteLetter() {
	if (currentLetter > 0) {
		currentLetter --;
		writeAtPosition(currentGuess, currentLetter, bestGuess[currentLetter]);
	}
}

function checkCorrect(position, guessedLetter) {
	return words[currentIndex][position] == guessedLetter;
}
function containsLetter(guessedLetter) {
	if (guessCount < count) {
		return words[currentIndex].indexOf(guessedLetter) >= 0;
	}
	return false;
}

function updateScore() {
	for (var i = 0; i <= 1; i++) {
		$('#score' + i).html(score[i]);
	}
}
function setActive (a) {
	active = a;
	$('.active').removeClass('active');
	$('#score' + active).parent().addClass('active');
}
function switchActive() {
	setActive(1 - active);
}

function checkWord () {
	if (currentLetter == words[currentIndex].length) {
		var guessedLetter;
		var tenLetterWord = (words[currentIndex].length >= 10);
		var correctWord = true;
		var letters = {}, place = {};
		var evaluation = [];
		for (var i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
			letters[String.fromCharCode(i)] = 0;
			place[String.fromCharCode(i)] = 0;
		}
		for (var i = 0; i < words[currentIndex].length; i++) {
			evaluation.push('wrong');
		}
		
		for (var i = 0; i < words[currentIndex].length; i++) {
			guessedLetter = getAtPosition(currentGuess, i).toUpperCase();
			if (!checkCorrect(i, guessedLetter)) {
				correctWord = false;
			} else {
				letters[guessedLetter] ++;
				if (!tenLetterWord) {
					bestGuess[i] = guessedLetter;
				}
				evaluation[i] = 'right';
			}
		}
		if (!tenLetterWord) {
			for (var i = 0; i < words[currentIndex].length; i++) {
				guessedLetter = getAtPosition(currentGuess, i).toUpperCase();
				
				if (!checkCorrect(i, guessedLetter)) {
					var count = 0;
					for (var j = 0; j < i; j++) {
						if (getAtPosition(currentGuess, j).toUpperCase() == guessedLetter) {
							count ++;
						}
					}
					if (place[guessedLetter] < (wordLetterCount[currentIndex][guessedLetter] - letters[guessedLetter])) {
						evaluation[i] = 'place';
						place[guessedLetter] ++;
					}
				}
			}
			updateLetterClasses(evaluation, correctWord ? processCorrectWord : processIncorrectWord);
		} else {
			if (correctWord) {
				updateLetterClasses(evaluation, processCorrectWord);
			} else {
				currentLetter = 0;
				for (var j = 0; j < words[currentIndex].length; j++) {
					writeAtPosition(currentGuess, j, bestGuess[j]);
					getElement(currentGuess, j).attr('class', 'letter');
				}
				switchActive();
			}
		}
	}
}

function updateLetterClasses (evaluation, callback) {
	var letterIndex = 0;
	function updateLetter () {
		if (evaluation[letterIndex] == 'right') {
			addClassAtPosition(currentGuess, letterIndex, 'silver');
			ion.sound.play('goede letter');
		} else if (evaluation[letterIndex] == 'place'){
			addClassAtPosition(currentGuess, letterIndex, 'yellow');
			ion.sound.play('place letter');
		} else {
			ion.sound.play('foute letter');
		}
		 
		letterIndex ++;
		if (letterIndex < words[currentIndex].length) {
			setTimeout(updateLetter, 180);
		} else {
			callback();
		}
	}
	updateLetter();
}

function processCorrectWord() {
	if (errors < 2) {
		if (words[currentIndex].length >= 10) {
			var numGiven = 0;
			for (var i = 0; i < words[currentIndex].length; i++) {
				if (bestGuess[i] != '.') {
					numGiven ++;
				}
			}
			score[active] += 110 - 10 * numGiven;
		} else {
			score[active] += 25;
		}
		
		updateScore();
	}
	
	ion.sound.play('goed woord');
	setTimeout(function () {
		if (errors < 2 && words[currentIndex].length < 10) {
			showBalls(active);
		} else {
			nextWord();
		}
	}, 2900);
}

function processIncorrectWord () {
	var tenLetterWord = (words[currentIndex].length >= 10);
	currentGuess ++;
	
	currentLetter = 0;
	if (currentGuess == guesses) {
		if (errors == 0) {
			for (var i = 0; i < guesses - 1; i++) {
				for (var j = 0; j < words[currentIndex].length; j++) {
					getElement(i, j).attr('class', getElement(i + 1, j).attr('class'));
					writeAtPosition(i, j, getAtPosition(i + 1, j));
				}
			}
			
			giveNextLetter();
			
			currentGuess --;
			switchActive();
			errors ++;
		} else {
			for (var i = 0; i < words[currentIndex].length; i++) {
				bestGuess[i] = words[currentIndex][i];
			}
			currentLetter = words[currentIndex].length;
			currentGuess --;
			
			errors ++;
		}
	}
	for (var j = 0; j < words[currentIndex].length; j++) {
		writeAtPosition(currentGuess, j, bestGuess[j]);
		getElement(currentGuess, j).attr('class', 'letter');
	}
}

function randomInt(mi, ma) {
	return Math.floor((Math.random() * (ma - mi + 1)) + mi);
}

function giveNextLetter() {
	for (var i = 0; i < words[currentIndex].length; i++) {
		if (bestGuess[i] != words[currentIndex][i]) {
			bestGuess[i] = words[currentIndex][i];
			break;
		}
	}
}
function giveRandomLetter() {
	var unknownLetters = [];
	for (var i = 0; i < words[currentIndex].length; i++) {
		if (bestGuess[i] == '.') {
			unknownLetters.push(i);
		}
	}
	if (unknownLetters.length == 0) {
		return;
	}
	var givingIndex = unknownLetters[randomInt(0, unknownLetters.length - 1)];
	bestGuess[givingIndex] = words[currentIndex][givingIndex];
	writeAtPosition(currentGuess, givingIndex, bestGuess[givingIndex]);
}
function startRandomLetterTimer() {
	randomLetterTimerTimeout = setTimeout(function () {
		giveRandomLetter();
		startRandomLetterTimer();
	}, 5000);
}
function stopRandomLetterTimer() {
	clearTimeout(randomLetterTimerTimeout);
	randomLetterTimerTimeout = null;
}

function createBallsTable (team, callBack) {
	var $html = $('<table></table>');
	for (var i = 0; i < 4; i++) {
		var $row = $('<tr></tr>');
		for (var j = 0; j < 4; j++) {
			$row.append('<td data-team="' + team + '" data-row="' + i + '" data-col="' + j + '"><span class="ballContent">' + ballsConfigurations[team][ballsIndex[team]][i*4 + j] + '</span></td>');
		}
		$html.append($row);
	}
	
	$('#balls' + team).html($html.html()).append('<span class="description">Team ' + teamNames[team] + '</span>');
	var crossOutIndex = 0;
	function animation () {
		if (crossOutIndex == 5) {
			$('#balls' + team + ' td').click(function () {
				toggleBall($(this));
			});
			$('#balls' + team + ' .description').click(nextWord);
			ballsIndex[team] = (ballsIndex[team] + 1) % 3;
			
			callBack();
		} else {
			var ball = initialBalls[ballsIndex[team]][crossOutIndex];
			toggleBall(getBall(team, parseInt(ball / 4), ball % 4));
			
			crossOutIndex ++;
			setTimeout(animation, 500);
		}
	}
	animation();
}

function showBalls (team) {
	$('.balls').hide();
	$('#balls' + team).show();
	$('.content').hide();
}

function hideBalls () {
	$('.balls').hide();
	$('.content').show();
}

function toggleBall ($ball) {
	$ball.toggleClass('yellow');
	$('.red').removeClass('red');
	if (checkForLingo($ball.data('team'))) {
		$('#balls' + $ball.data('team') + ' .description').html('LINGO!');
		ion.sound.play('goed woord');
		setTimeout(function () {
			createBallsTable($ball.data('team'), nextWord);
		}, 2900);
	} else {
		checkForLingoBall($ball.data('team'));
	}
}

function checkForLingo(team) {
	var $ball;
	var count;
	var lastWithoutYellow = null;
	var hasLingo = false;
	for (var i = 0; i < 4; i++) {
		count = 0;
		for (var j = 0; j < 4; j++) {
			$ball = getBall(team, i, j);
			if ($ball.hasClass('yellow')) {
				count ++;
			}
		}
		hasLingo = hasLingo || (count == 4);
		count = 0;
		for (var j = 0; j < 4; j++) {
			$ball = getBall(team, j, i);
			if ($ball.hasClass('yellow')) {
				count ++;
			}
		}
		hasLingo = hasLingo || (count == 4);
	}
	count = 0;
	for (var j = 0; j < 4; j++) {
		$ball = getBall(team, j, j);
		if ($ball.hasClass('yellow')) {
			count ++;
		}
	}
	hasLingo = hasLingo || (count == 4);
	count = 0;
	for (var j = 0; j < 4; j++) {
		$ball = getBall(team, j, 4 - j - 1);
		if ($ball.hasClass('yellow')) {
			count ++;
		}
	}
	hasLingo = hasLingo || (count == 4);
	
	if (hasLingo) {
		score[active] += 80;
		updateScore();
		return true;
	}
	return false;
}
function checkForLingoBall(team) {
	var $ball;
	var count;
	var lastWithoutYellow = null;
	for (var i = 0; i < 4; i++) {
		count = 0;
		for (var j = 0; j < 4; j++) {
			$ball = getBall(team, i, j);
			if ($ball.hasClass('yellow')) {
				count ++;
			} else {
				lastWithoutYellow = $ball;
			}
		}
		if (count == 3) {
			lastWithoutYellow.addClass('red');
		}
		count = 0;
		for (var j = 0; j < 4; j++) {
			$ball = getBall(team, j, i);
			if ($ball.hasClass('yellow')) {
				count ++;
			} else {
				lastWithoutYellow = $ball;
			}
		}
		if (count == 3) {
			lastWithoutYellow.addClass('red');
		}
	}
	count = 0;
	for (var j = 0; j < 4; j++) {
		$ball = getBall(team, j, j);
		if ($ball.hasClass('yellow')) {
			count ++;
		} else {
			lastWithoutYellow = $ball;
		}
	}
	if (count == 3) {
		lastWithoutYellow.addClass('red');
	}
	count = 0;
	for (var j = 0; j < 4; j++) {
		$ball = getBall(team, j, 4 - j - 1);
		if ($ball.hasClass('yellow')) {
			count ++;
		} else {
			lastWithoutYellow = $ball;
		}
	}
	if (count == 3) {
		lastWithoutYellow.addClass('red');
	}
}

function buzzer () {
	ion.sound.play('buzz');
	giveRandomLetter();
}

$(function () {
	$('.balls, .content').hide();
	var sounds = [
		{name: 'eerste letter'},
		{name: 'fout woord'},
		{name: 'goed woord'},
		{name: 'goede letter'},
		{name: 'foute letter'},
		{name: 'place letter'},
		{name: 'buzz'},
	];
	var loadedSounds = 0;
	
	ion.sound({
		sounds: sounds,
		path: "sounds/",
		preload: true,
		volume: 1.0,
		ready_callback: function (sound) {
			loadedSounds ++;
			console.log('Sound loaded:', sound);
			
			if (loadedSounds == sounds.length) {
				initialize();
			}
		},
	});
});
$('html').keyup(function (e) {
	var key = e.which;
	var character = String.fromCharCode(key);
	if (/*('a' <= character && character <= 'z') || */('A' <= character && character <= 'Z')) {
		writeLetter (character);
	} else if (key == 220 || key == 8) { // Delete and backspace
		e.preventDefault();
		deleteLetter();
	} else if (key == 13) { // Enter
		checkWord();
	} else if (key == 32) { // Spacebar
		switchActive();
	} else if (key == 192) { // Backtick (`)
		buzzer();
		switchActive();
	} else if (key == 49) { // "1"
		if (randomLetterTimerTimeout == null) {
			startRandomLetterTimer();
		} else {
			stopRandomLetterTimer();
		}
	} else if (key == 50) { // "2"
		score[active] += 47;
		updateScore();
	}
	if (e.preventDefault) e.preventDefault();
	if (e.preventPropagation) e.preventPropagation();
	return false;
});