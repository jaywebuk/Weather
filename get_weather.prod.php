<?php

if (!filter_has_var(INPUT_GET, "location"))
	header("location: ./");

$location = htmlspecialchars($_GET["location"], ENT_QUOTES);

if ($coords = json_decode(file_get_contents("http://api.openweathermap.org/geo/1.0/direct?q=$location&limit=1&appid={API-KEY}"))) {
	$lat = $coords[0]->lat;
	$lon = $coords[0]->lon;
	$name = $coords[0]->name;
	$country = $coords[0]->country;
	$weatherData = json_decode(file_get_contents("https://api.openweathermap.org/data/2.5/onecall?lat=" . $lat . "&lon=" . $lon . "&units=imperial&appid={API-KEY}"));
	$timeZone = $weatherData->timezone;
	date_default_timezone_set($timeZone);

	// Javascript sucks at dateTime so some pre-formatted times are set.

	$currentDate = date("l jS F", $weatherData->current->dt);
	$currentTime = date("H:i", $weatherData->current->dt);
	$sunrise = date("H:i", $weatherData->current->sunrise);
	$sunset = date("H:i", $weatherData->current->sunset);
	$next48 = $weatherData->hourly;
	$next7 = $weatherData->daily;
	$alertsArray = [];
	if (isset($weatherData->alerts)) {
		$alerts = $weatherData->alerts;
		foreach ($alerts as $key) {
			array_push($alertsArray, [
				"sender" => $key->sender_name,
				"event" => $key->event,
				"startDate" => date("D jS", $key->start),
				"startDateStamp" => $key->start,
				"startTime" => date("H:i", $key->start),
				"endDate" => date("D jS", $key->end),
				"endDateStamp" => $key->end,
				"endTime" => date("H:i", $key->end),
				"description" => $key->description
			]);
		}
	}

	$next48Array = [];
	$next7Array = [];
	foreach ($next48 as $key => $hourly) {
		array_push($next48Array, ["time" => date("H:i", $hourly->dt), "date" => date("j:n", $hourly->dt), "day" => date("D", $hourly->dt)]);
	}

	foreach ($next7 as $key => $daily) {
		array_push($next7Array, ["date" => date("D jS", $daily->dt), "dateTime" =>  $daily->dt, "sunrise" => date("H:i", $daily->sunrise), "sunset" => date("H:i", $daily->sunset)]);
	}

	echo json_encode(["name" => $name, "country" => $country, "currentDate" => $currentDate, "currentTime" => $currentTime, "sunrise" => $sunrise, "sunset" => $sunset, "weatherData" => $weatherData, "next48Hours" => $next48Array, "next7Days" => $next7Array, "alerts" => $alertsArray]);
} else {
	echo json_encode(["NotFound" => "NotFound"]);
}
