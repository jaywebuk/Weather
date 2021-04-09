let warningShown = false;
let warningImage;

if ($("#alertHeader") !== null) {
	$("#alertHeader").on("click", () => {
		if (!warningShown) {
			$("#alertBody").show();
			$("#warning_arrow").attr("src", $("#warning_arrow").attr("src").replace("down", "up"));
			warningShown = true;
		} else {
			$("#alertBody").hide();
			$("#warning_arrow").attr("src", $("#warning_arrow").attr("src").replace("up", "down"));
			warningShown = false;
		}
	});
}

function convertTemp(temp) {
	let tempConvert = Math.round((temp - 32) * (5 / 9));
	return Object.is(tempConvert, -0) ? 0 : tempConvert;
}

function get_cardinals(deg) {
	let cardinals = {
		"north": [0, 11],
		"north-north-east": [11, 34],
		"north-east": [34, 56],
		"east-north-east": [56, 79],
		"east": [79, 101],
		"east-south-east": [101, 124],
		"south-east": [124, 146],
		"south-south-east": [146, 169],
		"south": [169, 191],
		"south-south-west": [191, 214],
		"south-west": [214, 236],
		"west-south-west": [236, 259],
		"west": [259, 281],
		"west-north-west": [281, 304],
		"north-west": [304, 326],
		"north-north-west": [326, 349],
		"N2": [349, 361],
	};

	for (const direction in cardinals) {
		if (deg >= cardinals[direction][0] && deg < cardinals[direction][1]) {
			return direction === "N2" ? "north" : direction;
		}
	}

	return false;
}

function get_wind(windSpeed) {
	let windDesc = {
		"a calm breeze": [0, 0],
		"light air": [1, 3],
		"a light breeze": [4, 7],
		"a gentle breeze": [8, 12],
		"a moderate breeze": [13, 18],
		"a fresh breeze": [19, 24],
		"a strong breeze": [25, 31],
		"high wind": [32, 38],
		"a gale force wind": [39, 46],
		"a strong gale": [47, 54],
		"storm winds": [55, 63],
		"a violent storm": [64, 72],
		"a hurricane": [73, 200],
	};

	for (const description in windDesc) {
		if (windSpeed >= windDesc[description][0] && windSpeed <= windDesc[description][1]) {
			return description;
		}
	}

	return false;
}

function toUpper(word) {
	if (typeof word.charAt === "function") {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}
	return word;
}

async function getWeather(city) {
	$("#loading").show();
	warningImage = "warning";

	let url = `get_weather.php?location=${city || "london"}`;

	let res = await fetch(url);
	let data = await res.json();

	if ("NotFound" in data) {
		$("#errorText").text(`${city} not found. Please try another location`);
		$("#details, .next24, .hourly-forecast, .daily-forecast, #alerts, #loading").hide();
		return false;
	} else {
		$("#errorText").text("");
		$("#details, .next24, .hourly-forecast, .daily-forecast").show();
	}

	let currentTimeData = {
		currentDate: data.currentDate,
		currentTime: data.currentTime,
		sunrise: data.sunrise,
		sunset: data.sunset,
	};

	let next48Hours = data.next48Hours;
	let next7Days = data.next7Days;

	if (currentTimeData.currentTime < currentTimeData.sunrise || currentTimeData.currentTime > currentTimeData.sunset) {
		$("#styleTime").attr("href", "css/style-night.css");
	} else {
		$("#styleTime").attr("href", "css/style-day.css");
	}

	$("#loading").hide();
	display_current_weather(data, currentTimeData);
	display_next_48Hours(data.weatherData.hourly, next48Hours);
	display_next_7Days(data.weatherData.daily, next7Days, data.alerts);

}

