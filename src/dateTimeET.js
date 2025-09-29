//function dateNowFormattedET(){
const dateNowFormattedET = function(){
	let timeNow = new Date();
	const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
	return timeNow.getDate() + ". " + monthNamesET[timeNow.getMonth()] + " " + timeNow.getFullYear();
}

const timeNowFormattedET = function(){
	let timeNow = new Date();
	return timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();
}
const weekDayNowET = function(){
	let timeNow = new Date();
	const weekdayNamesET = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "nejapäev", "reede", "laupäev"];
	return weekdayNamesET[timeNow.getDay()];
}

const partOfDay = function(){
	let dayPart = "suvaline aeg";
	let hourNow = new Date().getHours();
	if(hourNow <= 6){
		dayPart = "varahommik";
	} else if (hourNow < 12) {
		dayPart = "hommik";
	} else if (hourNow == 12) {
		dayPart = "keskpäev";
	}
	return dayPart;
}

//ekspordin köik vajaliku
module.exports = {fullDate: dateNowFormattedET, fullTime: timeNowFormattedET, weekDay: weekDayNowET, partOfDay: partOfDay};

//kodutöö
console.log("Täna on " + weekDayNowET());