function display_current_weather(data, currentTimeData) {
	$("#alerts").hide();
	$("#warning").hide();
	let weather = data.weatherData.current;

	$("#locationName").text(`${data.name} (${data.country})`);
	$("#details, #hourly-forecast, #daily-forecast, .next24").css("visibility", "visible");

	let icon = weather.weather[0].icon;
	let descriptionNow = toUpper(weather.weather[0].description);
	let tempF = Math.round(weather.temp);
	let tempC = convertTemp(tempF);

	let tempFLike = Math.round(weather.feels_like);
	let tempCLike = convertTemp(tempFLike);

	let windSpeed = Math.round(weather.wind_speed);
	let windDeg = weather.wind_deg;
	let windDirection = get_cardinals(windDeg);
	let windDesc = get_wind(windSpeed);
	let sunrise = currentTimeData.sunrise;
	let sunset = currentTimeData.sunset;

	if ("wind_gust" in weather) {
		let windGust = Math.round(weather.wind_gust);
		$("#gusts").text("Gusts of " + windGust + " mph");
	} else {
		$("#gusts").text("");
	}

	$("#currentTime").text(`${currentTimeData.currentDate} ${currentTimeData.currentTime}`);

	$("#weatherDescription").text(
		descriptionNow + " with " + windDesc
	);

	$("#weather-icon").attr("src", "http://openweathermap.org/img/wn/" + icon + "@2x.png");

	$("#weather-icon").attr("title", descriptionNow);

	$("#currentTemp").html(tempC + "&deg;C / " + tempF + "&deg;F");
	$("#currentFeelsLike").html(tempCLike + "&deg;C / " + tempFLike + "&deg;F");


	$("#wind-speed").attr("style", "transform: rotate(" + windDeg + "deg)").attr("title", `From the ${windDirection}`);

	$("#windSpeed").text(windSpeed + "mph");

	$("#sunrise").text(sunrise);
	$("#sunset").text(sunset);

	$("#alertBody").html("");

	if (data.alerts.length) {
		warningImage = "warning";
		$("#warning").removeClass("severeWarning");
		data.alerts.forEach((alert, i) => {
			if (alert.event.match(/\bhurricane\b|\btornado\b|\bthunder|storm\b/gi) || alert.description.match(/\bhurricane\b|\btornado\b|\bthunder|storm\b/gi)) {
				warningImage = "warning_severe";
				$("#warning").addClass("severeWarning");
			}

			$("#alertBody").append($("<article>", {
				"id": `alert${i}`,
				"class": "alert"
			}));

			$(`#alert${i}`).append([
				$("<p>", {
					"class": "alertEvent"
				}).text(`${alert.startDate} ${alert.startTime} to ${alert.endDate} ${alert.endTime}`),
				$("<p>").text(`${alert.sender}`),
				$("<p>", {
					"class": "alertEvent"
				}).text(`Alert: ${alert.event}`),
				$("<p>", {
					"class": "alertDescription"
				}).text(`${alert.description}`)
			]);

			$("#alertBody").append("<hr>");

		});

		$("#warning").attr("src", `img/${warningImage}.png`);
		$("#alerts, #warning").css("display", "block");
	} else {
		$("#alerts, #warning").hide();
	}
}

function display_next_48Hours(weather48, next48Hours) {
	weather48 = weather48.slice(1);
	let today = `${next48Hours[0].date}`;

	next48Hours = next48Hours.slice(1);

	$("#hourly-forecast").html("");
	
	weather48.forEach((hourly, i) => {
		// let currentTime = next48Hours.time;

		let icon = hourly.weather[0].icon;
		let description = toUpper(hourly.weather[0].description);
		let windSpeed = Math.round(hourly.wind_speed);
		let windDeg = hourly.wind_deg;
		let tempF = Math.round(hourly.temp);
		let tempC = convertTemp(tempF);
		let fellsLikeF = Math.round(hourly.feels_like);
		let feelsLikeC = convertTemp(fellsLikeF);
		let dateTime = next48Hours[i].date;
		let pressure = hourly.pressure;
		let precipitation = hourly.pop;

		$("#hourly-forecast").append($("<article>", {
			"id": `hour${i}`,
			"class": "forecast-hour",
			"title": "Click to Expand / Collapse"
		}));

		$(`#hour${i}`).append($("<p>", {
			"id": `showMorehour${i}`,
			"class": "showMore"
		}).text(">"));

		if (`${dateTime}` == today) {
			$(`#hour${i}`).append($("<p>").text(`${next48Hours[i].time}`));
		} else {
			$(`#hour${i}`).append($("<p>").text(`${next48Hours[i].day} ${next48Hours[i].time}`));
		}

		$(`#hour${i}`).append([
			$("<img>", {
				"class": "hourly-icon",
				"src": `http://openweathermap.org/img/wn/${icon}.png`,
				"alt": "Weather Icon",
				"title": `${description}`
			}),
			$("<section>", {
				"id": `hourlyWind${i}`,
				"class": "wind",
				"title": `${toUpper(get_wind(windSpeed))} from the ${get_cardinals(windDeg)}`
			})
		]);

		$(`#hourlyWind${i}`).append([
			$("<img>", {
				"class": "wind-direction",
				"src": "img/wind.png",
				"alt": "Wind",
				"style": `transform: rotate(${windDeg}deg)`
			}),
			$("<p>").text(`${windSpeed} mph`)
		]);

		$(`#hour${i}`).append($("<p>").html(`${tempC}&deg;C / ${tempF}&deg;F`));
		$("#hourly-forecast").append($("<article>", {
			"id": `detailshour${i}`,
			"class": "hourly-details"
		}));

		$(`#detailshour${i}`).append([
			$("<p>").text(`${description}`),
			$("<p>").text(`${toUpper(get_wind(windSpeed))} from the ${get_cardinals(windDeg)}`),
			$("<p>").html(`Feels Like: ${feelsLikeC}&deg;C / ${fellsLikeF}&deg;F`),
			$("<p>").text(`Pressure: ${pressure} mb`),
			$("<p>").text(`Chance of Precipitation: ${Math.round(precipitation * 100)}%`)
		]);

	});

	let previousHourly = 0;
	let previousHourlyDetails;
	let previousHourlyShowMore;

	$(".forecast-hour").on("click", function () {
		let hour = $(this)[0].id;

		if (previousHourly != 0) {
			$(previousHourly).css("background-color", "");
			$(previousHourlyDetails).hide();
			previousHourlyShowMore.text(">");
		}
		if ($(this)[0] == previousHourly[0]) {
			$(this).css("background-color", "");
			$(`#details${hour}`).hide();
			$(`#showMore${hour}`).text(">");
			previousHourly = 0;
		} else {
			$(this).css("background-color", $(`#details${hour}`).css("background-color"));
			if ($(this).offset().left < $(this).parent().offset().left && window.screen.width > 420) {
				$(`#details${hour}`).show()
				$(this)[0].scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "nearest",
				});
			} else {
				$(`#details${hour}`).show()[0].scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "nearest",
				});
			}

			$(`#showMore${hour}`).text("<");
			previousHourly = $(this);
			previousHourlyDetails = $(`#details${hour}`);
			previousHourlyShowMore = $(`#showMore${hour}`);
		}
	});
}

function display_next_7Days(weather7, next7Days, alerts) {

	weather7 = weather7.slice(1);
	next7Days = next7Days.slice(1);

	$("#daily-forecast").html("");
	weather7.forEach((daily, i) => {
		let icon = daily.weather[0].icon;
		let description = toUpper(daily.weather[0].description);
		let windSpeed = Math.round(daily.wind_speed);
		let windDeg = daily.wind_deg;
		let dayTempF = Math.round(daily.temp.day);
		let dayTempC = convertTemp(dayTempF);
		let nightTempF = Math.round(daily.temp.night);
		let nightTempC = convertTemp(nightTempF);
		let dayFeelsLikeF = Math.round(daily.feels_like.day);
		let dayFeelsLikeC = convertTemp(dayFeelsLikeF);
		let nightFeelsLikeF = Math.round(daily.feels_like.night);
		let nightFeelsLikeC = convertTemp(nightFeelsLikeF);
		let dateTime = next7Days[i].date;
		let dateTimeStamp = next7Days[i].dateTime;
		let sunrise = next7Days[i].sunrise;
		let sunset = next7Days[i].sunset;
		let pressure = daily.pressure;

		$("#daily-forecast").append($("<article>", {
			"id": `day${i}`,
			"class": "forecast-day",
			"title": "Click to Expand / Collapse"
		}));

		$(`#day${i}`).append([
			$("<p>", {
				"id": `showMoreday${i}`,
				"class": "showMore"
			}).text(">"),
			$("<p>").text(`${dateTime}`)
		]);

		if (alerts) {
			for (let jj = 0; jj < alerts.length; jj++) {
				if (dateTimeStamp >= alerts[jj].startDateStamp && dateTimeStamp <= alerts[jj].endDateStamp) {
					$(`#day${i}`).append($("<img>", {
						"class": "warningDaily",
						"src": `img/${warningImage}.png`,
						"title": "Weather alerts issued for today. See &quot;Weather Alerts&quot;"
					}));
					break;
				}
			}
		}

		$(`#day${i}`).append([
			$("<img>", {
				"class": "daily-icon",
				"src": `http://openweathermap.org/img/wn/${icon}.png`,
				"alt": "Weather Icon",
				"title": `${description}`
			}),
			$("<section>", {
				"id": `dailyWind${i}`,
				"class": "wind",
				"title": `${toUpper(get_wind(windSpeed))} from the ${get_cardinals(windDeg)}`
			})
		]);

		$(`#dailyWind${i}`).append([
			$("<img>", {
				"class": "wind-direction",
				"src": "img/wind.png",
				"alt": "Wind",
				"style": `transform: rotate(${windDeg}deg)`
			}),
			$("<p>").text(`${windSpeed} mph`)
		]);

		$(`#day${i}`).append([
			$("<section>", {
				"id": `daily-temp${i}`,
				"class": "daily-temp"
			}),
			$("<section>", {
				"id": `night-temp${i}`,
				"class": "daily-temp"
			})
		]);

		$(`#daily-temp${i}`).append([
			$("<img>", {
				"src": "img/sun.png",
				"alt": "Day Temp Icon"
			}),
			$("<p>").html(`${dayTempC}&deg;C / ${dayTempF}&deg;F`)
		]);

		$(`#night-temp${i}`).append([
			$("<img>", {
				"src": "img/moon.png",
				"alt": "Night Temp Icon"
			}),
			$("<p>").html(`${nightTempC}&deg;C / ${nightTempF}&deg;F`)
		]);

		$("#daily-forecast").append($("<article>", {
			"id": `detailsday${i}`,
			"class": "daily-details"
		}));

		$(`#detailsday${i}`).append([
			$("<p>").text(`${description}`),
			$("<p>").text(`${toUpper(get_wind(windSpeed))} from the ${get_cardinals(windDeg)}`),
			$("<p>").html(`<p>Day Feels Like: ${dayFeelsLikeC}&deg;C / ${dayFeelsLikeF}&deg;F`),
			$("<p>").html(`Night Feels Like: ${nightFeelsLikeC}&deg;C / ${nightFeelsLikeF}&deg;F`),
			$("<p>").text(`Pressure: ${pressure} mb`),
			$("<p>").text(`Sunrise: ${sunrise} / Sunset: ${sunset}`)
		]);
	});

	let previousDaily = 0;
	let previousDailyDetails;
	let previousDailyShowMore;
	
	$(".forecast-day").on("click", function () {
		let day = $(this)[0].id;

		if (previousDaily != 0) {
			$(previousDaily).css("background-color", "");
			$(previousDailyDetails).hide();
			previousDailyShowMore.text(">");
		}
		if ($(this)[0] == previousDaily[0]) {
			$(this).css("background-color", "");
			$(`#details${day}`).hide();
			$(`#showMore${day}`).text(">");
			previousDaily = 0;
		} else {
			$(this).css("background-color", $(`#details${day}`).css("background-color"));
			if ($(this).offset().left < $(this).parent().offset().left && window.screen.width > 420) {
				$(`#details${day}`).show()
				$(this)[0].scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "nearest",
				});
			} else {
				$(`#details${day}`).show()[0].scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "nearest",
				});
			}
			$(`#showMore${day}`).text("<");
			previousDaily = $(this);
			previousDailyDetails = $(`#details${day}`);
			previousDailyShowMore = $(`#showMore${day}`);
		}
	});

}